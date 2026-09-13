package com.antaris.backend.repository;

import com.antaris.backend.entity.FuelReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuelReadingRepository
        extends JpaRepository<FuelReading, Long> {

    List<FuelReading> findByStationIdOrderByTimestampDesc(Long stationId);
}