package com.antaris.backend.simulation.service;

import com.antaris.backend.entity.InventoryItem;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.InventoryItemRepository;
import com.antaris.backend.simulation.ScenarioChange;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class InventorySimulationService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventorySimulationService(
            InventoryItemRepository inventoryItemRepository
    ) {
        this.inventoryItemRepository =
                inventoryItemRepository;
    }

    /**
     * Creates independent simulated copies of the inventory
     * belonging to a station.
     *
     * Real inventory records are never modified or saved.
     */
    public List<InventoryItem> simulate(
            Station station,
            ScenarioChange changes,
            Integer horizonHours
    ) {

        if (station == null) {
            throw new IllegalArgumentException(
                    "Station cannot be null."
            );
        }

        if (horizonHours == null || horizonHours <= 0) {
            throw new IllegalArgumentException(
                    "Horizon hours must be greater than zero."
            );
        }

        List<InventoryItem> inventoryItems =
                inventoryItemRepository
                        .findByStationIdOrderByItemNameAsc(
                                station.getId()
                        );

        List<InventoryItem> simulatedItems =
                new ArrayList<>();

        for (InventoryItem item : inventoryItems) {

            InventoryItem copy =
                    copyItem(item);

            applyScenarioEffects(
                    copy,
                    changes,
                    horizonHours
            );

            simulatedItems.add(copy);
        }

        return simulatedItems;
    }

    /**
     * Creates an independent copy of an inventory item.
     */
    private InventoryItem copyItem(
            InventoryItem source
    ) {

        InventoryItem copy =
                new InventoryItem();

        copy.setId(
                source.getId()
        );

        copy.setStation(
                source.getStation()
        );

        copy.setItemCode(
                source.getItemCode()
        );

        copy.setItemName(
                source.getItemName()
        );

        copy.setCategory(
                source.getCategory()
        );

        copy.setQuantity(
                source.getQuantity()
        );

        copy.setUnit(
                source.getUnit()
        );

        copy.setMinimumRequired(
                source.getMinimumRequired()
        );

        copy.setStatus(
                source.getStatus()
        );

        copy.setLastUpdated(
                source.getLastUpdated()
        );

        return copy;
    }

    /**
     * Applies operational demand effects to the simulated
     * inventory state.
     */
    private void applyScenarioEffects(
            InventoryItem item,
            ScenarioChange changes,
            Integer horizonHours
    ) {

        if (changes == null) {
            return;
        }

        if (item.getQuantity() == null) {
            return;
        }

        double consumptionChange =
                safeValue(
                        changes.getConsumptionChangePct()
                );

        /*
         * Convert the scenario demand change into a
         * simple hourly inventory usage estimate.
         *
         * This is intentionally a simulation heuristic.
         * It does not claim to represent real NCPOR
         * inventory consumption rates.
         */
        double demandMultiplier =
                1.0
                        + (
                        consumptionChange
                                / 100.0
                );

        demandMultiplier =
                Math.max(
                        0.0,
                        demandMultiplier
                );

        /*
         * Base simulated usage:
         * 0.5% of current stock per hour.
         *
         * The percentage is deliberately small so that
         * the simulation does not unrealistically empty
         * inventory during short scenarios.
         */
        double hourlyUsage =
                item.getQuantity()
                        * 0.005
                        * demandMultiplier;

        double simulatedUsage =
                hourlyUsage
                        * horizonHours;

        double newQuantity =
                Math.max(
                        0.0,
                        item.getQuantity()
                                - simulatedUsage
                );

        item.setQuantity(
                newQuantity
        );

        updateStatus(
                item
        );
    }

    /**
     * Updates inventory status based on the simulated
     * quantity and minimum required level.
     */
    private void updateStatus(
            InventoryItem item
    ) {

        if (item.getQuantity() == null
                || item.getMinimumRequired() == null) {

            return;
        }

        double quantity =
                item.getQuantity();

        double minimumRequired =
                item.getMinimumRequired();

        if (quantity <= 0) {

            item.setStatus(
                    "CRITICAL"
            );

        } else if (quantity < minimumRequired) {

            item.setStatus(
                    "WARNING"
            );

        } else {

            item.setStatus(
                    "AVAILABLE"
            );
        }
    }

    private double safeValue(
            Double value
    ) {

        return value == null
                ? 0.0
                : value;
    }
}