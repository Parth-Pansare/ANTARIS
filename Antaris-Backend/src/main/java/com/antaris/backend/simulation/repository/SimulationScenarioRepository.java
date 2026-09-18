package com.antaris.backend.simulation.repository;

import com.antaris.backend.simulation.entity.SimulationScenarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SimulationScenarioRepository
        extends JpaRepository<SimulationScenarioEntity, Long> {

    List<SimulationScenarioEntity>
    findByStationIdOrderByCreatedAtDesc(Long stationId);

    List<SimulationScenarioEntity>
    findAllByOrderByCreatedAtDesc();
}