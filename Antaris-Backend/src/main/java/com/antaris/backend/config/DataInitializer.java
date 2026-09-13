package com.antaris.backend.config;

import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeStations(StationRepository stationRepository) {

        return args -> {

            if (stationRepository.count() == 0) {

                Station maitri = new Station(
                        "MAITRI",
                        "Maitri",
                        "Antarctica",
                        "OPERATIONAL"
                );

                Station bharati = new Station(
                        "BHARATI",
                        "Bharati",
                        "Antarctica",
                        "OPERATIONAL"
                );

                stationRepository.save(maitri);
                stationRepository.save(bharati);

                System.out.println("ANTARIS: Maitri and Bharati stations initialized.");
            }
        };
    }
}