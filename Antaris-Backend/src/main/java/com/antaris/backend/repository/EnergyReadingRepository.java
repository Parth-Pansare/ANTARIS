package com.antaris.backend.repository;

import com.antaris.backend.entity.EnergyReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnergyReadingRepository
        extends JpaRepository<EnergyReading, Long> {

    List<EnergyReading> findByStationIdOrderByTimestampDesc(Long stationId);
}