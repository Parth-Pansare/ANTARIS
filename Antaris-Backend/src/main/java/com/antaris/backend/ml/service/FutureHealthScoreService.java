package com.antaris.backend.ml.service;

import com.antaris.backend.ml.dto.FutureHealthScoreResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import org.springframework.stereotype.Service;

@Service
public class FutureHealthScoreService {

    // ============================================================
    // FUTURE HEALTH SCORE
    // ============================================================

    public FutureHealthScoreResponse calculateFutureHealthScore(
            PredictionRiskResponse energyRisk,
            PredictionRiskResponse fuelRisk,
            PredictionRiskResponse environmentRisk,
            PredictionRiskResponse equipmentRisk
    ) {

        validateRisk(energyRisk, "energy");
        validateRisk(fuelRisk, "fuel");
        validateRisk(environmentRisk, "environment");
        validateRisk(equipmentRisk, "equipment");

        String station =
                validateSameStation(
                        energyRisk,
                        fuelRisk,
                        environmentRisk,
                        equipmentRisk
                );

        Integer horizonHours =
                validateSameHorizon(
                        energyRisk,
                        fuelRisk,
                        environmentRisk,
                        equipmentRisk
                );

        double energyScore =
                normalizeRiskScore(
                        energyRisk.getRiskScore()
                );

        double fuelScore =
                normalizeRiskScore(
                        fuelRisk.getRiskScore()
                );

        double environmentScore =
                normalizeRiskScore(
                        environmentRisk.getRiskScore()
                );

        double equipmentScore =
                normalizeRiskScore(
                        equipmentRisk.getRiskScore()
                );

        /*
         * Weighted future-health calculation.
         *
         * Lower operational risk produces a higher
         * future health score.
         *
         * Weights:
         *
         * Energy       = 25%
         * Fuel         = 30%
         * Environment  = 20%
         * Equipment    = 25%
         *
         * These are ANTARIS prototype weights and can
         * later be configured using operational data.
         */

        double weightedRisk =
                (energyScore * 0.25)
                        + (fuelScore * 0.30)
                        + (environmentScore * 0.20)
                        + (equipmentScore * 0.25);

        double futureHealthScore =
                (1.0 - weightedRisk) * 100.0;

        futureHealthScore =
                roundScore(
                        futureHealthScore
                );

        String healthLevel =
                determineHealthLevel(
                        futureHealthScore
                );

        String summary =
                buildSummary(
                        healthLevel,
                        futureHealthScore,
                        energyRisk,
                        fuelRisk,
                        environmentRisk,
                        equipmentRisk
                );

        return new FutureHealthScoreResponse(
                station,
                horizonHours,
                futureHealthScore,
                healthLevel,
                energyScore,
                fuelScore,
                environmentScore,
                equipmentScore,
                summary
        );
    }

    // ============================================================
    // VALIDATE RISK
    // ============================================================

    private void validateRisk(
            PredictionRiskResponse risk,
            String riskName
    ) {

        if (risk == null) {
            throw new IllegalArgumentException(
                    riskName
                            + " prediction risk cannot be null"
            );
        }

        if (risk.getStation() == null
                || risk.getStation().isBlank()) {

            throw new IllegalArgumentException(
                    riskName
                            + " prediction risk has no station"
            );
        }

        if (risk.getRiskScore() == null) {

            throw new IllegalArgumentException(
                    riskName
                            + " prediction risk has no risk score"
            );
        }

        if (risk.getRiskScore() < 0.0
                || risk.getRiskScore() > 1.0) {

            throw new IllegalArgumentException(
                    riskName
                            + " risk score must be between 0 and 1"
            );
        }

        if (risk.getHorizonHours() == null
                || risk.getHorizonHours() <= 0) {

            throw new IllegalArgumentException(
                    riskName
                            + " prediction horizon must be greater than zero"
            );
        }
    }

    // ============================================================
    // VALIDATE SAME STATION
    // ============================================================

    private String validateSameStation(
            PredictionRiskResponse energyRisk,
            PredictionRiskResponse fuelRisk,
            PredictionRiskResponse environmentRisk,
            PredictionRiskResponse equipmentRisk
    ) {

        String station =
                energyRisk.getStation();

        if (!station.equalsIgnoreCase(
                fuelRisk.getStation()
        )) {
            throw new IllegalArgumentException(
                    "Prediction risks must belong to the same station"
            );
        }

        if (!station.equalsIgnoreCase(
                environmentRisk.getStation()
        )) {
            throw new IllegalArgumentException(
                    "Prediction risks must belong to the same station"
            );
        }

        if (!station.equalsIgnoreCase(
                equipmentRisk.getStation()
        )) {
            throw new IllegalArgumentException(
                    "Prediction risks must belong to the same station"
            );
        }

        return station;
    }

    // ============================================================
    // VALIDATE SAME HORIZON
    // ============================================================

    private Integer validateSameHorizon(
            PredictionRiskResponse energyRisk,
            PredictionRiskResponse fuelRisk,
            PredictionRiskResponse environmentRisk,
            PredictionRiskResponse equipmentRisk
    ) {

        Integer horizon =
                energyRisk.getHorizonHours();

        if (!horizon.equals(
                fuelRisk.getHorizonHours()
        )) {
            throw new IllegalArgumentException(
                    "Prediction risks must use the same forecast horizon"
            );
        }

        if (!horizon.equals(
                environmentRisk.getHorizonHours()
        )) {
            throw new IllegalArgumentException(
                    "Prediction risks must use the same forecast horizon"
            );
        }

        if (!horizon.equals(
                equipmentRisk.getHorizonHours()
        )) {
            throw new IllegalArgumentException(
                    "Prediction risks must use the same forecast horizon"
            );
        }

        return horizon;
    }

    // ============================================================
    // NORMALIZE RISK
    // ============================================================

    private double normalizeRiskScore(
            Double riskScore
    ) {

        return roundScore(
                Math.max(
                        0.0,
                        Math.min(
                                1.0,
                                riskScore
                        )
                )
        );
    }

    // ============================================================
    // HEALTH LEVEL
    // ============================================================

    private String determineHealthLevel(
            double healthScore
    ) {

        if (healthScore >= 95) {
            return "EXCELLENT";
        }

        if (healthScore >= 80) {
            return "GOOD";
        }

        if (healthScore >= 60) {
            return "MODERATE";
        }

        if (healthScore >= 40) {
            return "POOR";
        }

        return "CRITICAL";
    }

    // ============================================================
    // SUMMARY
    // ============================================================

    private String buildSummary(
            String healthLevel,
            double healthScore,
            PredictionRiskResponse energyRisk,
            PredictionRiskResponse fuelRisk,
            PredictionRiskResponse environmentRisk,
            PredictionRiskResponse equipmentRisk
    ) {

        StringBuilder summary =
                new StringBuilder();

        summary.append(
                "Future station health score is "
        );

        summary.append(
                healthScore
        );

        summary.append(
                " ("
        );

        summary.append(
                healthLevel
        );

        summary.append(
                "). "
        );

        summary.append(
                "Energy risk: "
        );

        summary.append(
                energyRisk.getRiskLevel()
        );

        summary.append(
                ", fuel risk: "
        );

        summary.append(
                fuelRisk.getRiskLevel()
        );

        summary.append(
                ", environment risk: "
        );

        summary.append(
                environmentRisk.getRiskLevel()
        );

        summary.append(
                ", equipment risk: "
        );

        summary.append(
                equipmentRisk.getRiskLevel()
        );

        summary.append(".");

        return summary.toString();
    }

    // ============================================================
    // ROUND
    // ============================================================

    private double roundScore(
            double value
    ) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}