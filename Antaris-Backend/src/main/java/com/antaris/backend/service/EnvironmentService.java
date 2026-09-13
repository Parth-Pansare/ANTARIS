package com.antaris.backend.service;

import com.antaris.backend.dto.EnvironmentReadingResponse;
import com.antaris.backend.entity.EnvironmentReading;
import com.antaris.backend.repository.EnvironmentReadingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnvironmentService {

    private final EnvironmentReadingRepository environmentReadingRepository;

    public EnvironmentService(EnvironmentReadingRepository environmentReadingRepository) {
        this.environmentReadingRepository = environmentReadingRepository;
    }

    public List<EnvironmentReadingResponse> getReadingsByStation(Long stationId) {

        return environmentReadingRepository
                .findByStationIdOrderByTimestampDesc(stationId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public EnvironmentReadingResponse getLatestReading(Long stationId) {

        List<EnvironmentReading> readings =
                environmentReadingRepository
                        .findByStationIdOrderByTimestampDesc(stationId);

        if (readings.isEmpty()) {
            return null;
        }

        return convertToResponse(readings.get(0));
    }

    public EnvironmentReading saveReading(EnvironmentReading reading) {
        return environmentReadingRepository.save(reading);
    }

    private EnvironmentReadingResponse convertToResponse(
            EnvironmentReading reading) {

        return new EnvironmentReadingResponse(
                reading.getId(),
                reading.getStation().getId(),
                reading.getStation().getCode(),
                reading.getTemperature(),
                reading.getHumidity(),
                reading.getPressure(),
                reading.getWindSpeed(),
                reading.getWindDirection(),
                reading.getTimestamp()
        );
    }
}