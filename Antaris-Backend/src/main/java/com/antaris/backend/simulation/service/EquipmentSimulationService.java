package com.antaris.backend.simulation.service;

import com.antaris.backend.entity.Equipment;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.EquipmentRepository;
import com.antaris.backend.simulation.ScenarioChange;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EquipmentSimulationService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentSimulationService(
            EquipmentRepository equipmentRepository
    ) {
        this.equipmentRepository = equipmentRepository;
    }

    /**
     * Creates an independent simulated copy of all equipment
     * belonging to the selected station and applies scenario
     * effects to those copies.
     *
     * Real equipment records are never modified or saved.
     */
    public List<Equipment> simulate(
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

        List<Equipment> equipmentList =
                equipmentRepository
                        .findByStationIdOrderByEquipmentNameAsc(
                                station.getId()
                        );

        List<Equipment> simulatedEquipment =
                new ArrayList<>();

        for (Equipment equipment : equipmentList) {

            Equipment copy =
                    copyEquipment(equipment);

            applyScenarioEffects(
                    copy,
                    changes,
                    horizonHours
            );

            simulatedEquipment.add(copy);
        }

        return simulatedEquipment;
    }

    /**
     * Creates an independent equipment object.
     */
    private Equipment copyEquipment(
            Equipment source
    ) {

        Equipment copy =
                new Equipment();

        copy.setId(
                source.getId()
        );

        copy.setStation(
                source.getStation()
        );

        copy.setEquipmentCode(
                source.getEquipmentCode()
        );

        copy.setEquipmentName(
                source.getEquipmentName()
        );

        copy.setEquipmentType(
                source.getEquipmentType()
        );

        copy.setStatus(
                source.getStatus()
        );

        copy.setHealthScore(
                source.getHealthScore()
        );

        copy.setLoadPercentage(
                source.getLoadPercentage()
        );

        copy.setTemperature(
                source.getTemperature()
        );

        copy.setRuntimeHours(
                source.getRuntimeHours()
        );

        copy.setLastMaintenance(
                source.getLastMaintenance()
        );

        copy.setTimestamp(
                source.getTimestamp()
        );

        return copy;
    }

    /**
     * Applies scenario effects to one simulated equipment item.
     */
    private void applyScenarioEffects(
            Equipment equipment,
            ScenarioChange changes,
            Integer horizonHours
    ) {

        if (changes == null) {
            return;
        }

        // =====================================================
        // 1. TEMPERATURE EFFECT
        // =====================================================

        double temperatureIncrease =
                safeValue(
                        changes.getTemperatureChangeC()
                );

        equipment.setTemperature(
                equipment.getTemperature()
                        + temperatureIncrease
        );

        // =====================================================
        // 2. LOAD EFFECT
        // =====================================================

        double consumptionChange =
                safeValue(
                        changes.getConsumptionChangePct()
                );

        if (equipment.getLoadPercentage() != null) {

            double loadMultiplier =
                    1.0
                            + (
                            consumptionChange
                                    / 100.0
                    );

            loadMultiplier =
                    Math.max(
                            0.0,
                            loadMultiplier
                    );

            double newLoad =
                    equipment.getLoadPercentage()
                            * loadMultiplier;

            equipment.setLoadPercentage(
                    clamp(
                            newLoad,
                            0.0,
                            100.0
                    )
            );
        }

        // =====================================================
        // 3. GENERATOR AVAILABILITY EFFECT
        // =====================================================

        double generatorAvailabilityChange =
                safeValue(
                        changes
                                .getGeneratorAvailabilityChangePct()
                );

        if (isGenerator(equipment)
                && generatorAvailabilityChange != 0.0
                && equipment.getLoadPercentage() != null) {

            /*
             * Reduced generator availability means the
             * remaining generator equipment is exposed to
             * additional operating stress.
             */
            double additionalLoad =
                    Math.abs(
                            generatorAvailabilityChange
                    );

            if (generatorAvailabilityChange < 0) {

                equipment.setLoadPercentage(
                        clamp(
                                equipment.getLoadPercentage()
                                        + additionalLoad,
                                0.0,
                                100.0
                        )
                );
            }
        }

        // =====================================================
        // 4. RUNTIME EFFECT
        // =====================================================

        if (equipment.getRuntimeHours() != null) {

            equipment.setRuntimeHours(
                    equipment.getRuntimeHours()
                            + horizonHours
            );
        }

        // =====================================================
        // 5. HEALTH SCORE EFFECT
        // =====================================================

        if (equipment.getHealthScore() != null) {

            double healthPenalty = 0.0;

            /*
             * Higher temperature produces additional stress.
             */
            if (temperatureIncrease > 0) {

                healthPenalty +=
                        temperatureIncrease * 0.25;
            }

            /*
             * Higher equipment load produces additional
             * operating stress.
             */
            if (equipment.getLoadPercentage() != null
                    && equipment.getLoadPercentage() > 80.0) {

                healthPenalty +=
                        (
                                equipment.getLoadPercentage()
                                        - 80.0
                        ) * 0.10;
            }

            /*
             * Longer simulation horizon produces a small
             * runtime-related health impact.
             */
            healthPenalty +=
                    horizonHours * 0.01;

            double newHealth =
                    equipment.getHealthScore()
                            - healthPenalty;

            equipment.setHealthScore(
                    clamp(
                            newHealth,
                            0.0,
                            100.0
                    )
            );
        }

        // =====================================================
        // 6. STATUS
        // =====================================================

        updateStatus(
                equipment
        );
    }

    private boolean isGenerator(
            Equipment equipment
    ) {

        if (equipment.getEquipmentType() == null) {
            return false;
        }

        return equipment.getEquipmentType()
                .toLowerCase()
                .contains("generator");
    }

    private void updateStatus(
            Equipment equipment
    ) {

        if (equipment.getHealthScore() == null) {
            return;
        }

        if (equipment.getHealthScore() <= 30.0) {

            equipment.setStatus(
                    "CRITICAL"
            );

        } else if (equipment.getHealthScore() <= 50.0) {

            equipment.setStatus(
                    "WARNING"
            );

        } else {

            equipment.setStatus(
                    "OPERATIONAL"
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

    private double clamp(
            double value,
            double minimum,
            double maximum
    ) {

        return Math.max(
                minimum,
                Math.min(
                        maximum,
                        value
                )
        );
    }
}