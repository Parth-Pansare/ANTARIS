package com.antaris.backend.config;

import com.antaris.backend.entity.Alert;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.AlertRepository;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AlertDataInitializer implements CommandLineRunner {

    private final AlertRepository alertRepository;
    private final StationRepository stationRepository;

    public AlertDataInitializer(
            AlertRepository alertRepository,
            StationRepository stationRepository) {

        this.alertRepository = alertRepository;
        this.stationRepository = stationRepository;
    }

    @Override
    public void run(String... args) {

        if (alertRepository.count() > 0) {
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
        // MAITRI ALERTS
        // ================================

        alertRepository.save(new Alert(
                null,
                maitri,
                "EQUIPMENT",
                "WARNING",
                "Generator 2 Health Degraded",
                "Diesel Generator 2 health has dropped below the recommended operating level.",
                "GEN-M02",
                false,
                now.minusHours(2)
        ));

        alertRepository.save(new Alert(
                null,
                maitri,
                "INVENTORY",
                "WARNING",
                "Battery Components Low",
                "Battery component inventory is below the minimum required stock level.",
                "BAT-M01",
                false,
                now.minusHours(4)
        ));

        alertRepository.save(new Alert(
                null,
                maitri,
                "FUEL",
                "INFO",
                "Fuel Consumption Increasing",
                "Current fuel consumption is showing an increasing trend.",
                "FUEL_SYSTEM",
                true,
                now.minusHours(7)
        ));

        alertRepository.save(new Alert(
                null,
                maitri,
                "ENVIRONMENT",
                "WARNING",
                "High Wind Conditions",
                "Wind speed has increased and may affect external station operations.",
                "WEATHER_SYSTEM",
                false,
                now.minusMinutes(45)
        ));

        // ================================
        // BHARATI ALERTS
        // ================================

        alertRepository.save(new Alert(
                null,
                bharati,
                "INVENTORY",
                "CRITICAL",
                "Water Treatment Supplies Critical",
                "Water treatment supplies have fallen below the critical minimum stock level.",
                "WTR-B01",
                false,
                now.minusHours(1)
        ));

        alertRepository.save(new Alert(
                null,
                bharati,
                "EQUIPMENT",
                "WARNING",
                "Water Processing System Warning",
                "Water Processing System health requires inspection and maintenance planning.",
                "WTR-B01",
                false,
                now.minusHours(3)
        ));

        alertRepository.save(new Alert(
                null,
                bharati,
                "ENERGY",
                "INFO",
                "Power Generation Stable",
                "Current power generation is sufficient to meet station consumption.",
                "ENERGY_SYSTEM",
                true,
                now.minusHours(5)
        ));

        alertRepository.save(new Alert(
                null,
                bharati,
                "FUEL",
                "INFO",
                "Fuel Reserves Healthy",
                "Current fuel reserves are above the operational safety threshold.",
                "FUEL_SYSTEM",
                true,
                now.minusHours(8)
        ));

        System.out.println(
                "ANTARIS: Alert development data initialized for Maitri and Bharati."
        );
    }
}