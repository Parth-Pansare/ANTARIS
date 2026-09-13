package com.antaris.backend.config;

import com.antaris.backend.entity.InventoryItem;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.InventoryItemRepository;
import com.antaris.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class InventoryDataInitializer implements CommandLineRunner {

    private final InventoryItemRepository inventoryItemRepository;
    private final StationRepository stationRepository;

    public InventoryDataInitializer(
            InventoryItemRepository inventoryItemRepository,
            StationRepository stationRepository) {

        this.inventoryItemRepository = inventoryItemRepository;
        this.stationRepository = stationRepository;
    }

    @Override
    public void run(String... args) {

        if (inventoryItemRepository.count() > 0) {
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
        // MAITRI INVENTORY
        // ================================

        inventoryItemRepository.save(new InventoryItem(
                null,
                maitri,
                "FOOD-M01",
                "Food Supplies",
                "FOOD",
                1840.0,
                "kg",
                1200.0,
                "AVAILABLE",
                now
        ));

        inventoryItemRepository.save(new InventoryItem(
                null,
                maitri,
                "MED-M01",
                "Medical Supplies",
                "MEDICAL",
                420.0,
                "units",
                300.0,
                "AVAILABLE",
                now
        ));

        inventoryItemRepository.save(new InventoryItem(
                null,
                maitri,
                "SPR-M01",
                "Mechanical Spare Parts",
                "SPARES",
                185.0,
                "units",
                150.0,
                "AVAILABLE",
                now
        ));

        inventoryItemRepository.save(new InventoryItem(
                null,
                maitri,
                "BAT-M01",
                "Battery Components",
                "SPARES",
                72.0,
                "units",
                100.0,
                "LOW",
                now
        ));

        // ================================
        // BHARATI INVENTORY
        // ================================

        inventoryItemRepository.save(new InventoryItem(
                null,
                bharati,
                "FOOD-B01",
                "Food Supplies",
                "FOOD",
                2250.0,
                "kg",
                1400.0,
                "AVAILABLE",
                now
        ));

        inventoryItemRepository.save(new InventoryItem(
                null,
                bharati,
                "MED-B01",
                "Medical Supplies",
                "MEDICAL",
                510.0,
                "units",
                300.0,
                "AVAILABLE",
                now
        ));

        inventoryItemRepository.save(new InventoryItem(
                null,
                bharati,
                "SPR-B01",
                "Mechanical Spare Parts",
                "SPARES",
                128.0,
                "units",
                150.0,
                "LOW",
                now
        ));

        inventoryItemRepository.save(new InventoryItem(
                null,
                bharati,
                "WTR-B01",
                "Water Treatment Supplies",
                "WATER",
                95.0,
                "units",
                120.0,
                "CRITICAL",
                now
        ));

        System.out.println(
                "ANTARIS: Inventory development data initialized for Maitri and Bharati."
        );
    }
}