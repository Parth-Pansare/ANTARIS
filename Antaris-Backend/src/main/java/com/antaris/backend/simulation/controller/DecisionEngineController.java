package com.antaris.backend.simulation.controller;

import com.antaris.backend.simulation.dto.SimulationImpact;
import com.antaris.backend.simulation.service.DecisionEngine;
import com.antaris.backend.simulation.service.ScenarioRiskEngine;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation/decision")
public class DecisionEngineController {

    private final DecisionEngine decisionEngine;

    private final ScenarioRiskEngine scenarioRiskEngine;

    public DecisionEngineController(
            DecisionEngine decisionEngine,
            ScenarioRiskEngine scenarioRiskEngine
    ) {
        this.decisionEngine = decisionEngine;
        this.scenarioRiskEngine = scenarioRiskEngine;
    }

    /**
     * Evaluates a simulation impact and returns
     * the corresponding operational decision.
     *
     * The request contains the scenario impact.
     * Risk is calculated internally using the
     * Phase 3 Scenario Risk Engine.
     */
    @PostMapping
    public DecisionEngine.DecisionResult makeDecision(
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

        return decisionEngine.makeDecision(
                impact,
                risk
        );
    }
}