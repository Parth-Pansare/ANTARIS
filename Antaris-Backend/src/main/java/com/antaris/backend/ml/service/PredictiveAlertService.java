package com.antaris.backend.ml.service;

import com.antaris.backend.dto.AlertResponse;
import com.antaris.backend.entity.Alert;
import com.antaris.backend.entity.Station;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import com.antaris.backend.repository.StationRepository;
import com.antaris.backend.service.AlertService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PredictiveAlertService {

    private final AlertService alertService;
    private final StationRepository stationRepository;

    public PredictiveAlertService(
            AlertService alertService,
            StationRepository stationRepository
    ) {
        this.alertService = alertService;
        this.stationRepository = stationRepository;
    }

    // ============================================================
    // CREATE PREDICTIVE ALERT FROM RISK
    // ============================================================

    public AlertResponse createPredictiveAlert(
            PredictionRiskResponse risk
    ) {

        if (risk == null) {
            throw new IllegalArgumentException(
                    "Prediction risk cannot be null"
            );
        }

        if (risk.getStation() == null
                || risk.getStation().isBlank()) {

            throw new IllegalArgumentException(
                    "Prediction risk has no station"
            );
        }

        if (risk.getRiskLevel() == null
                || risk.getRiskLevel().isBlank()) {

            throw new IllegalArgumentException(
                    "Prediction risk has no risk level"
            );
        }

        /*
         * Predictive alerts are generated only for
         * HIGH and CRITICAL risks.
         *
         * LOW and MEDIUM predictions remain available
         * through the prediction/risk APIs but do not
         * create operational alerts.
         */
        if (!isAlertWorthy(risk.getRiskLevel())) {
            return null;
        }

        Station station =
                stationRepository
                        .findByCode(risk.getStation())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Station not found: "
                                                + risk.getStation()
                                )
                        );

        Alert alert = new Alert();

        alert.setStation(station);

        alert.setAlertType(
                "PREDICTIVE"
        );

        alert.setSeverity(
                risk.getRiskLevel()
        );

        alert.setTitle(
                buildTitle(risk)
        );

        alert.setMessage(
                buildMessage(risk)
        );

        alert.setSource(
                "PREDICTIVE_RISK_ENGINE"
        );

        alert.setAcknowledged(false);

        /*
         * Predictive alerts represent the risk generated
         * by the current prediction request.
         *
         * They are active when created.
         */
        alert.setActive(true);

        alert.setTimestamp(
                LocalDateTime.now()
        );

        Alert savedAlert =
                alertService.saveAlert(alert);

        return convertToResponse(savedAlert);
    }

    // ============================================================
    // CHECK WHETHER ALERT SHOULD BE CREATED
    // ============================================================

    private boolean isAlertWorthy(
            String riskLevel
    ) {

        return "HIGH".equalsIgnoreCase(riskLevel)
                || "CRITICAL".equalsIgnoreCase(riskLevel);
    }

    // ============================================================
    // BUILD ALERT TITLE
    // ============================================================

    private String buildTitle(
            PredictionRiskResponse risk
    ) {

        return risk.getRiskLevel()
                + " Predictive Risk - "
                + risk.getPredictionType();
    }

    // ============================================================
    // BUILD ALERT MESSAGE
    // ============================================================

    private String buildMessage(
            PredictionRiskResponse risk
    ) {

        StringBuilder message =
                new StringBuilder();

        message.append(
                risk.getReason()
        );

        message.append(
                " Predicted value: "
        );

        message.append(
                risk.getPredictedValue()
        );

        message.append(
                " "
        );

        message.append(
                getUnitForPrediction(
                        risk.getPredictionType()
                )
        );

        message.append(
                ". Forecast horizon: "
        );

        message.append(
                risk.getHorizonHours()
        );

        message.append(
                " hour(s)."
        );

        if (risk.getModelVersion() != null
                && !risk.getModelVersion().isBlank()) {

            message.append(
                    " Model: "
            );

            message.append(
                    risk.getModelVersion()
            );

            message.append(".");
        }

        return message.toString();
    }

    // ============================================================
    // GET UNIT
    // ============================================================

    private String getUnitForPrediction(
            String predictionType
    ) {

        if ("FUEL_LEVEL".equals(predictionType)) {
            return "%";
        }

        if ("TEMPERATURE".equals(predictionType)) {
            return "Â°C";
        }

        if ("ENERGY_CONSUMPTION".equals(predictionType)) {
            return "kW";
        }

        if ("EQUIPMENT_ANOMALY".equals(predictionType)) {
            return "score";
        }

        return "";
    }

    // ============================================================
    // CONVERT ALERT TO RESPONSE
    // ============================================================

    private AlertResponse convertToResponse(
            Alert alert
    ) {

        return new AlertResponse(
                alert.getId(),
                alert.getStation().getId(),
                alert.getStation().getCode(),
                alert.getAlertType(),
                alert.getSeverity(),
                alert.getTitle(),
                alert.getMessage(),
                alert.getSource(),
                alert.getAcknowledged(),
                alert.getTimestamp()
        );
    }
}