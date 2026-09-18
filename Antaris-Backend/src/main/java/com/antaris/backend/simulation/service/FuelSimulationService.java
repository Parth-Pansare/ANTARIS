package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationState;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

@Service
public class FuelSimulationService {

    /**
     * Applies fuel-related scenario changes and calculates
     * horizon-aware fuel consumption, projected fuel level
     * and remaining runtime.
     *
     * The original telemetry state is never modified.
     */
    public SimulationState simulate(
            SimulationState simulationState,
            ScenarioChange changes,
            double baselineGeneratorLoad,
            double baselineFuelConsumptionRate,
            int horizonHours
    ) {

        if (simulationState == null
                || simulationState.getState() == null) {

            throw new IllegalArgumentException(
                    "Simulation state cannot be null."
            );
        }

        if (horizonHours <= 0) {

            throw new IllegalArgumentException(
                    "Simulation horizon hours must be greater than zero."
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

        double simulatedGeneratorLoad =
                safeValue(
                        state.getGeneratorLoadPct()
                );

        double simulatedConsumptionRate;

        /*
         * The baseline fuel-consumption rate belongs to the
         * baseline generator operating point.
         *
         * Therefore:
         *
         * simulated fuel rate =
         * baseline fuel rate
         * ×
         * (simulated generator load / baseline generator load)
         *
         * This preserves the intended relationship:
         *
         * Generator load ↑
         *        ↓
         * Fuel consumption ↑
         */
        if (baselineFuelConsumptionRate > 0
                && baselineGeneratorLoad > 0) {

            simulatedConsumptionRate =
                    baselineFuelConsumptionRate
                            * (
                            simulatedGeneratorLoad
                                    / baselineGeneratorLoad
                    );

        } else if (baselineFuelConsumptionRate > 0) {

            simulatedConsumptionRate =
                    baselineFuelConsumptionRate;

        } else {

            /*
             * Fallback estimate when no baseline fuel rate
             * is available.
             */
            simulatedConsumptionRate =
                    simulatedGeneratorLoad * 0.08;
        }

        simulatedConsumptionRate =
                Math.max(
                        0.0,
                        simulatedConsumptionRate
                );

        // =====================================================
        // 3. DIRECT OPERATIONAL CONSUMPTION CHANGE
        // =====================================================

        double consumptionMultiplier = 1.0;

        if (changes.getConsumptionChangePct() != null) {

            consumptionMultiplier =
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

            simulatedConsumptionRate =
                    simulatedConsumptionRate
                            * consumptionMultiplier;
        }

        state.setFuelConsumptionRateLph(
                simulatedConsumptionRate
        );

        // =====================================================
        // 4. HORIZON-AWARE FUEL USAGE
        // =====================================================

        /*
         * Fuel consumption rate is litres per hour.
         *
         * Therefore:
         *
         * projected usage =
         * litres/hour × scenario horizon
         *
         * Example:
         *
         * 227 L/h × 24 h
         * = 5448 L
         */
        double projectedFuelUsage =
                simulatedConsumptionRate
                        * horizonHours;

        // =====================================================
        // 5. PROJECTED FUEL LEVEL
        // =====================================================

        double currentFuelLevel =
                safeValue(
                        state.getFuelLevelL()
                );

        double projectedFuelLevel =
                Math.max(
                        0.0,
                        currentFuelLevel
                                - projectedFuelUsage
                );

        if (state.getFuelCapacityL() != null
                && state.getFuelCapacityL() > 0) {

            state.setFuelLevelL(
                    projectedFuelLevel
            );

            double projectedFuelPercentage =
                    (
                            projectedFuelLevel
                                    / state.getFuelCapacityL()
                    ) * 100.0;

            state.setFuelPercentage(
                    clamp(
                            projectedFuelPercentage,
                            0.0,
                            100.0
                    )
            );
        }

        // =====================================================
        // 6. ESTIMATED RUNTIME
        // =====================================================

        /*
         * Runtime represents the remaining operating time after
         * the scenario horizon projection.
         *
         * It is calculated from:
         *
         * projected fuel level
         * --------------------
         * simulated fuel rate
         */
        if (simulatedConsumptionRate > 0) {

            double remainingRuntimeHours =
                    projectedFuelLevel
                            / simulatedConsumptionRate;

            state.setEstimatedRuntimeHours(
                    Math.max(
                            0.0,
                            remainingRuntimeHours
                    )
            );

        } else {

            state.setEstimatedRuntimeHours(
                    Double.POSITIVE_INFINITY
            );
        }

        return simulationState;
    }

    /**
     * Backward-compatible overload.
     *
     * Uses the values already available in the state and
     * assumes a one-hour horizon.
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

        TelemetrySnapshot state =
                simulationState.getState();

        double baselineGeneratorLoad =
                safeValue(
                        state.getGeneratorLoadPct()
                );

        double baselineFuelConsumptionRate =
                safeValue(
                        state.getFuelConsumptionRateLph()
                );

        return simulate(
                simulationState,
                changes,
                baselineGeneratorLoad,
                baselineFuelConsumptionRate,
                1
        );
    }

    /**
     * Safely converts nullable values to zero.
     */
    private double safeValue(Double value) {

        return value == null
                ? 0.0
                : value;
    }

    /**
     * Restricts a value to the supplied range.
     */
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