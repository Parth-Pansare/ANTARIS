package com.antaris.backend.service;

import com.antaris.backend.simulator.TelemetryDataLoader;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class HistoricalTelemetryService {

    private final TelemetryDataLoader telemetryDataLoader;

    public HistoricalTelemetryService(
            TelemetryDataLoader telemetryDataLoader
    ) {
        this.telemetryDataLoader = telemetryDataLoader;
    }

    public List<Map<String, String>> getEnergyTelemetry(
            String stationCode,
            String from,
            String to,
            int limit
    ) {

        List<Map<String, String>> rows =
                telemetryDataLoader.load(
                        "02_station_energy_telemetry.csv"
                );

        return rows.stream()
                .filter(row ->
                        stationCode.equalsIgnoreCase(
                                row.get("station_code")
                        )
                )
                .filter(row -> {

                    String timestamp = row.get("timestamp");

                    if (from != null && !from.isBlank()
                            && timestamp.compareTo(from) < 0) {
                        return false;
                    }

                    if (to != null && !to.isBlank()
                            && timestamp.compareTo(to) > 0) {
                        return false;
                    }

                    return true;
                })
                .limit(limit)
                .toList();
    }

    public List<Map<String, String>> getFuelTelemetry(
            String stationCode,
            String from,
            String to,
            int limit
    ) {

        List<Map<String, String>> rows =
                telemetryDataLoader.load(
                        "03_station_fuel_telemetry.csv"
                );

        return rows.stream()
                .filter(row ->
                        stationCode.equalsIgnoreCase(
                                row.get("station_code")
                        )
                )
                .filter(row -> {

                    String timestamp = row.get("timestamp");

                    if (from != null && !from.isBlank()
                            && timestamp.compareTo(from) < 0) {
                        return false;
                    }

                    if (to != null && !to.isBlank()
                            && timestamp.compareTo(to) > 0) {
                        return false;
                    }

                    return true;
                })
                .limit(limit)
                .toList();
    }

    public List<Map<String, String>> getEquipmentTelemetry(
            String stationCode,
            String from,
            String to,
            int limit
    ) {

        List<Map<String, String>> rows =
                telemetryDataLoader.load(
                        "04_equipment_telemetry.csv"
                );

        return rows.stream()
                .filter(row ->
                        stationCode.equalsIgnoreCase(
                                row.get("station_code")
                        )
                )
                .filter(row -> {

                    String timestamp = row.get("timestamp");

                    if (from != null && !from.isBlank()
                            && timestamp.compareTo(from) < 0) {
                        return false;
                    }

                    if (to != null && !to.isBlank()
                            && timestamp.compareTo(to) > 0) {
                        return false;
                    }

                    return true;
                })
                .limit(limit)
                .toList();
    }

    public List<Map<String, String>> getOperationsTelemetry(
            String stationCode,
            String from,
            String to,
            int limit
    ) {

        List<Map<String, String>> rows =
                telemetryDataLoader.load(
                        "05_station_operations_telemetry.csv"
                );

        return rows.stream()
                .filter(row ->
                        stationCode.equalsIgnoreCase(
                                row.get("station_code")
                        )
                )
                .filter(row -> {

                    String timestamp = row.get("timestamp");

                    if (from != null && !from.isBlank()
                            && timestamp.compareTo(from) < 0) {
                        return false;
                    }

                    if (to != null && !to.isBlank()
                            && timestamp.compareTo(to) > 0) {
                        return false;
                    }

                    return true;
                })
                .limit(limit)
                .toList();
    }

    public List<Map<String, String>> getInventoryTelemetry(
            String stationCode,
            String from,
            String to,
            int limit
    ) {

        List<Map<String, String>> rows =
                telemetryDataLoader.load(
                        "06_inventory_logistics_telemetry.csv"
                );

        return rows.stream()
                .filter(row ->
                        stationCode.equalsIgnoreCase(
                                row.get("station_code")
                        )
                )
                .filter(row -> {

                    String timestamp = row.get("timestamp");

                    if (from != null && !from.isBlank()
                            && timestamp.compareTo(from) < 0) {
                        return false;
                    }

                    if (to != null && !to.isBlank()
                            && timestamp.compareTo(to) > 0) {
                        return false;
                    }

                    return true;
                })
                .limit(limit)
                .toList();
    }

    public List<Map<String, String>> getEnvironmentTelemetry(
            String stationCode,
            String from,
            String to,
            int limit
    ) {

        List<Map<String, String>> rows =
                telemetryDataLoader.load(
                        "01_station_environment_telemetry.csv"
                );

        return rows.stream()
                .filter(row ->
                        stationCode.equalsIgnoreCase(
                                row.get("station_code")
                        )
                )
                .filter(row -> {

                    String timestamp = row.get("timestamp");

                    if (from != null && !from.isBlank()
                            && timestamp.compareTo(from) < 0) {
                        return false;
                    }

                    if (to != null && !to.isBlank()
                            && timestamp.compareTo(to) > 0) {
                        return false;
                    }

                    return true;
                })
                .limit(limit)
                .toList();
    }
}