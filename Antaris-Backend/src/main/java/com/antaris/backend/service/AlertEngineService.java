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

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AlertEngineService {

    private final TelemetrySimulatorService telemetrySimulatorService;
    private final AlertRepository alertRepository;
    private final StationRepository stationRepository;

    /*
     * Stores alert conditions that are already active.
     * This prevents duplicate alerts on every simulator tick.
     */
    private final Set<String> activeAlertKeys =
            new HashSet<>();

    public AlertEngineService(
            TelemetrySimulatorService telemetrySimulatorService,
            AlertRepository alertRepository,
            StationRepository stationRepository
    ) {
        this.telemetrySimulatorService =
                telemetrySimulatorService;

        this.alertRepository =
                alertRepository;

        this.stationRepository =
                stationRepository;
    }

    /**
     * Manually evaluates the current simulator telemetry.
     */
    public List<Map<String, String>> evaluateCurrentTelemetry() {

        TelemetrySnapshot snapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        return evaluateTelemetry(snapshot);
    }

    /**
     * Automatically evaluates every new telemetry snapshot.
     *
     * This method is triggered whenever the simulator
     * publishes a TelemetryUpdatedEvent.
     */
    @EventListener
    public void onTelemetryUpdated(
            TelemetryUpdatedEvent event
    ) {

        TelemetrySnapshot snapshot =
                event.snapshot();

        List<Map<String, String>> alerts =
                evaluateTelemetry(snapshot);

        if (alerts.isEmpty()) {
            return;
        }

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

        if (snapshot.getBatteryPercentage() < 20) {

            alerts.add(Map.of(
                    "type", "BATTERY",
                    "severity", "CRITICAL",
                    "title", "Critical Battery Level",
                    "message",
                    "Battery level is critically low",
                    "station", station
            ));

        } else if (snapshot.getBatteryPercentage() < 35) {

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

        if (snapshot.getFuelPercentage() < 15) {

            alerts.add(Map.of(
                    "type", "FUEL",
                    "severity", "CRITICAL",
                    "title", "Critical Fuel Level",
                    "message",
                    "Fuel level is critically low",
                    "station", station
            ));

        } else if (snapshot.getFuelPercentage() < 30) {

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

        if (snapshot.getPowerBalanceKw() < 0) {

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

        if (snapshot.getGeneratorLoadPct() > 90) {

            alerts.add(Map.of(
                    "type", "GENERATOR",
                    "severity", "CRITICAL",
                    "title", "Critical Generator Load",
                    "message",
                    "Generator load is critically high",
                    "station", station
            ));

        } else if (snapshot.getGeneratorLoadPct() > 80) {

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

        if (snapshot.getTemperatureC() < -30) {

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
     * Saves an alert to PostgreSQL only if the same
     * alert condition is not already active.
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
                stationCode
                        + "|"
                        + alertType
                        + "|"
                        + severity;

        /*
         * Prevent duplicate alerts while the same
         * condition remains active.
         */
        if (activeAlertKeys.contains(alertKey)) {
            return;
        }

        /*
         * Find the station from PostgreSQL.
         */
        Station station =
                stationRepository
                        .findByCode(stationCode)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Station not found: "
                                                + stationCode
                                )
                        );

        /*
         * Create Alert entity.
         */
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
                "AUTOMATIC_RULE_ENGINE"
        );

        alert.setAcknowledged(
                false
        );

        /*
         * Use the simulated telemetry timestamp.
         */
        alert.setTimestamp(
                snapshot.getTimestamp()
        );

        /*
         * Save the alert in PostgreSQL.
         */
        alertRepository.save(alert);

        /*
         * Mark the alert condition as active.
         */
        activeAlertKeys.add(alertKey);

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
}