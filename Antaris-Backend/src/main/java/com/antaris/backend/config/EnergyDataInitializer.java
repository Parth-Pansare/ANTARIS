package com.antaris.backend.config;

import com.antaris.backend.entity.EnergyReading;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.EnergyReadingRepository;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class EnergyDataInitializer implements CommandLineRunner {

    private final EnergyReadingRepository energyReadingRepository;
    private final StationRepository stationRepository;

    public EnergyDataInitializer(
            EnergyReadingRepository energyReadingRepository,
            StationRepository stationRepository) {

        this.energyReadingRepository = energyReadingRepository;
        this.stationRepository = stationRepository;
    }

    @Override
    public void run(String... args) {

        if (energyReadingRepository.count() > 0) {
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

        // =========================
        // MAITRI ENERGY DATA
        // =========================

        energyReadingRepository.save(new EnergyReading(
                maitri,
                118.5,
                82.0,
                310.0,
                455.0,
                720.0,
                72.0,
                68.0,
                now.minusHours(3)
        ));

        energyReadingRepository.save(new EnergyReading(
                maitri,
                125.0,
                88.5,
                295.0,
                448.0,
                705.0,
                70.5,
                65.5,
                now.minusHours(2)
        ));

        energyReadingRepository.save(new EnergyReading(
                maitri,
                132.0,
                94.0,
                280.0,
                440.0,
                690.0,
                69.0,
                62.0,
                now.minusHours(1)
        ));

        energyReadingRepository.save(new EnergyReading(
                maitri,
                128.5,
                91.5,
                285.0,
                442.0,
                682.0,
                68.2,
                63.5,
                now
        ));

        // =========================
        // BHARATI ENERGY DATA
        // =========================

        energyReadingRepository.save(new EnergyReading(
                bharati,
                145.0,
                105.0,
                250.0,
                410.0,
                810.0,
                81.0,
                55.0,
                now.minusHours(3)
        ));

        energyReadingRepository.save(new EnergyReading(
                bharati,
                151.5,
                112.0,
                240.0,
                405.0,
                825.0,
                82.5,
                52.0,
                now.minusHours(2)
        ));

        energyReadingRepository.save(new EnergyReading(
                bharati,
                158.0,
                118.5,
                230.0,
                398.0,
                838.0,
                83.8,
                49.0,
                now.minusHours(1)
        ));

        energyReadingRepository.save(new EnergyReading(
                bharati,
                155.0,
                116.0,
                235.0,
                401.0,
                834.0,
                83.4,
                50.5,
                now
        ));

        System.out.println(
                "ANTARIS: Energy development data initialized for Maitri and Bharati."
        );
    }
}