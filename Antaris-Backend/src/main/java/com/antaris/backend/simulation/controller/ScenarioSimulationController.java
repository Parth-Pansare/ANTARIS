package com.antaris.backend.simulation.controller;

import com.antaris.backend.entity.Station;
import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationScenario;
import com.antaris.backend.simulation.dto.SimulationImpact;
import com.antaris.backend.simulation.dto.SimulationResult;
import com.antaris.backend.simulation.entity.SimulationScenarioEntity;
import com.antaris.backend.simulation.service.MultiVariableSimulationService;
import com.antaris.backend.simulation.service.ScenarioImpactAnalysisService;
import com.antaris.backend.simulation.service.SimulationScenarioService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation/scenarios")
public class ScenarioSimulationController {

    private final SimulationScenarioService
            simulationScenarioService;

    private final MultiVariableSimulationService
            multiVariableSimulationService;

    private final ScenarioImpactAnalysisService
            scenarioImpactAnalysisService;

    public ScenarioSimulationController(
            SimulationScenarioService simulationScenarioService,
            MultiVariableSimulationService multiVariableSimulationService,
            ScenarioImpactAnalysisService scenarioImpactAnalysisService
    ) {

        this.simulationScenarioService =
                simulationScenarioService;

        this.multiVariableSimulationService =
                multiVariableSimulationService;

        this.scenarioImpactAnalysisService =
                scenarioImpactAnalysisService;
    }

    /**
     * Runs a saved simulation scenario and calculates
     * the resulting impact.
     *
     * Important:
     * The scenario is evaluated against a copied
     * current state. Actual station telemetry is
     * never modified by this endpoint.
     */
    @PostMapping("/{id}/run")
    public SimulationResult runScenario(
            @PathVariable Long id
    ) {

        // =====================================================
        // 1. LOAD SAVED SCENARIO
        // =====================================================

        SimulationScenarioEntity entity =
                simulationScenarioService
                        .getScenarioById(id);

        if (entity == null) {

            throw new IllegalArgumentException(
                    "Simulation scenario cannot be null."
            );
        }

        // =====================================================
        // 2. RESOLVE STATION
        // =====================================================

        Station station =
                entity.getStation();

        if (station == null) {

            throw new IllegalArgumentException(
                    "Scenario station cannot be null."
            );
        }

        // =====================================================
        // 3. CONVERT ENTITY TO DOMAIN SCENARIO
        // =====================================================

        SimulationScenario scenario =
                convertToSimulationScenario(
                        entity
                );

        // =====================================================
        // 4. RUN MULTI-VARIABLE SIMULATION
        // =====================================================

        MultiVariableSimulationService
                .MultiVariableSimulationResult result =
                multiVariableSimulationService.simulate(
                        station,
                        scenario
                );

        // =====================================================
        // 5. CALCULATE SCENARIO IMPACT
        // =====================================================

        SimulationImpact impact =
                scenarioImpactAnalysisService.calculateImpact(
                        result.getBaselineState().getState(),
                        result.getSimulatedState().getState()
                );

        // =====================================================
        // 6. BUILD RESPONSE
        // =====================================================

        SimulationResult response =
                new SimulationResult();

        response.setStation(
                station.getCode()
        );

        response.setScenarioName(
                scenario.getScenarioName()
        );

        response.setHorizonHours(
                scenario.getHorizonHours()
        );

        response.setBaselineState(
                result.getBaselineState()
                        .getState()
        );

        response.setSimulatedState(
                result.getSimulatedState()
                        .getState()
        );

        response.setImpact(
                impact
        );

        return response;
    }

    /**
     * Converts the persisted scenario entity into
     * the domain simulation scenario used by the
     * simulation services.
     */
    private SimulationScenario convertToSimulationScenario(
            SimulationScenarioEntity entity
    ) {

        SimulationScenario scenario =
                new SimulationScenario();

        scenario.setStation(
                entity.getStation().getCode()
        );

        scenario.setScenarioName(
                entity.getScenarioName()
        );

        scenario.setDescription(
                entity.getDescription()
        );

        scenario.setHorizonHours(
                entity.getHorizonHours()
        );

        ScenarioChange changes =
                new ScenarioChange();

        changes.setTemperatureChangeC(
                entity.getTemperatureChangeC()
        );

        changes.setHumidityChangePct(
                entity.getHumidityChangePct()
        );

        changes.setWindResourceChange(
                entity.getWindResourceChange()
        );

        changes.setGeneratorAvailabilityChangePct(
                entity.getGeneratorAvailabilityChangePct()
        );

        changes.setFuelChangePct(
                entity.getFuelChangePct()
        );

        changes.setBatteryChangePct(
                entity.getBatteryChangePct()
        );

        changes.setConsumptionChangePct(
                entity.getConsumptionChangePct()
        );

        scenario.setChanges(
                changes
        );

        return scenario;
    }
}