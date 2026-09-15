package com.antaris.backend.service;

import com.antaris.backend.simulator.TelemetrySnapshot;
import com.antaris.backend.simulator.TelemetrySnapshotBuilder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StationComparisonService {

    private final TelemetrySnapshotBuilder snapshotBuilder;
    private final StationHealthService stationHealthService;

    public StationComparisonService(
            TelemetrySnapshotBuilder snapshotBuilder,
            StationHealthService stationHealthService
    ) {
        this.snapshotBuilder = snapshotBuilder;
        this.stationHealthService = stationHealthService;
    }

    /**
     * Compares the latest available telemetry
     * of Maitri and Bharati.
     */
    public Map<String, Object> compareStations() {

        List<TelemetrySnapshot> snapshots =
                snapshotBuilder.buildSnapshots();

        TelemetrySnapshot maitri =
                getLatestSnapshot(
                        snapshots,
                        "MAITRI"
                );

        TelemetrySnapshot bharati =
                getLatestSnapshot(
                        snapshots,
                        "BHARATI"
                );

        if (maitri == null) {
            throw new IllegalStateException(
                    "No telemetry available for MAITRI"
            );
        }

        if (bharati == null) {
            throw new IllegalStateException(
                    "No telemetry available for BHARATI"
            );
        }

        Map<String, Object> maitriHealth =
                stationHealthService.calculateHealth(
                        maitri
                );

        Map<String, Object> bharatiHealth =
                stationHealthService.calculateHealth(
                        bharati
                );

        double maitriScore =
                ((Number) maitriHealth.get("healthScore"))
                        .doubleValue();

        double bharatiScore =
                ((Number) bharatiHealth.get("healthScore"))
                        .doubleValue();

        double healthDifference =
                Math.abs(
                        maitriScore - bharatiScore
                );

        healthDifference =
                Math.round(
                        healthDifference * 10.0
                ) / 10.0;

        String betterStation;

        if (maitriScore > bharatiScore) {
            betterStation = "MAITRI";
        } else if (bharatiScore > maitriScore) {
            betterStation = "BHARATI";
        } else {
            betterStation = "EQUAL";
        }

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "maitri",
                buildStationComparison(
                        maitri,
                        maitriHealth
                )
        );

        result.put(
                "bharati",
                buildStationComparison(
                        bharati,
                        bharatiHealth
                )
        );

        Map<String, Object> comparison =
                new LinkedHashMap<>();

        comparison.put(
                "healthDifference",
                healthDifference
        );

        comparison.put(
                "betterStation",
                betterStation
        );

        comparison.put(
                "comparisonTimestamp",
                java.time.LocalDateTime.now()
        );

        result.put(
                "comparison",
                comparison
        );

        return result;
    }

    /**
     * Finds the latest telemetry snapshot
     * for a particular station.
     */
    private TelemetrySnapshot getLatestSnapshot(
            List<TelemetrySnapshot> snapshots,
            String stationCode
    ) {

        return snapshots.stream()
                .filter(snapshot ->
                        stationCode.equalsIgnoreCase(
                                snapshot.getStationCode()
                        )
                )
                .max(
                        java.util.Comparator.comparing(
                                TelemetrySnapshot::getTimestamp
                        )
                )
                .orElse(null);
    }

    /**
     * Builds the comparison data for one station.
     */
    private Map<String, Object> buildStationComparison(
            TelemetrySnapshot snapshot,
            Map<String, Object> health
    ) {

        Map<String, Object> station =
                new LinkedHashMap<>();

        station.put(
                "station",
                snapshot.getStationCode()
        );

        station.put(
                "timestamp",
                snapshot.getTimestamp()
        );

        station.put(
                "healthScore",
                health.get("healthScore")
        );

        station.put(
                "status",
                health.get("status")
        );

        station.put(
                "batteryPercentage",
                snapshot.getBatteryPercentage()
        );

        station.put(
                "fuelPercentage",
                snapshot.getFuelPercentage()
        );

        station.put(
                "powerBalanceKw",
                snapshot.getPowerBalanceKw()
        );

        station.put(
                "generatorLoadPct",
                snapshot.getGeneratorLoadPct()
        );

        station.put(
                "temperatureC",
                snapshot.getTemperatureC()
        );

        station.put(
                "humidityPct",
                snapshot.getHumidityPct()
        );

        station.put(
                "windSpeed",
                snapshot.getWindSpeed()
        );

        station.put(
                "totalGenerationKw",
                snapshot.getTotalGenerationKw()
        );

        station.put(
                "totalConsumptionKw",
                snapshot.getTotalConsumptionKw()
        );

        station.put(
                "estimatedRuntimeHours",
                snapshot.getEstimatedRuntimeHours()
        );

        return station;
    }
}