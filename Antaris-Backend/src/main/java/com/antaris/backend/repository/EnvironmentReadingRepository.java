package com.antaris.backend.repository;

import com.antaris.backend.entity.EnvironmentReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnvironmentReadingRepository
        extends JpaRepository<EnvironmentReading, Long> {

    List<EnvironmentReading> findByStationIdOrderByTimestampDesc(Long stationId);
}