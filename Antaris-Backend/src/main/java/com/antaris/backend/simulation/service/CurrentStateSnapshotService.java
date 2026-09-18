package com.antaris.backend.simulation.service;

import com.antaris.backend.simulation.SimulationState;
import com.antaris.backend.simulator.TelemetrySnapshot;
import com.antaris.backend.simulator.TelemetrySimulatorService;
import org.springframework.stereotype.Service;

@Service
public class CurrentStateSnapshotService {

    private final TelemetrySimulatorService telemetrySimulatorService;

    public CurrentStateSnapshotService(
            TelemetrySimulatorService telemetrySimulatorService
    ) {
        this.telemetrySimulatorService =
                telemetrySimulatorService;
    }

    /**
     * Returns an independent copy of the current
     * telemetry state for simulation.
     *
     * The original telemetry snapshot is never modified.
     */
    public SimulationState getCurrentState() {

        TelemetrySnapshot currentSnapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        return new SimulationState(
                copySnapshot(currentSnapshot)
        );
    }

    /**
     * Creates a deep copy of the telemetry snapshot.
     */
    private TelemetrySnapshot copySnapshot(
            TelemetrySnapshot source
    ) {

        if (source == null) {
            throw new IllegalStateException(
                    "Current telemetry snapshot is unavailable."
            );
        }

        TelemetrySnapshot copy =
                new TelemetrySnapshot();

        copy.setTimestamp(
                source.getTimestamp()
        );

        copy.setStationCode(
                source.getStationCode()
        );

        // Environment
        copy.setTemperatureC(
                source.getTemperatureC()
        );

        copy.setAirPressureHpa(
                source.getAirPressureHpa()
        );

        copy.setHumidityPct(
                source.getHumidityPct()
        );

        copy.setWindSpeed(
                source.getWindSpeed()
        );

        copy.setWindDirectionDeg(
                source.getWindDirectionDeg()
        );

        copy.setWindResourceIndex(
                source.getWindResourceIndex()
        );

        // Energy
        copy.setSolarGenerationKw(
                source.getSolarGenerationKw()
        );

        copy.setWindGenerationKw(
                source.getWindGenerationKw()
        );

        copy.setGeneratorGenerationKw(
                source.getGeneratorGenerationKw()
        );

        copy.setTotalGenerationKw(
                source.getTotalGenerationKw()
        );

        copy.setTotalConsumptionKw(
                source.getTotalConsumptionKw()
        );

        copy.setPowerBalanceKw(
                source.getPowerBalanceKw()
        );

        copy.setBatteryLevelKwh(
                source.getBatteryLevelKwh()
        );

        copy.setBatteryPercentage(
                source.getBatteryPercentage()
        );

        copy.setGeneratorLoadPct(
                source.getGeneratorLoadPct()
        );

        // Fuel
        copy.setFuelLevelL(
                source.getFuelLevelL()
        );

        copy.setFuelCapacityL(
                source.getFuelCapacityL()
        );

        copy.setFuelPercentage(
                source.getFuelPercentage()
        );

        copy.setFuelConsumptionRateLph(
                source.getFuelConsumptionRateLph()
        );

        copy.setEstimatedRuntimeHours(
                source.getEstimatedRuntimeHours()
        );

        return copy;
    }
}