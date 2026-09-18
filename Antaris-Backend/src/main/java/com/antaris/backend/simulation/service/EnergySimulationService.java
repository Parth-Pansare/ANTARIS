package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationState;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

@Service
public class EnergySimulationService {

    /**
     * Applies energy-related scenario changes to an isolated
     * simulation state.
     *
     * IMPORTANT:
     *
     * Environmental values such as temperature, humidity and
     * wind speed are modified by EnvironmentSimulationService.
     *
     * This service only READS those already-simulated environmental
     * values and calculates their effect on energy.
     *
     * The original station state is never modified.
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
        // 1. CAPTURE BASELINE ENERGY VALUES
        // =====================================================

        double baselineGeneratorLoad =
                safeValue(
                        state.getGeneratorLoadPct()
                );

        double baselineGeneratorGeneration =
                safeValue(
                        state.getGeneratorGenerationKw()
                );

        double baselineConsumption =
                safeValue(
                        state.getTotalConsumptionKw()
                );

        double baselineWindGeneration =
                safeValue(
                        state.getWindGenerationKw()
                );

        double baselineWindResource =
                safeValue(
                        state.getWindResourceIndex()
                );

        // =====================================================
        // 2. GENERATOR AVAILABILITY
        // =====================================================

        double generatorAvailabilityMultiplier = 1.0;

        if (changes.getGeneratorAvailabilityChangePct()
                != null) {

            generatorAvailabilityMultiplier =
                    1.0
                            + changes.getGeneratorAvailabilityChangePct()
                            / 100.0;

            /*
             * Generator availability must remain between
             * 0% and 100%.
             */
            generatorAvailabilityMultiplier =
                    clamp(
                            generatorAvailabilityMultiplier,
                            0.0,
                            1.0
                    );
        }

        // =====================================================
        // 3. GENERATOR GENERATION
        // =====================================================

        double simulatedGeneratorGeneration =
                baselineGeneratorGeneration
                        * generatorAvailabilityMultiplier;

        simulatedGeneratorGeneration =
                Math.max(
                        0.0,
                        simulatedGeneratorGeneration
                );

        state.setGeneratorGenerationKw(
                simulatedGeneratorGeneration
        );

        // =====================================================
        // 4. WIND RESOURCE EFFECT
        // =====================================================

        double simulatedWindResource =
                baselineWindResource;

        if (changes.getWindResourceChange() != null
                && state.getWindResourceIndex() != null) {

            simulatedWindResource =
                    baselineWindResource
                            + changes.getWindResourceChange();

            simulatedWindResource =
                    clamp(
                            simulatedWindResource,
                            0.0,
                            1.0
                    );

            state.setWindResourceIndex(
                    simulatedWindResource
            );
        }

        /*
         * Scale wind generation according to the simulated
         * wind-resource index.
         *
         * EnvironmentSimulationService is responsible for
         * updating wind speed.
         */
        if (changes.getWindResourceChange() != null
                && baselineWindResource > 0.0) {

            double windGenerationRatio =
                    simulatedWindResource
                            / baselineWindResource;

            double simulatedWindGeneration =
                    baselineWindGeneration
                            * windGenerationRatio;

            simulatedWindGeneration =
                    Math.max(
                            0.0,
                            simulatedWindGeneration
                    );

            state.setWindGenerationKw(
                    simulatedWindGeneration
            );
        }

        // =====================================================
        // 5. CONSUMPTION CHANGE
        // =====================================================

        double consumptionMultiplier = 1.0;

        if (changes.getConsumptionChangePct() != null) {

            consumptionMultiplier =
                    1.0
                            + changes.getConsumptionChangePct()
                            / 100.0;

            /*
             * Consumption cannot become negative.
             */
            consumptionMultiplier =
                    Math.max(
                            0.0,
                            consumptionMultiplier
                    );
        }

        double simulatedConsumption =
                baselineConsumption
                        * consumptionMultiplier;

        // =====================================================
        // 6. TEMPERATURE → HEATING DEMAND
        // =====================================================

        /*
         * EnvironmentSimulationService has already applied
         * the temperature scenario change.
         *
         * This service does NOT modify the temperature again.
         *
         * We use the requested temperature change only to
         * calculate the additional heating demand.
         *
         * Development heuristic:
         *
         * Every 1°C decrease in temperature increases energy
         * consumption by approximately 2%.
         *
         * This is a simulation heuristic and is NOT claimed
         * to represent measured NCPOR operational behavior.
         */

        double temperatureChange =
                safeValue(
                        changes.getTemperatureChangeC()
                );

        /*
         * Only a temperature decrease increases heating demand.
         */
        if (temperatureChange < 0.0) {

            double temperatureDrop =
                    Math.abs(temperatureChange);

            double heatingDemandMultiplier =
                    1.0
                            + (temperatureDrop * 0.02);

            simulatedConsumption =
                    simulatedConsumption
                            * heatingDemandMultiplier;
        }

        // =====================================================
        // 7. SET SIMULATED TOTAL CONSUMPTION
        // =====================================================

        simulatedConsumption =
                Math.max(
                        0.0,
                        simulatedConsumption
                );

        state.setTotalConsumptionKw(
                simulatedConsumption
        );

        // =====================================================
        // 8. TOTAL GENERATION
        // =====================================================

        double simulatedSolarGeneration =
                safeValue(
                        state.getSolarGenerationKw()
                );

        double simulatedWindGeneration =
                safeValue(
                        state.getWindGenerationKw()
                );

        double totalGeneration =
                simulatedGeneratorGeneration
                        + simulatedSolarGeneration
                        + simulatedWindGeneration;

        totalGeneration =
                Math.max(
                        0.0,
                        totalGeneration
                );

        state.setTotalGenerationKw(
                totalGeneration
        );

        // =====================================================
        // 9. POWER BALANCE
        // =====================================================

        double powerBalance =
                totalGeneration
                        - simulatedConsumption;

        state.setPowerBalanceKw(
                powerBalance
        );

        // =====================================================
        // 10. GENERATOR LOAD
        // =====================================================

        double simulatedGeneratorLoad =
                baselineGeneratorLoad;

        /*
         * Increased energy consumption increases generator
         * loading proportionally.
         */
        if (baselineConsumption > 0.0) {

            simulatedGeneratorLoad =
                    baselineGeneratorLoad
                            * (
                            simulatedConsumption
                                    / baselineConsumption
                    );
        }

        /*
         * Generator availability affects generator loading.
         *
         * The availability value is clamped before use.
         */
        if (changes.getGeneratorAvailabilityChangePct()
                != null) {

            double availability =
                    1.0
                            + changes.getGeneratorAvailabilityChangePct()
                            / 100.0;

            availability =
                    clamp(
                            availability,
                            0.0,
                            1.0
                    );

            if (availability > 0.0) {

                simulatedGeneratorLoad =
                        simulatedGeneratorLoad
                                / availability;
            }
        }

        /*
         * If generator generation becomes zero, the generator
         * cannot carry any load.
         */
        if (simulatedGeneratorGeneration <= 0.0) {

            simulatedGeneratorLoad = 0.0;
        }

        /*
         * Generator load must remain between 0% and 100%.
         */
        simulatedGeneratorLoad =
                clamp(
                        simulatedGeneratorLoad,
                        0.0,
                        100.0
                );

        state.setGeneratorLoadPct(
                simulatedGeneratorLoad
        );

        // =====================================================
        // 11. BATTERY SIMULATION
        // =====================================================

        double baselineBatteryPercentage =
                safeValue(
                        state.getBatteryPercentage()
                );

        double baselineBatteryKwh =
                safeValue(
                        state.getBatteryLevelKwh()
                );

        double simulatedBatteryPercentage =
                baselineBatteryPercentage;

        double simulatedBatteryKwh =
                baselineBatteryKwh;

        if (changes.getBatteryChangePct() != null) {

            simulatedBatteryPercentage =
                    baselineBatteryPercentage
                            + changes.getBatteryChangePct();

            /*
             * Battery percentage must remain between
             * 0% and 100%.
             */
            simulatedBatteryPercentage =
                    clamp(
                            simulatedBatteryPercentage,
                            0.0,
                            100.0
                    );

            /*
             * Scale battery energy proportionally with the
             * simulated battery percentage.
             */
            if (baselineBatteryPercentage > 0.0) {

                simulatedBatteryKwh =
                        baselineBatteryKwh
                                * (
                                simulatedBatteryPercentage
                                        / baselineBatteryPercentage
                        );
            }
        }

        simulatedBatteryKwh =
                Math.max(
                        0.0,
                        simulatedBatteryKwh
                );

        state.setBatteryPercentage(
                simulatedBatteryPercentage
        );

        state.setBatteryLevelKwh(
                simulatedBatteryKwh
        );

        // =====================================================
        // 12. RETURN SIMULATED STATE
        // =====================================================

        return simulationState;
    }

    // =========================================================
    // HELPER METHODS
    // =========================================================

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