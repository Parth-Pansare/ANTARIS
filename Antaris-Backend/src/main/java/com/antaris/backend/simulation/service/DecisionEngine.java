package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.dto.SimulationImpact;
import org.springframework.stereotype.Service;

@Service
public class DecisionEngine {

    /**
     * Converts scenario risk and impact into an
     * operational decision.
     *
     * This engine does not modify station state.
     * It only evaluates the simulated outcome.
     */
    public DecisionResult makeDecision(
            SimulationImpact impact,
            ScenarioRiskEngine.ScenarioRiskResult risk
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

        String riskLevel =
                risk.getRiskLevel();

        String decisionCode =
                determineDecisionCode(
                        riskLevel
                );

        String decision =
                determineDecision(
                        riskLevel,
                        risk.getPrimaryRisk()
                );

        String reason =
                buildDecisionReason(
                        risk,
                        impact
                );

        return new DecisionResult(
                decisionCode,
                decision,
                risk.getRiskScore(),
                riskLevel,
                risk.getPrimaryRisk(),
                reason
        );
    }

    private String determineDecisionCode(
            String riskLevel
    ) {

        if (riskLevel == null) {
            return "REVIEW_REQUIRED";
        }

        return switch (riskLevel) {

            case "LOW" ->
                    "PROCEED";

            case "MEDIUM" ->
                    "PROCEED_WITH_MONITORING";

            case "HIGH" ->
                    "REVIEW_AND_PREPARE";

            case "CRITICAL" ->
                    "IMMEDIATE_ACTION_REQUIRED";

            default ->
                    "REVIEW_REQUIRED";
        };
    }

    private String determineDecision(
            String riskLevel,
            String primaryRisk
    ) {

        if (riskLevel == null) {
            return "Further review is required before proceeding.";
        }

        return switch (riskLevel) {

            case "LOW" ->
                    "Scenario can proceed under normal operating conditions.";

            case "MEDIUM" ->
                    "Scenario can proceed with increased monitoring of "
                            + safeRiskDomain(primaryRisk)
                            + ".";

            case "HIGH" ->
                    "Scenario requires operational review and preparation "
                            + "before implementation, with focus on "
                            + safeRiskDomain(primaryRisk)
                            + ".";

            case "CRITICAL" ->
                    "Scenario requires immediate operational attention "
                            + "before implementation, with focus on "
                            + safeRiskDomain(primaryRisk)
                            + ".";

            default ->
                    "Further operational review is required.";
        };
    }

    private String buildDecisionReason(
            ScenarioRiskEngine.ScenarioRiskResult risk,
            SimulationImpact impact
    ) {

        StringBuilder reason =
                new StringBuilder();

        reason.append(
                "Decision is based on scenario risk level "
        );

        reason.append(
                risk.getRiskLevel()
        );

        reason.append(
                " with risk score "
        );

        reason.append(
                risk.getRiskScore()
        );

        reason.append(
                ". Primary risk domain: "
        );

        reason.append(
                safeRiskDomain(
                        risk.getPrimaryRisk()
                )
        );

        if (hasPositiveIncrease(
                impact.getEnergyConsumptionDeltaKw()
        )) {

            reason.append(
                    " Energy consumption increases."
            );
        }

        if (hasPositiveIncrease(
                impact.getGeneratorLoadDeltaPct()
        )) {

            reason.append(
                    " Generator load increases."
            );
        }

        if (hasPositiveIncrease(
                impact.getFuelConsumptionDeltaLph()
        )) {

            reason.append(
                    " Fuel consumption increases."
            );
        }

        if (hasNegativeChange(
                impact.getFuelPercentageDelta()
        )) {

            reason.append(
                    " Fuel level decreases."
            );
        }

        if (hasNegativeChange(
                impact.getBatteryPercentageDelta()
        )) {

            reason.append(
                    " Battery percentage decreases."
            );
        }

        if (hasSignificantTemperatureChange(
                impact.getTemperatureDeltaC()
        )) {

            reason.append(
                    " Environmental temperature changes significantly."
            );
        }

        return reason.toString();
    }

    private boolean hasPositiveIncrease(
            Double value
    ) {

        return value != null
                && value > 0;
    }

    private boolean hasNegativeChange(
            Double value
    ) {

        return value != null
                && value < 0;
    }

    private boolean hasSignificantTemperatureChange(
            Double value
    ) {

        return value != null
                && Math.abs(value) > 5;
    }

    private String safeRiskDomain(
            String primaryRisk
    ) {

        if (primaryRisk == null
                || primaryRisk.isBlank()) {

            return "the affected operational domain";
        }

        return primaryRisk;
    }

    public static class DecisionResult {

        private final String decisionCode;
        private final String decision;
        private final Double riskScore;
        private final String riskLevel;
        private final String primaryRisk;
        private final String reason;

        public DecisionResult(
                String decisionCode,
                String decision,
                Double riskScore,
                String riskLevel,
                String primaryRisk,
                String reason
        ) {

            this.decisionCode =
                    decisionCode;

            this.decision =
                    decision;

            this.riskScore =
                    riskScore;

            this.riskLevel =
                    riskLevel;

            this.primaryRisk =
                    primaryRisk;

            this.reason =
                    reason;
        }

        public String getDecisionCode() {
            return decisionCode;
        }

        public String getDecision() {
            return decision;
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
    }
}