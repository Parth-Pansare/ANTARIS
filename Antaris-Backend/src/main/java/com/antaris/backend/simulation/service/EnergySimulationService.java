package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationState;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

@Service
public class EnergySimulationService {

    /**
     * Applies scenario changes to the copied simulation state.
     *
     * The original telemetry snapshot is never modified.
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
        // 1. TEMPERATURE EFFECT
        // =====================================================

        if (changes.getTemperatureChangeC() != null
                && state.getTemperatureC() != null) {

            state.setTemperatureC(
                    state.getTemperatureC()
                            + changes.getTemperatureChangeC()
            );
        }

        // =====================================================
        // 2. HUMIDITY EFFECT
        // =====================================================

        if (changes.getHumidityChangePct() != null
                && state.getHumidityPct() != null) {

            state.setHumidityPct(
                    clamp(
                            state.getHumidityPct()
                                    + changes.getHumidityChangePct(),
                            0.0,
                            100.0
                    )
            );
        }

        // =====================================================
        // 3. WIND RESOURCE EFFECT
        // =====================================================

        if (changes.getWindResourceChange() != null
                && state.getWindResourceIndex() != null) {

            state.setWindResourceIndex(
                    clamp(
                            state.getWindResourceIndex()
                                    + changes.getWindResourceChange(),
                            0.0,
                            1.0
                    )
            );

            if (state.getWindGenerationKw() != null) {

                state.setWindGenerationKw(
                        Math.max(
                                0.0,
                                state.getWindGenerationKw()
                                        * (
                                        1.0
                                                + changes
                                                .getWindResourceChange()
                                )
                        )
                );
            }
        }

        // =====================================================
        // 4. GENERATOR AVAILABILITY EFFECT
        // =====================================================

        if (changes.getGeneratorAvailabilityChangePct() != null
                && state.getGeneratorGenerationKw() != null) {

            double availabilityMultiplier =
                    1.0
                            + (
                            changes
                                    .getGeneratorAvailabilityChangePct()
                                    / 100.0
                    );

            availabilityMultiplier =
                    Math.max(
                            0.0,
                            availabilityMultiplier
                    );

            state.setGeneratorGenerationKw(
                    state.getGeneratorGenerationKw()
                            * availabilityMultiplier
            );
        }

        // =====================================================
        // 5. CONSUMPTION EFFECT
        // =====================================================

        if (changes.getConsumptionChangePct() != null
                && state.getTotalConsumptionKw() != null) {

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

            state.setTotalConsumptionKw(
                    state.getTotalConsumptionKw()
                            * consumptionMultiplier
            );
        }

        // =====================================================
        // 6. RECALCULATE TOTAL GENERATION
        // =====================================================

        double solar =
                safeValue(
                        state.getSolarGenerationKw()
                );

        double wind =
                safeValue(
                        state.getWindGenerationKw()
                );

        double generator =
                safeValue(
                        state.getGeneratorGenerationKw()
                );

        double totalGeneration =
                solar
                        + wind
                        + generator;

        state.setTotalGenerationKw(
                totalGeneration
        );

        // =====================================================
        // 7. RECALCULATE POWER BALANCE
        // =====================================================

        double consumption =
                safeValue(
                        state.getTotalConsumptionKw()
                );

        double powerBalance =
                totalGeneration
                        - consumption;

        state.setPowerBalanceKw(
                powerBalance
        );

        // =====================================================
        // 8. GENERATOR LOAD
        // =====================================================

        if (generator > 0
                && consumption > 0) {

            double generatorLoad =
                    (
                            generator
                                    / consumption
                    ) * 100.0;

            state.setGeneratorLoadPct(
                    clamp(
                            generatorLoad,
                            0.0,
                            100.0
                    )
            );
        }

        // =====================================================
        // 9. BATTERY EFFECT
        // =====================================================

        if (changes.getBatteryChangePct() != null
                && state.getBatteryPercentage() != null) {

            state.setBatteryPercentage(
                    clamp(
                            state.getBatteryPercentage()
                                    + changes.getBatteryChangePct(),
                            0.0,
                            100.0
                    )
            );

            if (state.getBatteryLevelKwh() != null) {

                double currentBatteryPercentage =
                        state.getBatteryPercentage();

                double originalPercentage =
                        currentBatteryPercentage
                                - changes.getBatteryChangePct();

                if (originalPercentage > 0) {

                    double ratio =
                            currentBatteryPercentage
                                    / originalPercentage;

                    state.setBatteryLevelKwh(
                            Math.max(
                                    0.0,
                                    state.getBatteryLevelKwh()
                                            * ratio
                            )
                    );
                }
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