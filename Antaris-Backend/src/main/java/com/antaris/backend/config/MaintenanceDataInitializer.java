package com.antaris.backend.config;

import com.antaris.backend.entity.MaintenanceRecord;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.MaintenanceRecordRepository;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class MaintenanceDataInitializer {

    @Bean
    CommandLineRunner initializeMaintenanceData(
            StationRepository stationRepository,
            MaintenanceRecordRepository maintenanceRecordRepository) {

        return args -> {

            if (maintenanceRecordRepository.count() > 0) {
                return;
            }

            Station maitri = stationRepository.findByCode("MAITRI")
                    .orElseThrow(() ->
                            new RuntimeException("MAITRI station not found"));

            Station bharati = stationRepository.findByCode("BHARATI")
                    .orElseThrow(() ->
                            new RuntimeException("BHARATI station not found"));

            LocalDateTime now = LocalDateTime.now();

            // =========================
            // MAITRI
            // =========================

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            maitri,
                            "GEN-M02",
                            "Diesel Generator 2",
                            "PREVENTIVE",
                            "SCHEDULED",
                            "Generator inspection, oil replacement and cooling system check.",
                            now.plusDays(5),
                            null,
                            now
                    )
            );

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            maitri,
                            "HTR-M01",
                            "Main Heating System",
                            "PREVENTIVE",
                            "COMPLETED",
                            "Heating system inspection and thermal efficiency check completed.",
                            now.minusDays(4),
                            now.minusDays(3),
                            now.minusDays(7)
                    )
            );

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            maitri,
                            "COM-M01",
                            "Satellite Communication System",
                            "INSPECTION",
                            "SCHEDULED",
                            "Routine antenna alignment and communication equipment inspection.",
                            now.plusDays(12),
                            null,
                            now.minusDays(2)
                    )
            );

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            maitri,
                            "GEN-M01",
                            "Diesel Generator 1",
                            "CORRECTIVE",
                            "IN_PROGRESS",
                            "Inspection of generator vibration and load performance.",
                            now.minusDays(1),
                            null,
                            now.minusDays(2)
                    )
            );

            // =========================
            // BHARATI
            // =========================

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            bharati,
                            "WTR-B01",
                            "Water Processing System",
                            "CORRECTIVE",
                            "SCHEDULED",
                            "Water processing unit inspection and filter replacement.",
                            now.plusDays(2),
                            null,
                            now.minusDays(1)
                    )
            );

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            bharati,
                            "GEN-B02",
                            "Diesel Generator 2",
                            "PREVENTIVE",
                            "COMPLETED",
                            "Generator servicing and fuel system inspection completed.",
                            now.minusDays(8),
                            now.minusDays(7),
                            now.minusDays(15)
                    )
            );

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            bharati,
                            "HTR-B01",
                            "Main Heating System",
                            "INSPECTION",
                            "SCHEDULED",
                            "Heating system performance and insulation inspection.",
                            now.plusDays(9),
                            null,
                            now.minusDays(3)
                    )
            );

            maintenanceRecordRepository.save(
                    new MaintenanceRecord(
                            null,
                            bharati,
                            "GEN-B01",
                            "Diesel Generator 1",
                            "PREVENTIVE",
                            "COMPLETED",
                            "Routine generator maintenance and operational verification completed.",
                            now.minusDays(20),
                            now.minusDays(19),
                            now.minusDays(25)
                    )
            );
        };
    }
}