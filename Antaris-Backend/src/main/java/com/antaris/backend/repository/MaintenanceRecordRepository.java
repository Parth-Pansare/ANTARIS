package com.antaris.backend.repository;

import com.antaris.backend.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRecordRepository
        extends JpaRepository<MaintenanceRecord, Long> {

    List<MaintenanceRecord> findByStationIdOrderByScheduledDateDesc(
            Long stationId
    );
}