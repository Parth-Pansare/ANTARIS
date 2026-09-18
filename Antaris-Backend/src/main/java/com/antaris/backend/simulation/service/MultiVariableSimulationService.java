package com.antaris.backend.simulation.service;

import com.antaris.backend.entity.Equipment;
import com.antaris.backend.entity.InventoryItem;
import com.antaris.backend.entity.Station;
import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationScenario;
import com.antaris.backend.simulation.SimulationState;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MultiVariableSimulationService {

    private final CurrentStateSnapshotService currentStateSnapshotService;
    private final EnvironmentSimulationService environmentSimulationService;
    private final EnergySimulationService energySimulationService;
    private final EquipmentSimulationService equipmentSimulationService;
    private final FuelSimulationService fuelSimulationService;
    private final InventorySimulationService inventorySimulationService;

    public MultiVariableSimulationService(
            CurrentStateSnapshotService currentStateSnapshotService,
            EnvironmentSimulationService environmentSimulationService,
            EnergySimulationService energySimulationService,
            EquipmentSimulationService equipmentSimulationService,
            FuelSimulationService fuelSimulationService,
            InventorySimulationService inventorySimulationService
    ) {

        this.currentStateSnapshotService =
                currentStateSnapshotService;

        this.environmentSimulationService =
                environmentSimulationService;

        this.energySimulationService =
                energySimulationService;

        this.equipmentSimulationService =
                equipmentSimulationService;

        this.fuelSimulationService =
                fuelSimulationService;

        this.inventorySimulationService =
                inventorySimulationService;
    }

    /**
     * Runs a multi-variable scenario against a copied
     * current station state.
     *
     * The actual station state is never modified.
     */
    public MultiVariableSimulationResult simulate(
            Station station,
            SimulationScenario scenario
    ) {

        if (station == null) {

            throw new IllegalArgumentException(
                    "Station cannot be null."
            );
        }

        if (scenario == null) {

            throw new IllegalArgumentException(
                    "Simulation scenario cannot be null."
            );
        }

        if (scenario.getHorizonHours() == null
                || scenario.getHorizonHours() <= 0) {

            throw new IllegalArgumentException(
                    "Scenario horizon hours must be greater than zero."
            );
        }

        // =====================================================
        // 1. CAPTURE CURRENT BASELINE STATE
        // =====================================================

        SimulationState baseline =
                currentStateSnapshotService.getCurrentState();

        if (baseline == null
                || baseline.getState() == null) {

            throw new IllegalStateException(
                    "Current station state could not be captured."
            );
        }

        /*
         * Capture baseline values BEFORE the copied state is
         * modified by the simulation services.
         */
        double baselineGeneratorLoad =
                safeValue(
                        baseline.getState()
                                .getGeneratorLoadPct()
                );

        double baselineFuelConsumptionRate =
                safeValue(
                        baseline.getState()
                                .getFuelConsumptionRateLph()
                );

        // =====================================================
        // 2. CREATE ISOLATED SIMULATION COPY
        // =====================================================

        SimulationState simulated =
                copySimulationState(baseline);

        ScenarioChange changes =
                scenario.getChanges();

        // =====================================================
        // 3. ENVIRONMENT SIMULATION
        // =====================================================

        simulated =
                environmentSimulationService.simulate(
                        simulated,
                        changes
                );

        // =====================================================
        // 4. ENERGY SIMULATION
        // =====================================================

        simulated =
                energySimulationService.simulate(
                        simulated,
                        changes
                );

        // =====================================================
        // 5. EQUIPMENT SIMULATION
        // =====================================================

        List<Equipment> simulatedEquipment =
                equipmentSimulationService.simulate(
                        station,
                        changes,
                        scenario.getHorizonHours()
                );

        // =====================================================
        // 6. FUEL SIMULATION
        // =====================================================

        /*
         * Pass:
         *
         * 1. copied simulation state
         * 2. scenario changes
         * 3. ORIGINAL generator load
         * 4. ORIGINAL fuel consumption rate
         * 5. scenario horizon
         *
         * This allows the fuel service to correctly calculate
         * both fuel consumption and horizon-based depletion.
         */
        simulated =
                fuelSimulationService.simulate(
                        simulated,
                        changes,
                        baselineGeneratorLoad,
                        baselineFuelConsumptionRate,
                        scenario.getHorizonHours()
                );

        // =====================================================
        // 7. INVENTORY / LOGISTICS SIMULATION
        // =====================================================

        List<InventoryItem> simulatedInventory =
                inventorySimulationService.simulate(
                        station,
                        changes,
                        scenario.getHorizonHours()
                );

        // =====================================================
        // 8. RETURN COMPLETE SIMULATION RESULT
        // =====================================================

        return new MultiVariableSimulationResult(
                baseline,
                simulated,
                simulatedEquipment,
                simulatedInventory
        );
    }

    /**
     * Creates a deep copy of the telemetry snapshot so that
     * scenario simulation cannot modify the actual simulator
     * state.
     */
    private SimulationState copySimulationState(
            SimulationState source
    ) {

        if (source == null
                || source.getState() == null) {

            throw new IllegalArgumentException(
                    "Simulation state cannot be null."
            );
        }

        TelemetrySnapshot original =
                source.getState();

        TelemetrySnapshot copy =
                new TelemetrySnapshot();

        // =====================================================
        // ENVIRONMENT
        // =====================================================

        copy.setTimestamp(
                original.getTimestamp()
        );

        copy.setStationCode(
                original.getStationCode()
        );

        copy.setTemperatureC(
                original.getTemperatureC()
        );

        copy.setAirPressureHpa(
                original.getAirPressureHpa()
        );

        copy.setHumidityPct(
                original.getHumidityPct()
        );

        copy.setWindSpeed(
                original.getWindSpeed()
        );

        copy.setWindDirectionDeg(
                original.getWindDirectionDeg()
        );

        copy.setWindResourceIndex(
                original.getWindResourceIndex()
        );

        // =====================================================
        // ENERGY
        // =====================================================

        copy.setSolarGenerationKw(
                original.getSolarGenerationKw()
        );

        copy.setWindGenerationKw(
                original.getWindGenerationKw()
        );

        copy.setGeneratorGenerationKw(
                original.getGeneratorGenerationKw()
        );

        copy.setTotalGenerationKw(
                original.getTotalGenerationKw()
        );

        copy.setTotalConsumptionKw(
                original.getTotalConsumptionKw()
        );

        copy.setPowerBalanceKw(
                original.getPowerBalanceKw()
        );

        copy.setBatteryLevelKwh(
                original.getBatteryLevelKwh()
        );

        copy.setBatteryPercentage(
                original.getBatteryPercentage()
        );

        copy.setGeneratorLoadPct(
                original.getGeneratorLoadPct()
        );

        // =====================================================
        // FUEL
        // =====================================================

        copy.setFuelLevelL(
                original.getFuelLevelL()
        );

        copy.setFuelCapacityL(
                original.getFuelCapacityL()
        );

        copy.setFuelPercentage(
                original.getFuelPercentage()
        );

        copy.setFuelConsumptionRateLph(
                original.getFuelConsumptionRateLph()
        );

        copy.setEstimatedRuntimeHours(
                original.getEstimatedRuntimeHours()
        );

        return new SimulationState(copy);
    }

    /**
     * Safely converts nullable numeric values to zero.
     */
    private double safeValue(Double value) {

        return value == null
                ? 0.0
                : value;
    }

    /**
     * Result of a multi-variable simulation.
     */
    public static class MultiVariableSimulationResult {

        private final SimulationState baselineState;

        private final SimulationState simulatedState;

        private final List<Equipment> simulatedEquipment;

        private final List<InventoryItem> simulatedInventory;

        public MultiVariableSimulationResult(
                SimulationState baselineState,
                SimulationState simulatedState,
                List<Equipment> simulatedEquipment,
                List<InventoryItem> simulatedInventory
        ) {

            this.baselineState =
                    baselineState;

            this.simulatedState =
                    simulatedState;

            this.simulatedEquipment =
                    simulatedEquipment;

            this.simulatedInventory =
                    simulatedInventory;
        }

        public SimulationState getBaselineState() {

            return baselineState;
        }

        public SimulationState getSimulatedState() {

            return simulatedState;
        }

        public List<Equipment> getSimulatedEquipment() {

            return simulatedEquipment;
        }

        public List<InventoryItem> getSimulatedInventory() {

            return simulatedInventory;
        }
    }
}