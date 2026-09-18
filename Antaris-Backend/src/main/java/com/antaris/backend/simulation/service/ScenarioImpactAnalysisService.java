package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.dto.SimulationImpact;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

@Service
public class ScenarioImpactAnalysisService {

    /**
     * Calculates the difference between the baseline state
     * and the simulated state.
     *
     * Formula:
     *
     * Impact = Simulated Value - Baseline Value
     *
     * Positive value means the simulated value increased.
     * Negative value means the simulated value decreased.
     */
    public SimulationImpact calculateImpact(
            TelemetrySnapshot baseline,
            TelemetrySnapshot simulated
    ) {

        if (baseline == null) {
            throw new IllegalArgumentException(
                    "Baseline state cannot be null."
            );
        }

        if (simulated == null) {
            throw new IllegalArgumentException(
                    "Simulated state cannot be null."
            );
        }

        SimulationImpact impact =
                new SimulationImpact();

        /*
         * =====================================================
         * 1. TEMPERATURE IMPACT
         * =====================================================
         */
        impact.setTemperatureDeltaC(
                difference(
                        simulated.getTemperatureC(),
                        baseline.getTemperatureC()
                )
        );

        /*
         * =====================================================
         * 2. ENERGY CONSUMPTION IMPACT
         * =====================================================
         */
        impact.setEnergyConsumptionDeltaKw(
                difference(
                        simulated.getTotalConsumptionKw(),
                        baseline.getTotalConsumptionKw()
                )
        );

        /*
         * =====================================================
         * 3. GENERATOR LOAD IMPACT
         * =====================================================
         */
        impact.setGeneratorLoadDeltaPct(
                difference(
                        simulated.getGeneratorLoadPct(),
                        baseline.getGeneratorLoadPct()
                )
        );

        /*
         * =====================================================
         * 4. FUEL CONSUMPTION IMPACT
         * =====================================================
         */
        impact.setFuelConsumptionDeltaLph(
                difference(
                        simulated.getFuelConsumptionRateLph(),
                        baseline.getFuelConsumptionRateLph()
                )
        );

        /*
         * =====================================================
         * 5. FUEL LEVEL IMPACT
         * =====================================================
         */
        impact.setFuelPercentageDelta(
                difference(
                        simulated.getFuelPercentage(),
                        baseline.getFuelPercentage()
                )
        );

        /*
         * =====================================================
         * 6. BATTERY IMPACT
         * =====================================================
         */
        impact.setBatteryPercentageDelta(
                difference(
                        simulated.getBatteryPercentage(),
                        baseline.getBatteryPercentage()
                )
        );

        return impact;
    }

    /**
     * Calculates:
     *
     * simulated - baseline
     *
     * Returns null when either value is unavailable.
     */
    private Double difference(
            Double simulated,
            Double baseline
    ) {

        if (simulated == null
                || baseline == null) {

            return null;
        }

        return simulated - baseline;
    }
}