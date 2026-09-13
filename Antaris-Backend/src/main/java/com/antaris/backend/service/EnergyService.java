package com.antaris.backend.service;

import com.antaris.backend.dto.EnergyReadingResponse;
import com.antaris.backend.entity.EnergyReading;
import com.antaris.backend.repository.EnergyReadingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnergyService {

    private final EnergyReadingRepository energyReadingRepository;

    public EnergyService(EnergyReadingRepository energyReadingRepository) {
        this.energyReadingRepository = energyReadingRepository;
    }

    public List<EnergyReadingResponse> getReadingsByStation(Long stationId) {

        return energyReadingRepository
                .findByStationIdOrderByTimestampDesc(stationId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public EnergyReadingResponse getLatestReading(Long stationId) {

        List<EnergyReading> readings =
                energyReadingRepository
                        .findByStationIdOrderByTimestampDesc(stationId);

        if (readings.isEmpty()) {
            return null;
        }

        return convertToResponse(readings.get(0));
    }

    public EnergyReading saveReading(EnergyReading reading) {
        return energyReadingRepository.save(reading);
    }

    private EnergyReadingResponse convertToResponse(
            EnergyReading reading) {

        double totalGeneration =
                reading.getSolarGeneration()
                        + reading.getWindGeneration()
                        + reading.getGeneratorGeneration();

        double powerBalance =
                totalGeneration - reading.getTotalConsumption();

        return new EnergyReadingResponse(
                reading.getId(),
                reading.getStation().getId(),
                reading.getStation().getCode(),

                reading.getSolarGeneration(),
                reading.getWindGeneration(),
                reading.getGeneratorGeneration(),

                totalGeneration,
                reading.getTotalConsumption(),
                powerBalance,

                reading.getBatteryLevel(),
                reading.getBatteryPercentage(),
                reading.getGeneratorLoad(),

                reading.getTimestamp()
        );
    }
}