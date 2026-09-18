package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.dto.SimulationImpact;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DecisionExplanationEngine {

    /**
     * Generates a structured explanation describing
     * why a particular scenario decision was produced.
     *
     * This engine does not modify station state.
     * It only explains the result of the simulation,
     * risk assessment, decision and recommendations.
     */
    public DecisionExplanationResult explain(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            DecisionEngine.DecisionResult decision,
            ActionRecommendationEngine.RecommendationResult recommendations
    ) {

        if (impact == null) {
            throw new IllegalArgumentException(
                    "Simulation impact cannot be null."
            );
        }

        if (risk == null) {
            throw new IllegalArgumentException(
                    "Scenario risk cannot be null."
            );
        }

        if (decision == null) {
            throw new IllegalArgumentException(
                    "Decision result cannot be null."
            );
        }

        if (recommendations == null) {
            throw new IllegalArgumentException(
                    "Recommendation result cannot be null."
            );
        }

        List<String> factors =
                collectImpactFactors(
                        impact
                );

        String summary =
                buildSummary(
                        risk,
                        decision
                );

        String detailedExplanation =
                buildDetailedExplanation(
                        impact,
                        risk,
                        decision
                );

        String operationalImplication =
                buildOperationalImplication(
                        risk,
                        impact
                );

        int recommendationCount =
                recommendations
                        .getRecommendations()
                        .size();

        return new DecisionExplanationResult(
                summary,
                detailedExplanation,
                operationalImplication,
                risk.getPrimaryRisk(),
                risk.getRiskLevel(),
                risk.getRiskScore(),
                decision.getDecisionCode(),
                decision.getDecision(),
                factors,
                recommendationCount
        );
    }

    private String buildSummary(
            ScenarioRiskEngine.ScenarioRiskResult risk,
            DecisionEngine.DecisionResult decision
    ) {

        return "ANTARIS classified the scenario as "
                + safeValue(risk.getRiskLevel())
                + " risk and generated the decision "
                + safeValue(decision.getDecisionCode())
                + " with "
                + safeValue(risk.getPrimaryRisk())
                + " as the primary risk domain.";
    }

    private String buildDetailedExplanation(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            DecisionEngine.DecisionResult decision
    ) {

        StringBuilder explanation =
                new StringBuilder();

        explanation.append(
                "The decision is based on the simulated "
                        + "change from the current baseline state. "
        );

        explanation.append(
                "The calculated scenario risk score is "
        );

        explanation.append(
                safeValue(risk.getRiskScore())
        );

        explanation.append(
                ", resulting in a "
        );

        explanation.append(
                safeValue(risk.getRiskLevel())
        );

        explanation.append(
                " risk classification. "
        );

        explanation.append(
                "The primary affected domain is "
        );

        explanation.append(
                safeValue(risk.getPrimaryRisk())
        );

        explanation.append(
                ". "
        );

        appendEnergyExplanation(
                explanation,
                impact
        );

        appendGeneratorExplanation(
                explanation,
                impact
        );

        appendFuelExplanation(
                explanation,
                impact
        );

        appendBatteryExplanation(
                explanation,
                impact
        );

        appendTemperatureExplanation(
                explanation,
                impact
        );

        explanation.append(
                "Based on these simulated effects, "
        );

        explanation.append(
                "ANTARIS generated the decision "
        );

        explanation.append(
                safeValue(
                        decision.getDecisionCode()
                )
        );

        explanation.append(
                "."
        );

        return explanation.toString();
    }

    private void appendEnergyExplanation(
            StringBuilder explanation,
            SimulationImpact impact
    ) {

        Double delta =
                impact.getEnergyConsumptionDeltaKw();

        if (delta == null) {
            return;
        }

        if (delta > 0) {

            explanation.append(
                    "Energy consumption is projected to increase by "
            );

            explanation.append(
                    format(delta)
            );

            explanation.append(
                    " kW. "
            );

        } else if (delta < 0) {

            explanation.append(
                    "Energy consumption is projected to decrease by "
            );

            explanation.append(
                    format(Math.abs(delta))
            );

            explanation.append(
                    " kW. "
            );
        }
    }

    private void appendGeneratorExplanation(
            StringBuilder explanation,
            SimulationImpact impact
    ) {

        Double delta =
                impact.getGeneratorLoadDeltaPct();

        if (delta == null) {
            return;
        }

        if (delta > 0) {

            explanation.append(
                    "Generator load is projected to increase by "
            );

            explanation.append(
                    format(delta)
            );

            explanation.append(
                    "%. "
            );

        } else if (delta < 0) {

            explanation.append(
                    "Generator load is projected to decrease by "
            );

            explanation.append(
                    format(Math.abs(delta))
            );

            explanation.append(
                    "%. "
            );
        }
    }

    private void appendFuelExplanation(
            StringBuilder explanation,
            SimulationImpact impact
    ) {

        Double consumptionDelta =
                impact.getFuelConsumptionDeltaLph();

        if (consumptionDelta != null) {

            if (consumptionDelta > 0) {

                explanation.append(
                        "Fuel consumption rate is projected to increase by "
                );

                explanation.append(
                        format(consumptionDelta)
                );

                explanation.append(
                        " L/h. "
                );

            } else if (consumptionDelta < 0) {

                explanation.append(
                        "Fuel consumption rate is projected to decrease by "
                );

                explanation.append(
                        format(Math.abs(consumptionDelta))
                );

                explanation.append(
                        " L/h. "
                );
            }
        }

        Double fuelLevelDelta =
                impact.getFuelPercentageDelta();

        if (fuelLevelDelta != null) {

            if (fuelLevelDelta < 0) {

                explanation.append(
                        "Fuel availability is projected to decrease by "
                );

                explanation.append(
                        format(Math.abs(fuelLevelDelta))
                );

                explanation.append(
                        " percentage points. "
                );

            } else if (fuelLevelDelta > 0) {

                explanation.append(
                        "Fuel availability is projected to increase by "
                );

                explanation.append(
                        format(fuelLevelDelta)
                );

                explanation.append(
                        " percentage points. "
                );
            }
        }
    }

    private void appendBatteryExplanation(
            StringBuilder explanation,
            SimulationImpact impact
    ) {

        Double delta =
                impact.getBatteryPercentageDelta();

        if (delta == null) {
            return;
        }

        if (delta < 0) {

            explanation.append(
                    "Battery percentage is projected to decrease by "
            );

            explanation.append(
                    format(Math.abs(delta))
            );

            explanation.append(
                    " percentage points. "
            );

        } else if (delta > 0) {

            explanation.append(
                    "Battery percentage is projected to increase by "
            );

            explanation.append(
                    format(delta)
            );

            explanation.append(
                    " percentage points. "
            );
        }
    }

    private void appendTemperatureExplanation(
            StringBuilder explanation,
            SimulationImpact impact
    ) {

        Double delta =
                impact.getTemperatureDeltaC();

        if (delta == null) {
            return;
        }

        if (delta > 0) {

            explanation.append(
                    "Environmental temperature is projected to increase by "
            );

            explanation.append(
                    format(delta)
            );

            explanation.append(
                    " °C. "
            );

        } else if (delta < 0) {

            explanation.append(
                    "Environmental temperature is projected to decrease by "
            );

            explanation.append(
                    format(Math.abs(delta))
            );

            explanation.append(
                    " °C. "
            );
        }
    }

    private String buildOperationalImplication(
            ScenarioRiskEngine.ScenarioRiskResult risk,
            SimulationImpact impact
    ) {

        String primaryRisk =
                risk.getPrimaryRisk();

        if ("ENERGY".equals(primaryRisk)) {

            return "The scenario may increase pressure on station "
                    + "power-generation and electrical-load management. "
                    + "Power allocation and non-essential loads should "
                    + "be reviewed according to the generated recommendations.";
        }

        if ("GENERATOR".equals(primaryRisk)) {

            return "The scenario may increase dependency on generator "
                    + "capacity. Generator load and operating stability "
                    + "should be monitored closely.";
        }

        if ("FUEL".equals(primaryRisk)) {

            return "The scenario may increase fuel demand or reduce "
                    + "available fuel reserves. Fuel availability and "
                    + "expected runtime should be reviewed.";
        }

        if ("BATTERY".equals(primaryRisk)) {

            return "The scenario may reduce available battery reserve. "
                    + "Battery state and charging availability should "
                    + "be monitored.";
        }

        if ("ENVIRONMENT".equals(primaryRisk)) {

            return "The scenario introduces a significant environmental "
                    + "change. Station infrastructure and environmental "
                    + "conditions should be monitored.";
        }

        return "The scenario does not produce a dominant operational "
                + "risk domain. Normal monitoring is appropriate.";
    }

    private List<String> collectImpactFactors(
            SimulationImpact impact
    ) {

        List<String> factors =
                new ArrayList<>();

        if (isPositive(
                impact.getEnergyConsumptionDeltaKw()
        )) {

            factors.add(
                    "Energy consumption increased"
            );
        }

        if (isPositive(
                impact.getGeneratorLoadDeltaPct()
        )) {

            factors.add(
                    "Generator load increased"
            );
        }

        if (isPositive(
                impact.getFuelConsumptionDeltaLph()
        )) {

            factors.add(
                    "Fuel consumption increased"
            );
        }

        if (isNegative(
                impact.getFuelPercentageDelta()
        )) {

            factors.add(
                    "Fuel availability decreased"
            );
        }

        if (isNegative(
                impact.getBatteryPercentageDelta()
        )) {

            factors.add(
                    "Battery percentage decreased"
            );
        }

        if (impact.getTemperatureDeltaC() != null
                && Math.abs(
                impact.getTemperatureDeltaC()
        ) > 5) {

            factors.add(
                    "Significant temperature change"
            );
        }

        if (factors.isEmpty()) {

            factors.add(
                    "No significant negative impact detected"
            );
        }

        return factors;
    }

    private boolean isPositive(
            Double value
    ) {

        return value != null
                && value > 0;
    }

    private boolean isNegative(
            Double value
    ) {

        return value != null
                && value < 0;
    }

    private String format(
            Double value
    ) {

        return String.format(
                "%.2f",
                value
        );
    }

    private String safeValue(
            Object value
    ) {

        return value == null
                ? "UNKNOWN"
                : String.valueOf(value);
    }

    public static class DecisionExplanationResult {

        private final String summary;
        private final String detailedExplanation;
        private final String operationalImplication;
        private final String primaryRisk;
        private final String riskLevel;
        private final Double riskScore;
        private final String decisionCode;
        private final String decision;
        private final List<String> impactFactors;
        private final Integer recommendationCount;

        public DecisionExplanationResult(
                String summary,
                String detailedExplanation,
                String operationalImplication,
                String primaryRisk,
                String riskLevel,
                Double riskScore,
                String decisionCode,
                String decision,
                List<String> impactFactors,
                Integer recommendationCount
        ) {

            this.summary =
                    summary;

            this.detailedExplanation =
                    detailedExplanation;

            this.operationalImplication =
                    operationalImplication;

            this.primaryRisk =
                    primaryRisk;

            this.riskLevel =
                    riskLevel;

            this.riskScore =
                    riskScore;

            this.decisionCode =
                    decisionCode;

            this.decision =
                    decision;

            this.impactFactors =
                    impactFactors;

            this.recommendationCount =
                    recommendationCount;
        }

        public String getSummary() {
            return summary;
        }

        public String getDetailedExplanation() {
            return detailedExplanation;
        }

        public String getOperationalImplication() {
            return operationalImplication;
        }

        public String getPrimaryRisk() {
            return primaryRisk;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public Double getRiskScore() {
            return riskScore;
        }

        public String getDecisionCode() {
            return decisionCode;
        }

        public String getDecision() {
            return decision;
        }

        public List<String> getImpactFactors() {
            return impactFactors;
        }

        public Integer getRecommendationCount() {
            return recommendationCount;
        }
    }
}