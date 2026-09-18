package com.antaris.backend.simulation.controller;

import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.StationRepository;
import com.antaris.backend.simulation.SimulationScenario;
import com.antaris.backend.simulation.service.ScenarioComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulation/comparison")
public class ScenarioComparisonController {

    private final ScenarioComparisonService
            scenarioComparisonService;

    private final StationRepository
            stationRepository;

    public ScenarioComparisonController(
            ScenarioComparisonService scenarioComparisonService,
            StationRepository stationRepository
    ) {

        this.scenarioComparisonService =
                scenarioComparisonService;

        this.stationRepository =
                stationRepository;
    }

    /**
     * Compare multiple simulation scenarios
     * for a specific station.
     *
     * Example:
     * POST /api/simulation/comparison/BHARATI
     */
    @PostMapping("/{stationCode}")
    public ResponseEntity<
            List<ScenarioComparisonService.ScenarioComparisonResult>
            > compareScenarios(
            @PathVariable String stationCode,
            @RequestBody List<SimulationScenario> scenarios
    ) {

        Station station =
                stationRepository.findByCode(stationCode)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Station not found: "
                                                + stationCode
                                )
                        );

        List<ScenarioComparisonService.ScenarioComparisonResult>
                results =
                scenarioComparisonService.compare(
                        station,
                        scenarios
                );

        return ResponseEntity.ok(results);
    }

    /**
     * Compare exactly two simulation scenarios
     * for a specific station.
     *
     * Example:
     * POST /api/simulation/comparison/BHARATI/pair
     */
    @PostMapping("/{stationCode}/pair")
    public ResponseEntity<
            ScenarioComparisonService.ScenarioPairComparisonResult
            > comparePair(
            @PathVariable String stationCode,
            @RequestBody List<SimulationScenario> scenarios
    ) {

        if (scenarios == null || scenarios.size() != 2) {

            throw new IllegalArgumentException(
                    "Exactly two scenarios are required."
            );
        }

        Station station =
                stationRepository.findByCode(stationCode)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Station not found: "
                                                + stationCode
                                )
                        );

        ScenarioComparisonService
                .ScenarioPairComparisonResult result =
                scenarioComparisonService.comparePair(
                        station,
                        scenarios.get(0),
                        scenarios.get(1)
                );

        return ResponseEntity.ok(result);
    }
}