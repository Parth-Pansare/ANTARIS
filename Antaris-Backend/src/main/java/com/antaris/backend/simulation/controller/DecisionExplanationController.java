package com.antaris.backend.simulation.controller;

import com.antaris.backend.simulation.dto.SimulationImpact;
import com.antaris.backend.simulation.service.ActionRecommendationEngine;
import com.antaris.backend.simulation.service.DecisionEngine;
import com.antaris.backend.simulation.service.DecisionExplanationEngine;
import com.antaris.backend.simulation.service.ScenarioRiskEngine;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation/explanation")
public class DecisionExplanationController {

    private final DecisionExplanationEngine
            decisionExplanationEngine;

    private final ScenarioRiskEngine
            scenarioRiskEngine;

    private final DecisionEngine
            decisionEngine;

    private final ActionRecommendationEngine
            actionRecommendationEngine;

    public DecisionExplanationController(
            DecisionExplanationEngine decisionExplanationEngine,
            ScenarioRiskEngine scenarioRiskEngine,
            DecisionEngine decisionEngine,
            ActionRecommendationEngine actionRecommendationEngine
    ) {

        this.decisionExplanationEngine =
                decisionExplanationEngine;

        this.scenarioRiskEngine =
                scenarioRiskEngine;

        this.decisionEngine =
                decisionEngine;

        this.actionRecommendationEngine =
                actionRecommendationEngine;
    }

    /**
     * Generates a complete explanation for a
     * simulated scenario decision.
     *
     * Flow:
     *
     * Simulation Impact
     *       ↓
     * Scenario Risk Engine
     *       ↓
     * Decision Engine
     *       ↓
     * Recommendation Engine
     *       ↓
     * Decision Explanation Engine
     */
    @PostMapping
    public DecisionExplanationEngine.DecisionExplanationResult
    explainDecision(
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

        ActionRecommendationEngine.RecommendationResult
                recommendations =
                actionRecommendationEngine
                        .generateRecommendations(
                                impact,
                                risk,
                                decision
                        );

        return decisionExplanationEngine.explain(
                impact,
                risk,
                decision,
                recommendations
        );
    }
}