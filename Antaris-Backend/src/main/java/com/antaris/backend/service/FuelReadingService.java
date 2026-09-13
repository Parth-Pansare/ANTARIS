package com.antaris.backend.service;

import com.antaris.backend.dto.FuelReadingResponse;
import com.antaris.backend.entity.FuelReading;
import com.antaris.backend.repository.FuelReadingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FuelReadingService {

    private final FuelReadingRepository fuelReadingRepository;

    public FuelReadingService(FuelReadingRepository fuelReadingRepository) {
        this.fuelReadingRepository = fuelReadingRepository;
    }

    public List<FuelReadingResponse> getReadingsByStation(Long stationId) {

        return fuelReadingRepository
                .findByStationIdOrderByTimestampDesc(stationId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public FuelReadingResponse getLatestReading(Long stationId) {

        List<FuelReading> readings =
                fuelReadingRepository
                        .findByStationIdOrderByTimestampDesc(stationId);

        if (readings.isEmpty()) {
            return null;
        }

        return convertToResponse(readings.get(0));
    }

    public FuelReading saveReading(FuelReading reading) {
        return fuelReadingRepository.save(reading);
    }

    private FuelReadingResponse convertToResponse(FuelReading reading) {

        return new FuelReadingResponse(
                reading.getId(),
                reading.getStation().getId(),
                reading.getStation().getCode(),

                reading.getFuelLevel(),
                reading.getFuelCapacity(),
                reading.getFuelPercentage(),
                reading.getConsumptionRate(),
                reading.getEstimatedRuntimeHours(),
                reading.getDailyConsumption(),

                reading.getLastRefill(),
                reading.getTimestamp()
        );
    }
}