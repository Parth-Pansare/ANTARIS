package com.antaris.backend.ml.service;

import com.antaris.backend.ml.dto.PredictionRecommendationResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import org.springframework.stereotype.Service;

@Service
public class PredictionRecommendationService {

    // ============================================================
    // MAIN RECOMMENDATION ENGINE
    // ============================================================

    public PredictionRecommendationResponse generateRecommendation(
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

        if (risk.getPredictionType() == null
                || risk.getPredictionType().isBlank()) {

            throw new IllegalArgumentException(
                    "Prediction risk has no prediction type"
            );
        }

        if (risk.getRiskLevel() == null
                || risk.getRiskLevel().isBlank()) {

            throw new IllegalArgumentException(
                    "Prediction risk has no risk level"
            );
        }

        String predictionType =
                risk.getPredictionType();

        String riskLevel =
                risk.getRiskLevel();

        String recommendation;

        String priority;

        // ========================================================
        // ENERGY RECOMMENDATION
        // ========================================================

        if ("ENERGY_CONSUMPTION".equals(
                predictionType
        )) {

            recommendation =
                    getEnergyRecommendation(
                            riskLevel
                    );

            priority =
                    determinePriority(
                            riskLevel
                    );
        }

        // ========================================================
        // FUEL RECOMMENDATION
        // ========================================================

        else if ("FUEL_LEVEL".equals(
                predictionType
        )) {

            recommendation =
                    getFuelRecommendation(
                            riskLevel
                    );

            priority =
                    determinePriority(
                            riskLevel
                    );
        }

        // ========================================================
        // ENVIRONMENT RECOMMENDATION
        // ========================================================

        else if ("TEMPERATURE".equals(
                predictionType
        )) {

            recommendation =
                    getTemperatureRecommendation(
                            riskLevel
                    );

            priority =
                    determinePriority(
                            riskLevel
                    );
        }

        // ========================================================
        // EQUIPMENT RECOMMENDATION
        // ========================================================

        else if ("EQUIPMENT_ANOMALY".equals(
                predictionType
        )) {

            recommendation =
                    getEquipmentRecommendation(
                            riskLevel
                    );

            priority =
                    determinePriority(
                            riskLevel
                    );
        }

        // ========================================================
        // UNKNOWN TYPE
        // ========================================================

        else {

            throw new IllegalArgumentException(
                    "Unsupported prediction type: "
                            + predictionType
            );
        }

        return new PredictionRecommendationResponse(
                risk.getStation(),
                predictionType,
                riskLevel,
                recommendation,
                priority,
                risk.getModelVersion(),
                risk.getHorizonHours()
        );
    }

    // ============================================================
    // ENERGY RECOMMENDATION
    // ============================================================

    private String getEnergyRecommendation(
            String riskLevel
    ) {

        return switch (riskLevel.toUpperCase()) {

            case "LOW" ->
                    "Continue normal energy operations and monitor station demand.";

            case "MEDIUM" ->
                    "Monitor energy consumption and review non-essential loads.";

            case "HIGH" ->
                    "Review generator loading, reduce non-essential consumption, and monitor power balance closely.";

            case "CRITICAL" ->
                    "Immediately review generator capacity, prioritize essential loads, and activate energy contingency procedures.";

            default ->
                    "Monitor station energy consumption.";
        };
    }

    // ============================================================
    // FUEL RECOMMENDATION
    // ============================================================

    private String getFuelRecommendation(
            String riskLevel
    ) {

        return switch (riskLevel.toUpperCase()) {

            case "LOW" ->
                    "Continue normal fuel operations and monitor remaining reserves.";

            case "MEDIUM" ->
                    "Monitor fuel consumption and review upcoming resupply requirements.";

            case "HIGH" ->
                    "Begin resupply planning and closely monitor fuel consumption and estimated runtime.";

            case "CRITICAL" ->
                    "Initiate urgent resupply planning, verify remaining runtime, and prioritize essential fuel consumption.";

            default ->
                    "Monitor station fuel reserves.";
        };
    }

    // ============================================================
    // ENVIRONMENT RECOMMENDATION
    // ============================================================

    private String getTemperatureRecommendation(
            String riskLevel
    ) {

        return switch (riskLevel.toUpperCase()) {

            case "LOW" ->
                    "Continue normal environmental monitoring.";

            case "MEDIUM" ->
                    "Increase monitoring of temperature trends and heating demand.";

            case "HIGH" ->
                    "Monitor heating systems closely and review energy availability for increased heating demand.";

            case "CRITICAL" ->
                    "Activate extreme-cold preparedness procedures and prioritize heating, crew safety, and critical infrastructure.";

            default ->
                    "Continue environmental monitoring.";
        };
    }

    // ============================================================
    // EQUIPMENT RECOMMENDATION
    // ============================================================

    private String getEquipmentRecommendation(
            String riskLevel
    ) {

        return switch (riskLevel.toUpperCase()) {

            case "LOW" ->
                    "Continue normal equipment monitoring.";

            case "MEDIUM" ->
                    "Increase equipment monitoring and review recent operating trends.";

            case "HIGH" ->
                    "Schedule equipment inspection and review recent telemetry for abnormal behavior.";

            case "CRITICAL" ->
                    "Prioritize immediate equipment inspection and consider maintenance intervention before failure risk increases.";

            default ->
                    "Continue equipment monitoring.";
        };
    }

    // ============================================================
    // PRIORITY
    // ============================================================

    private String determinePriority(
            String riskLevel
    ) {

        return switch (riskLevel.toUpperCase()) {

            case "LOW" ->
                    "LOW";

            case "MEDIUM" ->
                    "MEDIUM";

            case "HIGH" ->
                    "HIGH";

            case "CRITICAL" ->
                    "URGENT";

            default ->
                    "MEDIUM";
        };
    }
}