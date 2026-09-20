package com.antaris.backend.service;

import com.antaris.backend.entity.Alert;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.AlertRepository;
import com.antaris.backend.repository.StationRepository;
import com.antaris.backend.simulator.TelemetrySimulatorService;
import com.antaris.backend.simulator.TelemetrySnapshot;
import com.antaris.backend.websocket.TelemetryUpdatedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AlertEngineService {

    private static final String AUTOMATIC_RULE_ENGINE =
            "AUTOMATIC_RULE_ENGINE";

    private final TelemetrySimulatorService telemetrySimulatorService;
    private final AlertRepository alertRepository;
    private final StationRepository stationRepository;

    public AlertEngineService(
            TelemetrySimulatorService telemetrySimulatorService,
            AlertRepository alertRepository,
            StationRepository stationRepository
    ) {
        this.telemetrySimulatorService = telemetrySimulatorService;
        this.alertRepository = alertRepository;
        this.stationRepository = stationRepository;
    }

    /**
     * Manually evaluates the current simulator telemetry.
     *
     * This method only evaluates the current state.
     * It does not persist alerts.
     */
    public List<Map<String, String>> evaluateCurrentTelemetry() {

        TelemetrySnapshot snapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        return evaluateTelemetry(snapshot);
    }

    /**
     * Automatically evaluates every new telemetry snapshot.
     *
     * Persistent alert lifecycle:
     *
     * 1. Active condition -> create alert if no active
     *    alert for the same condition exists.
     *
     * 2. Condition continues -> do not create duplicate.
     *
     * 3. Condition disappears -> mark existing alert inactive.
     *
     * 4. Condition appears again -> create a new alert.
     *
     * The complete operation is transactional so that lazy
     * Station relationships can safely be accessed while the
     * alert lifecycle is being processed.
     */
    @EventListener
    @Transactional
    public void onTelemetryUpdated(
            TelemetryUpdatedEvent event
    ) {

        TelemetrySnapshot snapshot =
                event.snapshot();

        if (snapshot == null) {
            return;
        }

        List<Map<String, String>> alerts =
                evaluateTelemetry(snapshot);

        /*
         * Build the set of conditions that are currently
         * active for this station.
         */
        Set<String> currentConditionKeys =
                buildConditionKeys(alerts);

        /*
         * Resolve database alerts whose underlying condition
         * is no longer present.
         */
        resolveInactiveAlerts(
                snapshot.getStationCode(),
                currentConditionKeys
        );

        /*
         * Create only new active conditions.
         */
        for (Map<String, String> alertData : alerts) {

            saveAlertIfNew(
                    snapshot,
                    alertData
            );
        }
    }

    /**
     * Applies rule-based alert detection.
     */
    private List<Map<String, String>> evaluateTelemetry(
            TelemetrySnapshot snapshot
    ) {

        List<Map<String, String>> alerts =
                new ArrayList<>();

        if (snapshot == null) {
            return alerts;
        }

        String station =
                snapshot.getStationCode();

        /*
         * =========================
         * BATTERY ALERTS
         * =========================
         */

        if (isLessThan(
                snapshot.getBatteryPercentage(),
                20
        )) {

            alerts.add(Map.of(
                    "type", "BATTERY",
                    "severity", "CRITICAL",
                    "title", "Critical Battery Level",
                    "message",
                    "Battery level is critically low",
                    "station", station
            ));

        } else if (isLessThan(
                snapshot.getBatteryPercentage(),
                35
        )) {

            alerts.add(Map.of(
                    "type", "BATTERY",
                    "severity", "WARNING",
                    "title", "Low Battery Level",
                    "message",
                    "Battery level is low",
                    "station", station
            ));
        }

        /*
         * =========================
         * FUEL ALERTS
         * =========================
         */

        if (isLessThan(
                snapshot.getFuelPercentage(),
                15
        )) {

            alerts.add(Map.of(
                    "type", "FUEL",
                    "severity", "CRITICAL",
                    "title", "Critical Fuel Level",
                    "message",
                    "Fuel level is critically low",
                    "station", station
            ));

        } else if (isLessThan(
                snapshot.getFuelPercentage(),
                30
        )) {

            alerts.add(Map.of(
                    "type", "FUEL",
                    "severity", "WARNING",
                    "title", "Low Fuel Level",
                    "message",
                    "Fuel level is low",
                    "station", station
            ));
        }

        /*
         * =========================
         * ENERGY ALERTS
         * =========================
         */

        if (isLessThan(
                snapshot.getPowerBalanceKw(),
                0
        )) {

            alerts.add(Map.of(
                    "type", "ENERGY",
                    "severity", "CRITICAL",
                    "title", "Negative Power Balance",
                    "message",
                    "Station power balance is negative",
                    "station", station
            ));
        }

        /*
         * =========================
         * GENERATOR ALERTS
         * =========================
         */

        if (isGreaterThan(
                snapshot.getGeneratorLoadPct(),
                90
        )) {

            alerts.add(Map.of(
                    "type", "GENERATOR",
                    "severity", "CRITICAL",
                    "title", "Critical Generator Load",
                    "message",
                    "Generator load is critically high",
                    "station", station
            ));

        } else if (isGreaterThan(
                snapshot.getGeneratorLoadPct(),
                80
        )) {

            alerts.add(Map.of(
                    "type", "GENERATOR",
                    "severity", "WARNING",
                    "title", "High Generator Load",
                    "message",
                    "Generator load is high",
                    "station", station
            ));
        }

        /*
         * =========================
         * ENVIRONMENT ALERTS
         * =========================
         */

        if (isLessThan(
                snapshot.getTemperatureC(),
                -30
        )) {

            alerts.add(Map.of(
                    "type", "ENVIRONMENT",
                    "severity", "CRITICAL",
                    "title", "Extreme Low Temperature",
                    "message",
                    "Extreme low temperature detected",
                    "station", station
            ));
        }

        return alerts;
    }

    /**
     * Saves an automatic alert only if there is no
     * currently active alert for the same condition.
     *
     * Database state is the source of truth.
     */
    private void saveAlertIfNew(
            TelemetrySnapshot snapshot,
            Map<String, String> alertData
    ) {

        String stationCode =
                alertData.get("station");

        String alertType =
                alertData.get("type");

        String severity =
                alertData.get("severity");

        String alertKey =
                buildConditionKey(
                        stationCode,
                        alertType,
                        severity
                );

        /*
         * Query persistent state instead of relying on
         * an in-memory HashSet.
         */
        boolean alreadyActive =
                alertRepository
                        .findBySourceAndActiveTrue(
                                AUTOMATIC_RULE_ENGINE
                        )
                        .stream()
                        .anyMatch(alert ->
                                alertKey.equals(
                                        buildConditionKey(
                                                alert.getStation().getCode(),
                                                alert.getAlertType(),
                                                alert.getSeverity()
                                        )
                                )
                        );

        if (alreadyActive) {
            return;
        }

        Station station =
                stationRepository
                        .findByCode(stationCode)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Station not found: "
                                                + stationCode
                                )
                        );

        Alert alert =
                new Alert();

        alert.setStation(station);

        alert.setAlertType(
                alertType
        );

        alert.setSeverity(
                severity
        );

        alert.setTitle(
                alertData.get("title")
        );

        alert.setMessage(
                alertData.get("message")
        );

        alert.setSource(
                AUTOMATIC_RULE_ENGINE
        );

        alert.setAcknowledged(false);

        alert.setActive(true);

        alert.setTimestamp(
                snapshot.getTimestamp()
        );

        alertRepository.save(alert);

        System.out.println(
                "ALERT SAVED - "
                        + stationCode
                        + " | "
                        + severity
                        + " | "
                        + alertType
                        + " | "
                        + alertData.get("message")
        );
    }

    /**
     * Marks automatic alerts inactive when their underlying
     * condition is no longer present.
     *
     * Alerts are not deleted because historical alert records
     * must remain available.
     */
    private void resolveInactiveAlerts(
            String stationCode,
            Set<String> currentConditionKeys
    ) {

        if (stationCode == null
                || stationCode.isBlank()) {
            return;
        }

        List<Alert> activeAlerts =
                alertRepository
                        .findBySourceAndActiveTrue(
                                AUTOMATIC_RULE_ENGINE
                        );

        for (Alert alert : activeAlerts) {

            if (alert.getStation() == null
                    || alert.getStation().getCode() == null) {
                continue;
            }

            if (!stationCode.equalsIgnoreCase(
                    alert.getStation().getCode()
            )) {
                continue;
            }

            String existingKey =
                    buildConditionKey(
                            alert.getStation().getCode(),
                            alert.getAlertType(),
                            alert.getSeverity()
                    );

            if (!currentConditionKeys.contains(
                    existingKey
            )) {

                alert.setActive(false);

                alertRepository.save(alert);

                System.out.println(
                        "ALERT RESOLVED - "
                                + stationCode
                                + " | "
                                + alert.getSeverity()
                                + " | "
                                + alert.getAlertType()
                );
            }
        }
    }

    /**
     * Creates lifecycle keys for all currently active
     * conditions detected in the current telemetry.
     */
    private Set<String> buildConditionKeys(
            List<Map<String, String>> alerts
    ) {

        Set<String> keys =
                new HashSet<>();

        for (Map<String, String> alertData : alerts) {

            keys.add(
                    buildConditionKey(
                            alertData.get("station"),
                            alertData.get("type"),
                            alertData.get("severity")
                    )
            );
        }

        return keys;
    }

    /**
     * Builds a stable identity for an alert condition.
     *
     * Same station + type + severity represents the same
     * automatic condition.
     */
    private String buildConditionKey(
            String stationCode,
            String alertType,
            String severity
    ) {

        return safeUpper(stationCode)
                + "|"
                + safeUpper(alertType)
                + "|"
                + safeUpper(severity);
    }

    private String safeUpper(String value) {

        return value == null
                ? ""
                : value.trim().toUpperCase();
    }

    private boolean isLessThan(
            Double value,
            double threshold
    ) {

        return value != null
                && value < threshold;
    }

    private boolean isGreaterThan(
            Double value,
            double threshold
    ) {

        return value != null
                && value > threshold;
    }
}