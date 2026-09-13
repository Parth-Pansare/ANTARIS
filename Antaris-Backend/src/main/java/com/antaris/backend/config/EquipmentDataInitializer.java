package com.antaris.backend.config;

import com.antaris.backend.entity.Equipment;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.EquipmentRepository;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class EquipmentDataInitializer implements CommandLineRunner {

    private final EquipmentRepository equipmentRepository;
    private final StationRepository stationRepository;

    public EquipmentDataInitializer(
            EquipmentRepository equipmentRepository,
            StationRepository stationRepository) {

        this.equipmentRepository = equipmentRepository;
        this.stationRepository = stationRepository;
    }

    @Override
    public void run(String... args) {

        if (equipmentRepository.count() > 0) {
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
        // MAITRI EQUIPMENT
        // ================================

        equipmentRepository.save(new Equipment(
                null,
                maitri,
                "GEN-M01",
                "Diesel Generator 1",
                "GENERATOR",
                "OPERATIONAL",
                94.0,
                63.5,
                72.0,
                8420.0,
                now.minusDays(18),
                now
        ));

        equipmentRepository.save(new Equipment(
                null,
                maitri,
                "GEN-M02",
                "Diesel Generator 2",
                "GENERATOR",
                "WARNING",
                78.0,
                71.0,
                81.5,
                9135.0,
                now.minusDays(32),
                now
        ));

        equipmentRepository.save(new Equipment(
                null,
                maitri,
                "HTR-M01",
                "Main Heating System",
                "HEATING",
                "OPERATIONAL",
                91.0,
                68.0,
                64.5,
                6240.0,
                now.minusDays(12),
                now
        ));

        equipmentRepository.save(new Equipment(
                null,
                maitri,
                "COM-M01",
                "Satellite Communication System",
                "COMMUNICATION",
                "OPERATIONAL",
                97.0,
                42.0,
                38.0,
                4870.0,
                now.minusDays(8),
                now
        ));

        // ================================
        // BHARATI EQUIPMENT
        // ================================

        equipmentRepository.save(new Equipment(
                null,
                bharati,
                "GEN-B01",
                "Diesel Generator 1",
                "GENERATOR",
                "OPERATIONAL",
                96.0,
                50.5,
                69.0,
                7160.0,
                now.minusDays(10),
                now
        ));

        equipmentRepository.save(new Equipment(
                null,
                bharati,
                "GEN-B02",
                "Diesel Generator 2",
                "GENERATOR",
                "OPERATIONAL",
                89.0,
                47.0,
                66.5,
                7890.0,
                now.minusDays(21),
                now
        ));

        equipmentRepository.save(new Equipment(
                null,
                bharati,
                "HTR-B01",
                "Main Heating System",
                "HEATING",
                "OPERATIONAL",
                93.0,
                61.0,
                59.5,
                5720.0,
                now.minusDays(14),
                now
        ));

        equipmentRepository.save(new Equipment(
                null,
                bharati,
                "WTR-B01",
                "Water Processing System",
                "WATER",
                "WARNING",
                81.0,
                58.0,
                55.0,
                4380.0,
                now.minusDays(29),
                now
        ));

        System.out.println(
                "ANTARIS: Equipment development data initialized for Maitri and Bharati."
        );
    }
}