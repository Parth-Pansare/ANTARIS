package com.antaris.backend.repository;

import com.antaris.backend.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PredictionRepository
        extends JpaRepository<Prediction, Long> {

    List<Prediction> findByStationIdAndPredictionTypeOrderByPredictionTimestampDesc(
            Long stationId,
            String predictionType
    );

    List<Prediction> findByStationIdOrderByPredictionTimestampDesc(
            Long stationId
    );
}