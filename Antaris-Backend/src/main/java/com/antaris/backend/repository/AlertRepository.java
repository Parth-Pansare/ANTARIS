package com.antaris.backend.repository;

import com.antaris.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByStationIdOrderByTimestampDesc(Long stationId);

    List<Alert> findByStationIdAndAcknowledgedFalseOrderByTimestampDesc(Long stationId);

    List<Alert> findBySourceAndActiveTrue(String source);
}