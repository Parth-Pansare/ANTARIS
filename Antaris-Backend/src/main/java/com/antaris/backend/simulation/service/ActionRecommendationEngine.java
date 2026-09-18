package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.dto.SimulationImpact;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ActionRecommendationEngine {

    /**
     * Generates operational recommendations from
     * scenario risk, decision and simulation impact.
     *
     * This engine does not modify actual station state.
     * It only provides recommended actions.
     */
    public RecommendationResult generateRecommendations(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            DecisionEngine.DecisionResult decision
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

        List<ActionRecommendation> recommendations =
                new ArrayList<>();

        addEnergyRecommendations(
                impact,
                risk,
                recommendations
        );

        addGeneratorRecommendations(
                impact,
                risk,
                recommendations
        );

        addFuelRecommendations(
                impact,
                risk,
                recommendations
        );

        addBatteryRecommendations(
                impact,
                risk,
                recommendations
        );

        addEnvironmentRecommendations(
                impact,
                risk,
                recommendations
        );

        if (recommendations.isEmpty()) {

            recommendations.add(
                    new ActionRecommendation(
                            "NORMAL_MONITORING",
                            "Continue normal station monitoring.",
                            "LOW",
                            "No significant operational impact was detected."
                    )
            );
        }

        return new RecommendationResult(
                decision.getDecisionCode(),
                decision.getDecision(),
                risk.getRiskLevel(),
                risk.getRiskScore(),
                risk.getPrimaryRisk(),
                recommendations
        );
    }

    private void addEnergyRecommendations(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            List<ActionRecommendation> recommendations
    ) {

        Double energyDelta =
                impact.getEnergyConsumptionDeltaKw();

        if (energyDelta == null
                || energyDelta <= 0) {
            return;
        }

        if (energyDelta > 50) {

            recommendations.add(
                    new ActionRecommendation(
                            "REDUCE_NON_ESSENTIAL_LOAD",
                            "Reduce or temporarily disable non-essential electrical loads.",
                            "HIGH",
                            "Simulated energy consumption increases significantly."
                    )
            );
        }

        if ("ENERGY".equals(risk.getPrimaryRisk())) {

            recommendations.add(
                    new ActionRecommendation(
                            "REVIEW_POWER_ALLOCATION",
                            "Review station power allocation and prioritize critical infrastructure.",
                            risk.getRiskLevel(),
                            "Energy is identified as the primary scenario risk."
                    )
            );
        }
    }

    private void addGeneratorRecommendations(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            List<ActionRecommendation> recommendations
    ) {

        Double generatorDelta =
                impact.getGeneratorLoadDeltaPct();

        if (generatorDelta == null
                || generatorDelta <= 0) {
            return;
        }

        if (generatorDelta > 10) {

            recommendations.add(
                    new ActionRecommendation(
                            "INSPECT_GENERATOR",
                            "Inspect generator operating condition and available generation capacity.",
                            "HIGH",
                            "Simulated generator load increases significantly."
                    )
            );
        }

        if ("GENERATOR".equals(risk.getPrimaryRisk())) {

            recommendations.add(
                    new ActionRecommendation(
                            "MONITOR_GENERATOR_LOAD",
                            "Closely monitor generator load and generation stability.",
                            risk.getRiskLevel(),
                            "Generator is identified as the primary scenario risk."
                    )
            );
        }
    }

    private void addFuelRecommendations(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            List<ActionRecommendation> recommendations
    ) {

        Double fuelLevelDelta =
                impact.getFuelPercentageDelta();

        Double fuelConsumptionDelta =
                impact.getFuelConsumptionDeltaLph();

        boolean fuelLevelDecreasing =
                fuelLevelDelta != null
                        && fuelLevelDelta < 0;

        boolean fuelConsumptionIncreasing =
                fuelConsumptionDelta != null
                        && fuelConsumptionDelta > 0;

        if (!fuelLevelDecreasing
                && !fuelConsumptionIncreasing) {
            return;
        }

        if (fuelLevelDecreasing) {

            recommendations.add(
                    new ActionRecommendation(
                            "REVIEW_FUEL_RESERVE",
                            "Review available fuel reserves and expected station runtime.",
                            "MEDIUM",
                            "The simulated scenario decreases fuel availability."
                    )
            );
        }

        if (fuelConsumptionIncreasing) {

            recommendations.add(
                    new ActionRecommendation(
                            "MONITOR_FUEL_CONSUMPTION",
                            "Monitor fuel consumption rate and generator operating duration.",
                            "MEDIUM",
                            "The simulated scenario increases fuel consumption."
                    )
            );
        }

        if ("FUEL".equals(risk.getPrimaryRisk())) {

            recommendations.add(
                    new ActionRecommendation(
                            "PLAN_FUEL_RESUPPLY",
                            "Evaluate fuel resupply requirements before implementing the scenario.",
                            risk.getRiskLevel(),
                            "Fuel is identified as the primary scenario risk."
                    )
            );
        }
    }

    private void addBatteryRecommendations(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            List<ActionRecommendation> recommendations
    ) {

        Double batteryDelta =
                impact.getBatteryPercentageDelta();

        if (batteryDelta == null
                || batteryDelta >= 0) {
            return;
        }

        if (batteryDelta <= -10) {

            recommendations.add(
                    new ActionRecommendation(
                            "PROTECT_BATTERY_RESERVE",
                            "Reduce avoidable electrical demand and preserve battery reserve.",
                            "HIGH",
                            "The simulated scenario causes a significant battery decrease."
                    )
            );
        } else {

            recommendations.add(
                    new ActionRecommendation(
                            "MONITOR_BATTERY",
                            "Monitor battery percentage and charging availability.",
                            "MEDIUM",
                            "The simulated scenario decreases battery percentage."
                    )
            );
        }

        if ("BATTERY".equals(risk.getPrimaryRisk())) {

            recommendations.add(
                    new ActionRecommendation(
                            "REVIEW_BATTERY_CAPACITY",
                            "Review battery capacity and expected discharge duration.",
                            risk.getRiskLevel(),
                            "Battery is identified as the primary scenario risk."
                    )
            );
        }
    }

    private void addEnvironmentRecommendations(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk,
            List<ActionRecommendation> recommendations
    ) {

        Double temperatureDelta =
                impact.getTemperatureDeltaC();

        if (temperatureDelta == null) {
            return;
        }

        if (Math.abs(temperatureDelta) > 10) {

            recommendations.add(
                    new ActionRecommendation(
                            "REVIEW_ENVIRONMENTAL_IMPACT",
                            "Review station environmental protection and heating/cooling requirements.",
                            "HIGH",
                            "The simulated temperature change is significant."
                    )
            );
        }

        if ("ENVIRONMENT".equals(risk.getPrimaryRisk())) {

            recommendations.add(
                    new ActionRecommendation(
                            "MONITOR_ENVIRONMENT",
                            "Closely monitor environmental conditions and station infrastructure response.",
                            risk.getRiskLevel(),
                            "Environment is identified as the primary scenario risk."
                    )
            );
        }
    }

    public static class RecommendationResult {

        private final String decisionCode;
        private final String decision;
        private final String riskLevel;
        private final Double riskScore;
        private final String primaryRisk;
        private final List<ActionRecommendation> recommendations;

        public RecommendationResult(
                String decisionCode,
                String decision,
                String riskLevel,
                Double riskScore,
                String primaryRisk,
                List<ActionRecommendation> recommendations
        ) {

            this.decisionCode =
                    decisionCode;

            this.decision =
                    decision;

            this.riskLevel =
                    riskLevel;

            this.riskScore =
                    riskScore;

            this.primaryRisk =
                    primaryRisk;

            this.recommendations =
                    recommendations;
        }

        public String getDecisionCode() {
            return decisionCode;
        }

        public String getDecision() {
            return decision;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public Double getRiskScore() {
            return riskScore;
        }

        public String getPrimaryRisk() {
            return primaryRisk;
        }

        public List<ActionRecommendation> getRecommendations() {
            return recommendations;
        }
    }

    public static class ActionRecommendation {

        private final String actionCode;
        private final String action;
        private final String priority;
        private final String reason;

        public ActionRecommendation(
                String actionCode,
                String action,
                String priority,
                String reason
        ) {

            this.actionCode =
                    actionCode;

            this.action =
                    action;

            this.priority =
                    priority;

            this.reason =
                    reason;
        }

        public String getActionCode() {
            return actionCode;
        }

        public String getAction() {
            return action;
        }

        public String getPriority() {
            return priority;
        }

        public String getReason() {
            return reason;
        }
    }
}