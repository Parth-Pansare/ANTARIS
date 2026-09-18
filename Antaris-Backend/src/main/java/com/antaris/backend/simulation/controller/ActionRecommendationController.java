package com.antaris.backend.simulation.controller;

import com.antaris.backend.simulation.dto.SimulationImpact;
import com.antaris.backend.simulation.service.ActionRecommendationEngine;
import com.antaris.backend.simulation.service.DecisionEngine;
import com.antaris.backend.simulation.service.ScenarioRiskEngine;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation/recommendations")
public class ActionRecommendationController {

    private final ActionRecommendationEngine
            actionRecommendationEngine;

    private final ScenarioRiskEngine
            scenarioRiskEngine;

    private final DecisionEngine
            decisionEngine;

    public ActionRecommendationController(
            ActionRecommendationEngine actionRecommendationEngine,
            ScenarioRiskEngine scenarioRiskEngine,
            DecisionEngine decisionEngine
    ) {

        this.actionRecommendationEngine =
                actionRecommendationEngine;

        this.scenarioRiskEngine =
                scenarioRiskEngine;

        this.decisionEngine =
                decisionEngine;
    }

    /**
     * Generates operational recommendations from
     * a simulated scenario impact.
     *
     * Flow:
     *
     * Simulation Impact
     *       ↓
     * Scenario Risk Engine
     *       ↓
     * Decision Engine
     *       ↓
     * Action Recommendation Engine
     */
    @PostMapping
    public ActionRecommendationEngine.RecommendationResult
    generateRecommendations(
            @RequestBody SimulationImpact impact
    ) {

        if (impact == null) {
            throw new IllegalArgumentException(
                    "Simulation impact cannot be null."
            );
        }

        ScenarioRiskEngine.ScenarioRiskResult risk =
                scenarioRiskEngine.evaluateRisk(
                        impact
                );

        DecisionEngine.DecisionResult decision =
                decisionEngine.makeDecision(
                        impact,
                        risk
                );

        return actionRecommendationEngine
                .generateRecommendations(
                        impact,
                        risk,
                        decision
                );
    }
}