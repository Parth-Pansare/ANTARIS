package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.dto.SimulationImpact;
import org.springframework.stereotype.Service;

@Service
public class ScenarioRiskEngine {

    /**
     * Evaluates the overall operational risk of a simulated
     * scenario using the calculated scenario impact.
     *
     * Risk score is normalized between 0 and 1.
     */
    public ScenarioRiskResult evaluateRisk(
            SimulationImpact impact
    ) {

        if (impact == null) {
            throw new IllegalArgumentException(
                    "Simulation impact cannot be null."
            );
        }

        /*
         * Calculate individual domain risk scores.
         */
        double energyRisk =
                calculateEnergyRisk(
                        impact.getEnergyConsumptionDeltaKw()
                );

        double generatorRisk =
                calculateGeneratorRisk(
                        impact.getGeneratorLoadDeltaPct()
                );

        double fuelRisk =
                calculateFuelRisk(
                        impact.getFuelPercentageDelta(),
                        impact.getFuelConsumptionDeltaLph()
                );

        double batteryRisk =
                calculateBatteryRisk(
                        impact.getBatteryPercentageDelta()
                );

        double environmentRisk =
                calculateEnvironmentRisk(
                        impact.getTemperatureDeltaC()
                );

        /*
         * Overall risk is based on the highest domain risk.
         *
         * This is intentional for Antarctic remote operations:
         * one critical failure domain can be operationally
         * significant even if other domains remain stable.
         */
        double overallRisk =
                Math.max(
                        energyRisk,
                        Math.max(
                                generatorRisk,
                                Math.max(
                                        fuelRisk,
                                        Math.max(
                                                batteryRisk,
                                                environmentRisk
                                        )
                                )
                        )
                );

        overallRisk =
                roundScore(
                        clamp(
                                overallRisk,
                                0.0,
                                1.0
                        )
                );

        String riskLevel =
                determineRiskLevel(
                        overallRisk
                );

        String primaryRisk =
                determinePrimaryRisk(
                        energyRisk,
                        generatorRisk,
                        fuelRisk,
                        batteryRisk,
                        environmentRisk
                );

        String reason =
                buildReason(
                        riskLevel,
                        primaryRisk
                );

        return new ScenarioRiskResult(
                overallRisk,
                riskLevel,
                primaryRisk,
                reason,
                energyRisk,
                generatorRisk,
                fuelRisk,
                batteryRisk,
                environmentRisk
        );
    }

    // ============================================================
    // ENERGY RISK
    // ============================================================

    private double calculateEnergyRisk(
            Double energyDeltaKw
    ) {

        if (energyDeltaKw == null) {
            return 0.0;
        }

        double increase =
                Math.max(
                        0.0,
                        energyDeltaKw
                );

        /*
         * Development thresholds:
         *
         * +0 kW       -> 0.00
         * +25 kW      -> 0.25
         * +50 kW      -> 0.50
         * +100 kW     -> 0.75
         * +150+ kW    -> 1.00
         */
        if (increase <= 0) {
            return 0.0;
        }

        if (increase <= 25) {
            return 0.25;
        }

        if (increase <= 50) {
            return 0.50;
        }

        if (increase <= 100) {
            return 0.75;
        }

        return 1.0;
    }

    // ============================================================
    // GENERATOR RISK
    // ============================================================

    private double calculateGeneratorRisk(
            Double generatorLoadDeltaPct
    ) {

        if (generatorLoadDeltaPct == null) {
            return 0.0;
        }

        double increase =
                Math.max(
                        0.0,
                        generatorLoadDeltaPct
                );

        /*
         * Large increases in generator load indicate
         * additional stress on generation infrastructure.
         */
        if (increase <= 0) {
            return 0.0;
        }

        if (increase <= 5) {
            return 0.25;
        }

        if (increase <= 10) {
            return 0.50;
        }

        if (increase <= 20) {
            return 0.75;
        }

        return 1.0;
    }

    // ============================================================
    // FUEL RISK
    // ============================================================

    private double calculateFuelRisk(
            Double fuelPercentageDelta,
            Double fuelConsumptionDeltaLph
    ) {

        double levelRisk = 0.0;
        double consumptionRisk = 0.0;

        /*
         * Falling fuel percentage creates risk.
         */
        if (fuelPercentageDelta != null) {

            double decrease =
                    Math.max(
                            0.0,
                            -fuelPercentageDelta
                    );

            if (decrease <= 0) {
                levelRisk = 0.0;
            } else if (decrease <= 2) {
                levelRisk = 0.25;
            } else if (decrease <= 5) {
                levelRisk = 0.50;
            } else if (decrease <= 10) {
                levelRisk = 0.75;
            } else {
                levelRisk = 1.0;
            }
        }

        /*
         * Increasing fuel consumption rate also creates risk.
         */
        if (fuelConsumptionDeltaLph != null) {

            double increase =
                    Math.max(
                            0.0,
                            fuelConsumptionDeltaLph
                    );

            if (increase <= 0) {
                consumptionRisk = 0.0;
            } else if (increase <= 2) {
                consumptionRisk = 0.25;
            } else if (increase <= 5) {
                consumptionRisk = 0.50;
            } else if (increase <= 10) {
                consumptionRisk = 0.75;
            } else {
                consumptionRisk = 1.0;
            }
        }

        return Math.max(
                levelRisk,
                consumptionRisk
        );
    }

    // ============================================================
    // BATTERY RISK
    // ============================================================

    private double calculateBatteryRisk(
            Double batteryPercentageDelta
    ) {

        if (batteryPercentageDelta == null) {
            return 0.0;
        }

        double decrease =
                Math.max(
                        0.0,
                        -batteryPercentageDelta
                );

        if (decrease <= 0) {
            return 0.0;
        }

        if (decrease <= 5) {
            return 0.25;
        }

        if (decrease <= 10) {
            return 0.50;
        }

        if (decrease <= 20) {
            return 0.75;
        }

        return 1.0;
    }

    // ============================================================
    // ENVIRONMENT RISK
    // ============================================================

    private double calculateEnvironmentRisk(
            Double temperatureDeltaC
    ) {

        if (temperatureDeltaC == null) {
            return 0.0;
        }

        /*
         * Extreme temperature changes represent increased
         * environmental stress.
         *
         * Both strong cooling and strong warming are considered.
         */
        double absoluteChange =
                Math.abs(
                        temperatureDeltaC
                );

        if (absoluteChange <= 2) {
            return 0.0;
        }

        if (absoluteChange <= 5) {
            return 0.25;
        }

        if (absoluteChange <= 10) {
            return 0.50;
        }

        if (absoluteChange <= 20) {
            return 0.75;
        }

        return 1.0;
    }

    // ============================================================
    // PRIMARY RISK
    // ============================================================

    private String determinePrimaryRisk(
            double energyRisk,
            double generatorRisk,
            double fuelRisk,
            double batteryRisk,
            double environmentRisk
    ) {

        double highestRisk =
                energyRisk;

        String primaryRisk =
                "ENERGY";

        if (generatorRisk > highestRisk) {
            highestRisk =
                    generatorRisk;

            primaryRisk =
                    "GENERATOR";
        }

        if (fuelRisk > highestRisk) {
            highestRisk =
                    fuelRisk;

            primaryRisk =
                    "FUEL";
        }

        if (batteryRisk > highestRisk) {
            highestRisk =
                    batteryRisk;

            primaryRisk =
                    "BATTERY";
        }

        if (environmentRisk > highestRisk) {
            primaryRisk =
                    "ENVIRONMENT";
        }

        /*
         * If no meaningful risk exists, report NORMAL.
         */
        if (highestRisk <= 0) {
            return "NORMAL";
        }

        return primaryRisk;
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
    // REASON
    // ============================================================

    private String buildReason(
            String riskLevel,
            String primaryRisk
    ) {

        return switch (riskLevel) {

            case "LOW" ->
                    "Scenario produces low operational impact. "
                            + "Normal monitoring is sufficient.";

            case "MEDIUM" ->
                    "Scenario produces moderate operational impact. "
                            + primaryRisk
                            + " should be monitored.";

            case "HIGH" ->
                    "Scenario produces significant operational impact. "
                            + primaryRisk
                            + " requires operational attention.";

            case "CRITICAL" ->
                    "Scenario produces critical operational impact. "
                            + primaryRisk
                            + " represents the primary risk domain.";

            default ->
                    "Scenario risk detected.";
        };
    }

    // ============================================================
    // UTILITIES
    // ============================================================

    private double clamp(
            double value,
            double minimum,
            double maximum
    ) {

        return Math.max(
                minimum,
                Math.min(
                        maximum,
                        value
                )
        );
    }

    private double roundScore(
            double score
    ) {

        return Math.round(
                score * 100.0
        ) / 100.0;
    }

    // ============================================================
    // RESULT
    // ============================================================

    public static class ScenarioRiskResult {

        private final Double riskScore;
        private final String riskLevel;
        private final String primaryRisk;
        private final String reason;

        private final Double energyRisk;
        private final Double generatorRisk;
        private final Double fuelRisk;
        private final Double batteryRisk;
        private final Double environmentRisk;

        public ScenarioRiskResult(
                Double riskScore,
                String riskLevel,
                String primaryRisk,
                String reason,
                Double energyRisk,
                Double generatorRisk,
                Double fuelRisk,
                Double batteryRisk,
                Double environmentRisk
        ) {

            this.riskScore = riskScore;
            this.riskLevel = riskLevel;
            this.primaryRisk = primaryRisk;
            this.reason = reason;
            this.energyRisk = energyRisk;
            this.generatorRisk = generatorRisk;
            this.fuelRisk = fuelRisk;
            this.batteryRisk = batteryRisk;
            this.environmentRisk = environmentRisk;
        }

        public Double getRiskScore() {
            return riskScore;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public String getPrimaryRisk() {
            return primaryRisk;
        }

        public String getReason() {
            return reason;
        }

        public Double getEnergyRisk() {
            return energyRisk;
        }

        public Double getGeneratorRisk() {
            return generatorRisk;
        }

        public Double getFuelRisk() {
            return fuelRisk;
        }

        public Double getBatteryRisk() {
            return batteryRisk;
        }

        public Double getEnvironmentRisk() {
            return environmentRisk;
        }
    }
}