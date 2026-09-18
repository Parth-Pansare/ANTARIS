package com.antaris.backend.simulation.service;

import com.antaris.backend.entity.Station;
import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationScenario;
import com.antaris.backend.simulation.dto.SimulationImpact;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScenarioComparisonService {

    private final MultiVariableSimulationService
            multiVariableSimulationService;

    private final ScenarioImpactAnalysisService
            scenarioImpactAnalysisService;

    private final ScenarioRiskEngine
            scenarioRiskEngine;

    public ScenarioComparisonService(
            MultiVariableSimulationService
                    multiVariableSimulationService,
            ScenarioImpactAnalysisService
                    scenarioImpactAnalysisService,
            ScenarioRiskEngine scenarioRiskEngine
    ) {

        this.multiVariableSimulationService =
                multiVariableSimulationService;

        this.scenarioImpactAnalysisService =
                scenarioImpactAnalysisService;

        this.scenarioRiskEngine =
                scenarioRiskEngine;
    }

    /**
     * Compares multiple scenarios for the same station.
     *
     * Every scenario is evaluated independently against
     * the current baseline state.
     *
     * The actual station state is never modified.
     */
    public List<ScenarioComparisonResult> compare(
            Station station,
            List<SimulationScenario> scenarios
    ) {

        if (station == null) {
            throw new IllegalArgumentException(
                    "Station cannot be null."
            );
        }

        if (scenarios == null
                || scenarios.isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one scenario is required."
            );
        }

        List<ScenarioComparisonResult> results =
                new ArrayList<>();

        for (SimulationScenario scenario : scenarios) {

            if (scenario == null) {
                continue;
            }

            MultiVariableSimulationService
                    .MultiVariableSimulationResult simulationResult =
                    multiVariableSimulationService.simulate(
                            station,
                            scenario
                    );

            SimulationImpact impact =
                    scenarioImpactAnalysisService.calculateImpact(
                            simulationResult
                                    .getBaselineState()
                                    .getState(),

                            simulationResult
                                    .getSimulatedState()
                                    .getState()
                    );

            ScenarioRiskEngine.ScenarioRiskResult risk =
                    scenarioRiskEngine.evaluateRisk(
                            impact
                    );

            results.add(
                    new ScenarioComparisonResult(
                            scenario.getScenarioName(),
                            scenario.getDescription(),
                            scenario.getHorizonHours(),
                            impact,
                            risk
                    )
            );
        }

        return results;
    }

    /**
     * Convenience method for comparing exactly two scenarios.
     */
    public ScenarioPairComparisonResult comparePair(
            Station station,
            SimulationScenario firstScenario,
            SimulationScenario secondScenario
    ) {

        if (firstScenario == null
                || secondScenario == null) {

            throw new IllegalArgumentException(
                    "Both scenarios are required."
            );
        }

        List<SimulationScenario> scenarios =
                List.of(
                        firstScenario,
                        secondScenario
                );

        List<ScenarioComparisonResult> results =
                compare(
                        station,
                        scenarios
                );

        return new ScenarioPairComparisonResult(
                results
        );
    }

    /**
     * Result for one scenario.
     */
    public static class ScenarioComparisonResult {

        private final String scenarioName;
        private final String description;
        private final Integer horizonHours;
        private final SimulationImpact impact;
        private final ScenarioRiskEngine.ScenarioRiskResult risk;

        public ScenarioComparisonResult(
                String scenarioName,
                String description,
                Integer horizonHours,
                SimulationImpact impact,
                ScenarioRiskEngine.ScenarioRiskResult risk
        ) {

            this.scenarioName =
                    scenarioName;

            this.description =
                    description;

            this.horizonHours =
                    horizonHours;

            this.impact =
                    impact;

            this.risk =
                    risk;
        }

        public String getScenarioName() {
            return scenarioName;
        }

        public String getDescription() {
            return description;
        }

        public Integer getHorizonHours() {
            return horizonHours;
        }

        public SimulationImpact getImpact() {
            return impact;
        }

        public ScenarioRiskEngine.ScenarioRiskResult getRisk() {
            return risk;
        }
    }

    /**
     * Result containing a pair of scenario comparisons.
     */
    public static class ScenarioPairComparisonResult {

        private final List<ScenarioComparisonResult> scenarios;

        public ScenarioPairComparisonResult(
                List<ScenarioComparisonResult> scenarios
        ) {

            this.scenarios =
                    scenarios;
        }

        public List<ScenarioComparisonResult> getScenarios() {
            return scenarios;
        }
    }
}