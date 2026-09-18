package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.ScenarioChange;
import com.antaris.backend.simulation.SimulationState;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

@Service
public class EnvironmentSimulationService {

    /**
     * Applies environmental scenario changes to the
     * copied simulation state.
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
        // 1. TEMPERATURE
        // =====================================================

        if (changes.getTemperatureChangeC() != null
                && state.getTemperatureC() != null) {

            state.setTemperatureC(
                    state.getTemperatureC()
                            + changes.getTemperatureChangeC()
            );
        }

        // =====================================================
        // 2. HUMIDITY
        // =====================================================

        if (changes.getHumidityChangePct() != null
                && state.getHumidityPct() != null) {

            double newHumidity =
                    state.getHumidityPct()
                            + changes.getHumidityChangePct();

            state.setHumidityPct(
                    clamp(
                            newHumidity,
                            0.0,
                            100.0
                    )
            );
        }

        // =====================================================
        // 3. WIND RESOURCE
        // =====================================================

        if (changes.getWindResourceChange() != null
                && state.getWindResourceIndex() != null) {

            double newWindResource =
                    state.getWindResourceIndex()
                            + changes.getWindResourceChange();

            state.setWindResourceIndex(
                    clamp(
                            newWindResource,
                            0.0,
                            1.0
                    )
            );

            /*
             * Keep wind speed consistent with the simulated
             * wind resource index.
             *
             * The source datasets may use different wind-speed
             * units, therefore we do not assume a universal
             * physical conversion here.
             */
            if (state.getWindSpeed() != null) {

                double originalResource =
                        state.getWindResourceIndex()
                                - changes.getWindResourceChange();

                if (originalResource > 0) {

                    double ratio =
                            newWindResource
                                    / originalResource;

                    state.setWindSpeed(
                            Math.max(
                                    0.0,
                                    state.getWindSpeed()
                                            * ratio
                            )
                    );
                }
            }
        }

        return simulationState;
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