package com.antaris.backend.simulation.controller;

import com.antaris.backend.simulation.dto.ScenarioRequest;
import com.antaris.backend.simulation.entity.SimulationScenarioEntity;
import com.antaris.backend.simulation.service.SimulationScenarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulation/scenarios")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:8443"
        }
)
public class SimulationScenarioController {

    private final SimulationScenarioService scenarioService;

    public SimulationScenarioController(
            SimulationScenarioService scenarioService
    ) {
        this.scenarioService = scenarioService;
    }

    @PostMapping
    public SimulationScenarioEntity createScenario(
            @RequestBody ScenarioRequest request
    ) {
        return scenarioService.createScenario(request);
    }

    @GetMapping
    public List<SimulationScenarioEntity> getAllScenarios() {
        return scenarioService.getAllScenarios();
    }

    @GetMapping("/{id}")
    public SimulationScenarioEntity getScenarioById(
            @PathVariable Long id
    ) {
        return scenarioService.getScenarioById(id);
    }

    @GetMapping("/station/{stationCode}")
    public List<SimulationScenarioEntity> getScenariosByStation(
            @PathVariable String stationCode
    ) {
        return scenarioService.getScenariosByStation(
                stationCode
        );
    }

    @DeleteMapping("/{id}")
    public void deleteScenario(
            @PathVariable Long id
    ) {
        scenarioService.deleteScenario(id);
    }
}