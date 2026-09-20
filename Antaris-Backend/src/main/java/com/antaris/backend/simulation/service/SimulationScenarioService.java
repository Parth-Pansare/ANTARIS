package com.antaris.backend.simulation.service;

import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.StationRepository;
import com.antaris.backend.simulation.dto.ScenarioChangeRequest;
import com.antaris.backend.simulation.dto.ScenarioRequest;
import com.antaris.backend.simulation.entity.SimulationScenarioEntity;
import com.antaris.backend.simulation.repository.SimulationScenarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SimulationScenarioService {

    private static final int MIN_HORIZON_HOURS = 1;
    private static final int MAX_HORIZON_HOURS = 8760;

    private static final double MIN_TEMPERATURE_CHANGE_C = -100.0;
    private static final double MAX_TEMPERATURE_CHANGE_C = 100.0;

    private static final double MIN_HUMIDITY_CHANGE_PCT = -100.0;
    private static final double MAX_HUMIDITY_CHANGE_PCT = 100.0;

    private static final double MIN_WIND_RESOURCE_CHANGE = -1.0;
    private static final double MAX_WIND_RESOURCE_CHANGE = 1.0;

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

        String stationCode = request.getStation().trim();

        Station station =
                stationRepository.findByCode(stationCode)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Station not found: "
                                                + stationCode
                                )
                        );

        SimulationScenarioEntity scenario =
                new SimulationScenarioEntity();

        scenario.setStation(station);
        scenario.setScenarioName(
                request.getScenarioName().trim()
        );
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

        if (id == null || id <= 0) {

            throw new IllegalArgumentException(
                    "Scenario id must be greater than zero"
            );
        }

        return scenarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Simulation scenario not found with id: "
                                        + id
                        )
                );
    }

    public List<SimulationScenarioEntity> getScenariosByStation(
            String stationCode
    ) {

        if (stationCode == null
                || stationCode.isBlank()) {

            throw new IllegalArgumentException(
                    "Station is required"
            );
        }

        String normalizedStationCode =
                stationCode.trim();

        Station station =
                stationRepository.findByCode(
                        normalizedStationCode
                )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Station not found: "
                                                + normalizedStationCode
                                )
                        );

        return scenarioRepository
                .findByStationIdOrderByCreatedAtDesc(
                        station.getId()
                );
    }

    public void deleteScenario(Long id) {

        if (id == null || id <= 0) {

            throw new IllegalArgumentException(
                    "Scenario id must be greater than zero"
            );
        }

        if (!scenarioRepository.existsById(id)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
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

        Integer horizonHours =
                request.getHorizonHours();

        if (horizonHours == null) {

            throw new IllegalArgumentException(
                    "Horizon hours are required"
            );
        }

        if (horizonHours < MIN_HORIZON_HOURS
                || horizonHours > MAX_HORIZON_HOURS) {

            throw new IllegalArgumentException(
                    "Horizon hours must be between "
                            + MIN_HORIZON_HOURS
                            + " and "
                            + MAX_HORIZON_HOURS
            );
        }

        ScenarioChangeRequest changes =
                request.getChanges();

        if (changes == null) {
            return;
        }

        validateFiniteRange(
                "Temperature change",
                changes.getTemperatureChangeC(),
                MIN_TEMPERATURE_CHANGE_C,
                MAX_TEMPERATURE_CHANGE_C
        );

        validateFiniteRange(
                "Humidity change",
                changes.getHumidityChangePct(),
                MIN_HUMIDITY_CHANGE_PCT,
                MAX_HUMIDITY_CHANGE_PCT
        );

        validateFiniteRange(
                "Wind resource change",
                changes.getWindResourceChange(),
                MIN_WIND_RESOURCE_CHANGE,
                MAX_WIND_RESOURCE_CHANGE
        );

        validateMinimum(
                "Generator availability change",
                changes.getGeneratorAvailabilityChangePct(),
                -100.0
        );

        validateMinimum(
                "Fuel change",
                changes.getFuelChangePct(),
                -100.0
        );

        validateMinimum(
                "Battery change",
                changes.getBatteryChangePct(),
                -100.0
        );

        validateMinimum(
                "Consumption change",
                changes.getConsumptionChangePct(),
                -100.0
        );
    }

    private void validateFiniteRange(
            String fieldName,
            Double value,
            double minimum,
            double maximum
    ) {

        if (value == null) {
            return;
        }

        if (!Double.isFinite(value)) {

            throw new IllegalArgumentException(
                    fieldName + " must be a finite number"
            );
        }

        if (value < minimum
                || value > maximum) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be between "
                            + minimum
                            + " and "
                            + maximum
            );
        }
    }

    private void validateMinimum(
            String fieldName,
            Double value,
            double minimum
    ) {

        if (value == null) {
            return;
        }

        if (!Double.isFinite(value)) {

            throw new IllegalArgumentException(
                    fieldName + " must be a finite number"
            );
        }

        if (value < minimum) {

            throw new IllegalArgumentException(
                    fieldName
                            + " must be greater than or equal to "
                            + minimum
            );
        }
    }
}
