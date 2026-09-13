package com.antaris.backend.config;

import com.antaris.backend.entity.FuelReading;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.FuelReadingRepository;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class FuelDataInitializer implements CommandLineRunner {

    private final FuelReadingRepository fuelReadingRepository;
    private final StationRepository stationRepository;

    public FuelDataInitializer(
            FuelReadingRepository fuelReadingRepository,
            StationRepository stationRepository) {

        this.fuelReadingRepository = fuelReadingRepository;
        this.stationRepository = stationRepository;
    }

    @Override
    public void run(String... args) {

        if (fuelReadingRepository.count() > 0) {
            return;
        }

        Station maitri = stationRepository.findAll()
                .stream()
                .filter(station -> "MAITRI".equals(station.getCode()))
                .findFirst()
                .orElse(null);

        Station bharati = stationRepository.findAll()
                .stream()
                .filter(station -> "BHARATI".equals(station.getCode()))
                .findFirst()
                .orElse(null);

        if (maitri == null || bharati == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        // ================================
        // MAITRI FUEL HISTORY
        // ================================

        fuelReadingRepository.save(new FuelReading(
                null,
                maitri,
                68400.0,
                100000.0,
                68.4,
                185.0,
                370.0,
                4440.0,
                now.minusDays(12),
                now.minusHours(3)
        ));

        fuelReadingRepository.save(new FuelReading(
                null,
                maitri,
                67600.0,
                100000.0,
                67.6,
                188.0,
                360.0,
                4512.0,
                now.minusDays(12),
                now.minusHours(2)
        ));

        fuelReadingRepository.save(new FuelReading(
                null,
                maitri,
                66750.0,
                100000.0,
                66.75,
                190.0,
                351.0,
                4560.0,
                now.minusDays(12),
                now.minusHours(1)
        ));

        fuelReadingRepository.save(new FuelReading(
                null,
                maitri,
                65900.0,
                100000.0,
                65.9,
                192.0,
                343.0,
                4608.0,
                now.minusDays(12),
                now
        ));

        // ================================
        // BHARATI FUEL HISTORY
        // ================================

        fuelReadingRepository.save(new FuelReading(
                null,
                bharati,
                78200.0,
                100000.0,
                78.2,
                155.0,
                505.0,
                3720.0,
                now.minusDays(9),
                now.minusHours(3)
        ));

        fuelReadingRepository.save(new FuelReading(
                null,
                bharati,
                77550.0,
                100000.0,
                77.55,
                158.0,
                492.0,
                3792.0,
                now.minusDays(9),
                now.minusHours(2)
        ));

        fuelReadingRepository.save(new FuelReading(
                null,
                bharati,
                76880.0,
                100000.0,
                76.88,
                160.0,
                480.0,
                3840.0,
                now.minusDays(9),
                now.minusHours(1)
        ));

        fuelReadingRepository.save(new FuelReading(
                null,
                bharati,
                76200.0,
                100000.0,
                76.2,
                162.0,
                470.0,
                3888.0,
                now.minusDays(9),
                now
        ));

        System.out.println(
                "ANTARIS: Fuel development data initialized for Maitri and Bharati."
        );
    }
}