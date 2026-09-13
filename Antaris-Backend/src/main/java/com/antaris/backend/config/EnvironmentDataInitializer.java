package com.antaris.backend.config;

import com.antaris.backend.entity.EnvironmentReading;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.EnvironmentReadingRepository;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class EnvironmentDataInitializer {

    @Bean
    CommandLineRunner initializeEnvironmentData(
            StationRepository stationRepository,
            EnvironmentReadingRepository environmentReadingRepository) {

        return args -> {

            // Don't insert duplicate development data
            if (environmentReadingRepository.count() > 0) {
                return;
            }

            List<Station> stations = stationRepository.findAll();

            Station maitri = stations.stream()
                    .filter(station -> "MAITRI".equals(station.getCode()))
                    .findFirst()
                    .orElse(null);

            Station bharati = stations.stream()
                    .filter(station -> "BHARATI".equals(station.getCode()))
                    .findFirst()
                    .orElse(null);

            if (maitri == null || bharati == null) {
                System.out.println("ANTARIS: Stations not found. Environment data not initialized.");
                return;
            }

            LocalDateTime now = LocalDateTime.now();

            // -------------------------
            // MAITRI DEVELOPMENT DATA
            // -------------------------

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            maitri,
                            -24.5,
                            68.0,
                            982.4,
                            18.5,
                            220.0,
                            now.minusHours(3)
                    )
            );

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            maitri,
                            -25.2,
                            66.5,
                            983.1,
                            20.2,
                            225.0,
                            now.minusHours(2)
                    )
            );

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            maitri,
                            -26.0,
                            65.8,
                            984.0,
                            22.1,
                            230.0,
                            now.minusHours(1)
                    )
            );

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            maitri,
                            -25.6,
                            66.2,
                            983.7,
                            21.4,
                            228.0,
                            now
                    )
            );

            // -------------------------
            // BHARATI DEVELOPMENT DATA
            // -------------------------

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            bharati,
                            -17.8,
                            71.0,
                            987.2,
                            15.6,
                            190.0,
                            now.minusHours(3)
                    )
            );

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            bharati,
                            -18.5,
                            69.5,
                            988.0,
                            17.2,
                            195.0,
                            now.minusHours(2)
                    )
            );

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            bharati,
                            -19.1,
                            68.7,
                            988.8,
                            19.0,
                            200.0,
                            now.minusHours(1)
                    )
            );

            environmentReadingRepository.save(
                    new EnvironmentReading(
                            bharati,
                            -18.7,
                            69.2,
                            988.4,
                            18.3,
                            198.0,
                            now
                    )
            );

            System.out.println(
                    "ANTARIS: Environment development data initialized for Maitri and Bharati."
            );
        };
    }
}