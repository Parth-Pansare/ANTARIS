package com.antaris.backend.simulator;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class TelemetrySnapshotBuilder {

    private final TelemetryDataLoader telemetryDataLoader;

    public TelemetrySnapshotBuilder(TelemetryDataLoader telemetryDataLoader) {
        this.telemetryDataLoader = telemetryDataLoader;
    }

    public List<TelemetrySnapshot> buildSnapshots() {

        List<Map<String, String>> environmentRows =
                telemetryDataLoader.load("01_station_environment_telemetry.csv");

        List<Map<String, String>> energyRows =
                telemetryDataLoader.load("02_station_energy_telemetry.csv");

        List<Map<String, String>> fuelRows =
                telemetryDataLoader.load("03_station_fuel_telemetry.csv");

        Map<String, Map<String, String>> energyMap =
                createLookupMap(energyRows);

        Map<String, Map<String, String>> fuelMap =
                createLookupMap(fuelRows);

        return environmentRows.stream()
                .map(environment -> {

                    String key = createKey(
                            environment.get("station_code"),
                            environment.get("timestamp")
                    );

                    Map<String, String> energy = energyMap.get(key);
                    Map<String, String> fuel = fuelMap.get(key);

                    return buildSnapshot(environment, energy, fuel);
                })
                .filter(snapshot ->
                        snapshot.getTimestamp() != null &&
                                snapshot.getStationCode() != null
                )
                .toList();
    }

    private TelemetrySnapshot buildSnapshot(
            Map<String, String> environment,
            Map<String, String> energy,
            Map<String, String> fuel
    ) {

        TelemetrySnapshot snapshot = new TelemetrySnapshot();

        snapshot.setTimestamp(
                parseDateTime(environment.get("timestamp"))
        );

        snapshot.setStationCode(
                environment.get("station_code")
        );

        // Environment
        snapshot.setTemperatureC(
                parseDouble(environment.get("temperature_c"))
        );

        snapshot.setAirPressureHpa(
                parseDouble(environment.get("air_pressure_hpa"))
        );

        snapshot.setHumidityPct(
                parseDouble(environment.get("humidity_pct"))
        );

        snapshot.setWindSpeed(
                parseDouble(environment.get("wind_speed_source_unit"))
        );

        snapshot.setWindDirectionDeg(
                parseDouble(environment.get("wind_direction_deg"))
        );

        snapshot.setWindResourceIndex(
                parseDouble(environment.get("wind_resource_index"))
        );

        // Energy
        if (energy != null) {

            snapshot.setSolarGenerationKw(
                    parseDouble(energy.get("solar_generation_kw"))
            );

            snapshot.setWindGenerationKw(
                    parseDouble(energy.get("wind_generation_kw"))
            );

            snapshot.setGeneratorGenerationKw(
                    parseDouble(energy.get("generator_generation_kw"))
            );

            snapshot.setTotalGenerationKw(
                    parseDouble(energy.get("total_generation_kw"))
            );

            snapshot.setTotalConsumptionKw(
                    parseDouble(energy.get("total_consumption_kw"))
            );

            snapshot.setPowerBalanceKw(
                    parseDouble(energy.get("power_balance_kw"))
            );

            snapshot.setBatteryLevelKwh(
                    parseDouble(energy.get("battery_level_kwh"))
            );

            snapshot.setBatteryPercentage(
                    parseDouble(energy.get("battery_percentage"))
            );

            snapshot.setGeneratorLoadPct(
                    parseDouble(energy.get("generator_load_pct"))
            );
        }

        // Fuel
        if (fuel != null) {

            snapshot.setFuelLevelL(
                    parseDouble(fuel.get("fuel_level_l"))
            );

            snapshot.setFuelCapacityL(
                    parseDouble(fuel.get("fuel_capacity_l"))
            );

            snapshot.setFuelPercentage(
                    parseDouble(fuel.get("fuel_percentage"))
            );

            snapshot.setFuelConsumptionRateLph(
                    parseDouble(fuel.get("fuel_consumption_rate_lph"))
            );

            snapshot.setEstimatedRuntimeHours(
                    parseDouble(fuel.get("estimated_runtime_hours"))
            );
        }

        return snapshot;
    }

    private Map<String, Map<String, String>> createLookupMap(
            List<Map<String, String>> rows
    ) {

        Map<String, Map<String, String>> lookup = new HashMap<>();

        for (Map<String, String> row : rows) {

            String key = createKey(
                    row.get("station_code"),
                    row.get("timestamp")
            );

            lookup.put(key, row);
        }

        return lookup;
    }

    private String createKey(String stationCode, String timestamp) {
        return stationCode + "|" + timestamp;
    }

    private LocalDateTime parseDateTime(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return LocalDateTime.parse(
                value,
                java.time.format.DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd HH:mm:ss"
                )
        );
    }

    private Double parseDouble(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return Double.parseDouble(value);
    }
}