package com.antaris.backend.simulation.service;

import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.StationRepository;
import com.antaris.backend.simulation.dto.ScenarioChangeRequest;
import com.antaris.backend.simulation.dto.ScenarioRequest;
import com.antaris.backend.simulation.entity.SimulationScenarioEntity;
import com.antaris.backend.simulation.repository.SimulationScenarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SimulationScenarioService {

    private final SimulationScenarioRepository scenarioRepository;
    private final StationRepository stationRepository;

    public SimulationScenarioService(
            SimulationScenarioRepository scenarioRepository,
            StationRepository stationRepository
    ) {
        this.scenarioRepository = scenarioRepository;
        this.stationRepository = stationRepository;
    }

    public SimulationScenarioEntity createScenario(
            ScenarioRequest request
    ) {

        validateRequest(request);

        Station station =
                stationRepository.findByCode(request.getStation())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Station not found: "
                                                + request.getStation()
                                )
                        );

        SimulationScenarioEntity scenario =
                new SimulationScenarioEntity();

        scenario.setStation(station);
        scenario.setScenarioName(request.getScenarioName());
        scenario.setDescription(request.getDescription());
        scenario.setHorizonHours(request.getHorizonHours());

        ScenarioChangeRequest changes =
                request.getChanges();

        if (changes != null) {

            scenario.setTemperatureChangeC(
                    changes.getTemperatureChangeC()
            );

            scenario.setHumidityChangePct(
                    changes.getHumidityChangePct()
            );

            scenario.setWindResourceChange(
                    changes.getWindResourceChange()
            );

            scenario.setGeneratorAvailabilityChangePct(
                    changes.getGeneratorAvailabilityChangePct()
            );

            scenario.setFuelChangePct(
                    changes.getFuelChangePct()
            );

            scenario.setBatteryChangePct(
                    changes.getBatteryChangePct()
            );

            scenario.setConsumptionChangePct(
                    changes.getConsumptionChangePct()
            );
        }

        scenario.setCreatedAt(
                LocalDateTime.now()
        );

        return scenarioRepository.save(scenario);
    }

    public List<SimulationScenarioEntity> getAllScenarios() {

        return scenarioRepository
                .findAllByOrderByCreatedAtDesc();
    }

    public SimulationScenarioEntity getScenarioById(
            Long id
    ) {

        return scenarioRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Simulation scenario not found with id: "
                                        + id
                        )
                );
    }

    public List<SimulationScenarioEntity> getScenariosByStation(
            String stationCode
    ) {

        Station station =
                stationRepository.findByCode(stationCode)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Station not found: "
                                                + stationCode
                                )
                        );

        return scenarioRepository
                .findByStationIdOrderByCreatedAtDesc(
                        station.getId()
                );
    }

    public void deleteScenario(Long id) {

        if (!scenarioRepository.existsById(id)) {

            throw new RuntimeException(
                    "Simulation scenario not found with id: "
                            + id
            );
        }

        scenarioRepository.deleteById(id);
    }

    private void validateRequest(
            ScenarioRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Scenario request cannot be null"
            );
        }

        if (request.getStation() == null
                || request.getStation().isBlank()) {

            throw new IllegalArgumentException(
                    "Station is required"
            );
        }

        if (request.getScenarioName() == null
                || request.getScenarioName().isBlank()) {

            throw new IllegalArgumentException(
                    "Scenario name is required"
            );
        }

        if (request.getHorizonHours() == null
                || request.getHorizonHours() <= 0) {

            throw new IllegalArgumentException(
                    "Horizon hours must be greater than zero"
            );
        }
    }
}