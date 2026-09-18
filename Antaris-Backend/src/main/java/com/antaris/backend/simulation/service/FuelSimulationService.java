package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationState;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

@Service
public class FuelSimulationService {

    /**
     * Applies fuel-related scenario changes and recalculates
     * fuel consumption, fuel level, percentage and runtime.
     *
     * The original telemetry state is never modified.
     */
    public SimulationState simulate(
            SimulationState simulationState,
            ScenarioChange changes
    ) {

        if (simulationState == null
                || simulationState.getState() == null) {

            throw new IllegalArgumentException(
                    "Simulation state cannot be null."
            );
        }

        if (changes == null) {
            return simulationState;
        }

        TelemetrySnapshot state =
                simulationState.getState();

        // =====================================================
        // 1. DIRECT FUEL LEVEL CHANGE
        // =====================================================

        if (changes.getFuelChangePct() != null
                && state.getFuelPercentage() != null) {

            double newFuelPercentage =
                    state.getFuelPercentage()
                            + changes.getFuelChangePct();

            newFuelPercentage =
                    clamp(
                            newFuelPercentage,
                            0.0,
                            100.0
                    );

            state.setFuelPercentage(
                    newFuelPercentage
            );

            // Keep fuel litres consistent with fuel percentage.
            if (state.getFuelCapacityL() != null) {

                state.setFuelLevelL(
                        state.getFuelCapacityL()
                                * newFuelPercentage
                                / 100.0
                );
            }
        }

        // =====================================================
        // 2. CALCULATE FUEL CONSUMPTION FROM GENERATOR LOAD
        // =====================================================

        double generatorLoad =
                safeValue(
                        state.getGeneratorLoadPct()
                );

        double baseConsumptionRate =
                safeValue(
                        state.getFuelConsumptionRateLph()
                );

        /*
         * If a baseline fuel-consumption rate exists,
         * scale it according to generator load.
         *
         * Example:
         *
         * 50% load → approximately 50% of baseline rate
         * 100% load → approximately 100% of baseline rate
         */
        double simulatedConsumptionRate;

        if (baseConsumptionRate > 0) {

            simulatedConsumptionRate =
                    baseConsumptionRate
                            * generatorLoad
                            / 100.0;

        } else {

            /*
             * Fallback estimate when the baseline rate
             * is unavailable.
             */
            simulatedConsumptionRate =
                    generatorLoad * 0.08;
        }

        simulatedConsumptionRate =
                Math.max(
                        0.0,
                        simulatedConsumptionRate
                );

        state.setFuelConsumptionRateLph(
                simulatedConsumptionRate
        );

        // =====================================================
        // 3. ESTIMATE FUEL USAGE OVER SCENARIO HORIZON
        // =====================================================

        double fuelUsed;

        /*
         * Fuel consumption rate is litres/hour.
         *
         * The scenario horizon is handled by the simulation
         * orchestration layer later. Here we maintain the
         * current rate and calculate the projected one-hour
         * fuel usage.
         */
        fuelUsed =
                simulatedConsumptionRate;

        // =====================================================
        // 4. ESTIMATED RUNTIME
        // =====================================================

        double fuelLevel =
                safeValue(
                        state.getFuelLevelL()
                );

        if (simulatedConsumptionRate > 0) {

            double runtimeHours =
                    fuelLevel
                            / simulatedConsumptionRate;

            state.setEstimatedRuntimeHours(
                    Math.max(
                            0.0,
                            runtimeHours
                    )
            );

        } else {

            state.setEstimatedRuntimeHours(
                    Double.POSITIVE_INFINITY
            );
        }

        // =====================================================
        // 5. APPLY DIRECT FUEL IMPACT FROM CONSUMPTION CHANGE
        // =====================================================

        if (changes.getConsumptionChangePct() != null
                && state.getFuelLevelL() != null
                && state.getFuelCapacityL() != null) {

            double consumptionMultiplier =
                    1.0
                            + (
                            changes
                                    .getConsumptionChangePct()
                                    / 100.0
                    );

            consumptionMultiplier =
                    Math.max(
                            0.0,
                            consumptionMultiplier
                    );

            double projectedFuelUsage =
                    fuelUsed
                            * (
                            consumptionMultiplier
                    );

            double projectedFuelLevel =
                    Math.max(
                            0.0,
                            fuelLevel
                                    - projectedFuelUsage
                    );

            state.setFuelLevelL(
                    projectedFuelLevel
            );

            double fuelPercentage =
                    (
                            projectedFuelLevel
                                    / state.getFuelCapacityL()
                    ) * 100.0;

            state.setFuelPercentage(
                    clamp(
                            fuelPercentage,
                            0.0,
                            100.0
                    )
            );

            if (state.getFuelConsumptionRateLph() != null) {

                state.setFuelConsumptionRateLph(
                        state.getFuelConsumptionRateLph()
                                * consumptionMultiplier
                );
            }

            double finalConsumptionRate =
                    safeValue(
                            state.getFuelConsumptionRateLph()
                    );

            if (finalConsumptionRate > 0) {

                state.setEstimatedRuntimeHours(
                        projectedFuelLevel
                                / finalConsumptionRate
                );
            }
        }

        return simulationState;
    }

    private double safeValue(Double value) {

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