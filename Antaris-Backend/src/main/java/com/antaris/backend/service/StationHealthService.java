package com.antaris.backend.service;

import com.antaris.backend.simulator.TelemetrySimulatorService;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class StationHealthService {

    private final TelemetrySimulatorService telemetrySimulatorService;

    public StationHealthService(
            TelemetrySimulatorService telemetrySimulatorService
    ) {
        this.telemetrySimulatorService =
                telemetrySimulatorService;
    }

    /**
     * Calculates the health score for the
     * currently selected station.
     */
    public Map<String, Object> calculateCurrentHealth() {

        TelemetrySnapshot snapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        return calculateHealth(snapshot);
    }

    /**
     * Calculates a station health score from
     * the current telemetry snapshot.
     *
     * Score range: 0 - 100
     */
    public Map<String, Object> calculateHealth(
            TelemetrySnapshot snapshot
    ) {

        Map<String, Object> result =
                new LinkedHashMap<>();

        if (snapshot == null) {

            result.put(
                    "station",
                    "UNKNOWN"
            );

            result.put(
                    "healthScore",
                    0.0
            );

            result.put(
                    "status",
                    "UNKNOWN"
            );

            return result;
        }

        double batteryScore =
                calculateBatteryScore(
                        snapshot.getBatteryPercentage()
                );

        double fuelScore =
                calculateFuelScore(
                        snapshot.getFuelPercentage()
                );

        double energyScore =
                calculateEnergyScore(
                        snapshot.getPowerBalanceKw()
                );

        double generatorScore =
                calculateGeneratorScore(
                        snapshot.getGeneratorLoadPct()
                );

        double environmentScore =
                calculateEnvironmentScore(
                        snapshot.getTemperatureC()
                );

        /*
         * Weighted station health score.
         */
        double healthScore =
                (batteryScore * 0.20)
                        + (fuelScore * 0.20)
                        + (energyScore * 0.25)
                        + (generatorScore * 0.20)
                        + (environmentScore * 0.15);

        /*
         * Keep score between 0 and 100.
         */
        healthScore =
                Math.max(
                        0,
                        Math.min(
                                100,
                                healthScore
                        )
                );

        healthScore =
                Math.round(
                        healthScore * 10.0
                ) / 10.0;

        String status =
                getHealthStatus(healthScore);

        result.put(
                "station",
                snapshot.getStationCode()
        );

        result.put(
                "timestamp",
                snapshot.getTimestamp()
        );

        result.put(
                "healthScore",
                healthScore
        );

        result.put(
                "status",
                status
        );

        /*
         * Individual component scores.
         */
        result.put(
                "batteryScore",
                round(batteryScore)
        );

        result.put(
                "fuelScore",
                round(fuelScore)
        );

        result.put(
                "energyScore",
                round(energyScore)
        );

        result.put(
                "generatorScore",
                round(generatorScore)
        );

        result.put(
                "environmentScore",
                round(environmentScore)
        );

        /*
         * Raw telemetry values used by the score.
         */
        result.put(
                "batteryPercentage",
                snapshot.getBatteryPercentage()
        );

        result.put(
                "fuelPercentage",
                snapshot.getFuelPercentage()
        );

        result.put(
                "powerBalanceKw",
                snapshot.getPowerBalanceKw()
        );

        result.put(
                "generatorLoadPct",
                snapshot.getGeneratorLoadPct()
        );

        result.put(
                "temperatureC",
                snapshot.getTemperatureC()
        );

        return result;
    }

    /**
     * Battery health.
     */
    private double calculateBatteryScore(
            double batteryPercentage
    ) {

        if (batteryPercentage >= 80) {
            return 100;
        }

        if (batteryPercentage >= 60) {
            return 90;
        }

        if (batteryPercentage >= 40) {
            return 75;
        }

        if (batteryPercentage >= 20) {
            return 50;
        }

        return 20;
    }

    /**
     * Fuel health.
     */
    private double calculateFuelScore(
            double fuelPercentage
    ) {

        if (fuelPercentage >= 70) {
            return 100;
        }

        if (fuelPercentage >= 50) {
            return 90;
        }

        if (fuelPercentage >= 30) {
            return 70;
        }

        if (fuelPercentage >= 15) {
            return 45;
        }

        return 15;
    }

    /**
     * Energy health based on power balance.
     */
    private double calculateEnergyScore(
            double powerBalanceKw
    ) {

        if (powerBalanceKw >= 100) {
            return 100;
        }

        if (powerBalanceKw >= 50) {
            return 90;
        }

        if (powerBalanceKw >= 0) {
            return 75;
        }

        if (powerBalanceKw >= -50) {
            return 45;
        }

        return 15;
    }

    /**
     * Generator health based on generator load.
     */
    private double calculateGeneratorScore(
            double generatorLoadPct
    ) {

        if (generatorLoadPct <= 60) {
            return 100;
        }

        if (generatorLoadPct <= 75) {
            return 90;
        }

        if (generatorLoadPct <= 85) {
            return 70;
        }

        if (generatorLoadPct <= 90) {
            return 50;
        }

        return 20;
    }

    /**
     * Environmental health.
     *
     * Extremely low temperatures reduce the score,
     * while moderate Antarctic operating temperatures
     * receive a higher score.
     */
    private double calculateEnvironmentScore(
            double temperatureC
    ) {

        if (temperatureC >= -20
                && temperatureC <= 5) {
            return 100;
        }

        if (temperatureC >= -30
                && temperatureC <= 10) {
            return 85;
        }

        if (temperatureC >= -40
                && temperatureC <= 15) {
            return 65;
        }

        return 40;
    }

    /**
     * Converts the numerical score into
     * a human-readable health status.
     */
    private String getHealthStatus(
            double healthScore
    ) {

        if (healthScore >= 90) {
            return "EXCELLENT";
        }

        if (healthScore >= 75) {
            return "GOOD";
        }

        if (healthScore >= 50) {
            return "WARNING";
        }

        return "CRITICAL";
    }

    /**
     * Rounds a score to one decimal place.
     */
    private double round(double value) {

        return Math.round(
                value * 10.0
        ) / 10.0;
    }
}