package com.antaris.backend.ml.service;

import com.antaris.backend.ml.dto.PredictionResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import org.springframework.stereotype.Service;

@Service
public class PredictionRiskService {

    // ============================================================
    // MAIN RISK EVALUATION
    // ============================================================

    public PredictionRiskResponse evaluateRisk(
            PredictionResponse prediction
    ) {

        if (prediction == null) {
            throw new IllegalArgumentException(
                    "Prediction cannot be null"
            );
        }

        if (prediction.getPredictionType() == null
                || prediction.getPredictionType().isBlank()) {

            throw new IllegalArgumentException(
                    "Prediction type is required"
            );
        }

        if (prediction.getPredictedValue() == null) {

            throw new IllegalArgumentException(
                    "Predicted value is required"
            );
        }

        String predictionType =
                prediction.getPredictionType();

        double predictedValue =
                prediction.getPredictedValue();

        double riskScore;

        String riskLevel;

        String reason;

        // ========================================================
        // ENERGY RISK
        // ========================================================

        if ("ENERGY_CONSUMPTION".equals(predictionType)) {

            riskScore =
                    calculateEnergyRisk(predictedValue);

            riskLevel =
                    determineRiskLevel(riskScore);

            reason =
                    getEnergyRiskReason(
                            predictedValue,
                            riskLevel
                    );
        }

        // ========================================================
        // FUEL RISK
        // ========================================================

        else if ("FUEL_LEVEL".equals(predictionType)) {

            riskScore =
                    calculateFuelRisk(predictedValue);

            riskLevel =
                    determineRiskLevel(riskScore);

            reason =
                    getFuelRiskReason(
                            predictedValue,
                            riskLevel
                    );
        }

        // ========================================================
        // ENVIRONMENT RISK
        // ========================================================

        else if ("TEMPERATURE".equals(predictionType)) {

            riskScore =
                    calculateTemperatureRisk(
                            predictedValue
                    );

            riskLevel =
                    determineRiskLevel(riskScore);

            reason =
                    getTemperatureRiskReason(
                            predictedValue,
                            riskLevel
                    );
        }

        // ========================================================
        // EQUIPMENT ANOMALY RISK
        // ========================================================

        else if ("EQUIPMENT_ANOMALY".equals(predictionType)) {

            riskScore =
                    calculateEquipmentRisk(
                            predictedValue
                    );

            riskLevel =
                    determineRiskLevel(riskScore);

            reason =
                    getEquipmentRiskReason(
                            predictedValue,
                            riskLevel
                    );
        }

        // ========================================================
        // UNKNOWN PREDICTION TYPE
        // ========================================================

        else {

            throw new IllegalArgumentException(
                    "Unsupported prediction type: "
                            + predictionType
            );
        }

        return new PredictionRiskResponse(
                prediction.getStation(),
                predictionType,
                predictedValue,
                riskScore,
                riskLevel,
                reason,
                prediction.getModelVersion(),
                prediction.getHorizonHours()
        );
    }

    // ============================================================
    // ENERGY RISK
    // ============================================================

    private double calculateEnergyRisk(
            double predictedConsumption
    ) {

        /*
         * Development thresholds.
         *
         * These are normalized operational thresholds
         * for the current ANTARIS prototype.
         *
         * They can later be replaced by station-specific
         * capacity limits from the database.
         */

        if (predictedConsumption <= 300) {
            return 0.10;
        }

        if (predictedConsumption <= 400) {
            return 0.30;
        }

        if (predictedConsumption <= 500) {
            return 0.55;
        }

        if (predictedConsumption <= 600) {
            return 0.75;
        }

        return 0.95;
    }

    // ============================================================
    // FUEL RISK
    // ============================================================

    private double calculateFuelRisk(
            double predictedFuelPercentage
    ) {

        if (predictedFuelPercentage >= 70) {
            return 0.10;
        }

        if (predictedFuelPercentage >= 50) {
            return 0.25;
        }

        if (predictedFuelPercentage >= 30) {
            return 0.50;
        }

        if (predictedFuelPercentage >= 15) {
            return 0.75;
        }

        return 0.95;
    }

    // ============================================================
    // TEMPERATURE RISK
    // ============================================================

    private double calculateTemperatureRisk(
            double predictedTemperature
    ) {

        /*
         * Antarctic environmental risk.
         *
         * Lower temperatures increase operational risk
         * because heating demand and infrastructure stress
         * can increase.
         */

        if (predictedTemperature >= -10) {
            return 0.10;
        }

        if (predictedTemperature >= -20) {
            return 0.30;
        }

        if (predictedTemperature >= -30) {
            return 0.55;
        }

        if (predictedTemperature >= -40) {
            return 0.75;
        }

        return 0.95;
    }

    // ============================================================
    // EQUIPMENT RISK
    // ============================================================

    private double calculateEquipmentRisk(
            double anomalyScore
    ) {

        if (anomalyScore < 0
                || anomalyScore > 1) {

            throw new IllegalArgumentException(
                    "Equipment anomaly score must be between 0 and 1"
            );
        }

        /*
         * Equipment anomaly score is already normalized
         * between 0 and 1, so it can directly represent
         * the risk score.
         */

        return roundScore(anomalyScore);
    }

    // ============================================================
    // RISK LEVEL
    // ============================================================

    private String determineRiskLevel(
            double riskScore
    ) {

        if (riskScore < 0.25) {
            return "LOW";
        }

        if (riskScore < 0.50) {
            return "MEDIUM";
        }

        if (riskScore < 0.75) {
            return "HIGH";
        }

        return "CRITICAL";
    }

    // ============================================================
    // ENERGY REASON
    // ============================================================

    private String getEnergyRiskReason(
            double value,
            String riskLevel
    ) {

        return switch (riskLevel) {

            case "LOW" ->
                    "Predicted energy consumption is within the normal operational range.";

            case "MEDIUM" ->
                    "Predicted energy consumption shows moderate demand and should be monitored.";

            case "HIGH" ->
                    "Predicted energy consumption indicates increased demand on station power generation.";

            case "CRITICAL" ->
                    "Predicted energy consumption is very high and may place significant stress on power generation.";

            default ->
                    "Energy consumption risk detected.";
        };
    }

    // ============================================================
    // FUEL REASON
    // ============================================================

    private String getFuelRiskReason(
            double value,
            String riskLevel
    ) {

        return switch (riskLevel) {

            case "LOW" ->
                    "Predicted fuel level is comfortably above the operational reserve.";

            case "MEDIUM" ->
                    "Predicted fuel level is declining and should be monitored.";

            case "HIGH" ->
                    "Predicted fuel level is approaching a low reserve condition.";

            case "CRITICAL" ->
                    "Predicted fuel level is critically low and resupply planning may be required.";

            default ->
                    "Fuel level risk detected.";
        };
    }

    // ============================================================
    // TEMPERATURE REASON
    // ============================================================

    private String getTemperatureRiskReason(
            double value,
            String riskLevel
    ) {

        return switch (riskLevel) {

            case "LOW" ->
                    "Predicted temperature is within the configured operational range.";

            case "MEDIUM" ->
                    "Predicted temperature indicates increased environmental stress.";

            case "HIGH" ->
                    "Predicted low temperature may increase heating demand and infrastructure stress.";

            case "CRITICAL" ->
                    "Predicted extreme cold may create significant environmental and infrastructure risk.";

            default ->
                    "Temperature risk detected.";
        };
    }

    // ============================================================
    // EQUIPMENT REASON
    // ============================================================

    private String getEquipmentRiskReason(
            double value,
            String riskLevel
    ) {

        return switch (riskLevel) {

            case "LOW" ->
                    "Equipment anomaly score is within the normal range.";

            case "MEDIUM" ->
                    "Equipment anomaly score indicates early abnormal behavior.";

            case "HIGH" ->
                    "Equipment anomaly score indicates significant abnormal behavior and should be investigated.";

            case "CRITICAL" ->
                    "Equipment anomaly score is critically high and immediate inspection should be considered.";

            default ->
                    "Equipment anomaly risk detected.";
        };
    }

    // ============================================================
    // ROUND SCORE
    // ============================================================

    private double roundScore(
            double score
    ) {

        return Math.round(
                score * 100.0
        ) / 100.0;
    }
}