package com.antaris.backend.ml.service;

import com.antaris.backend.ml.dto.PredictionFeatures;
import com.antaris.backend.ml.dto.PredictionRequest;
import com.antaris.backend.simulator.TelemetrySnapshot;
import org.springframework.stereotype.Service;

@Service
public class EnergyPredictionFeatureBuilder {

    public PredictionRequest buildRequest(
            TelemetrySnapshot snapshot,
            int horizonHours
    ) {

        if (snapshot == null) {
            throw new IllegalArgumentException(
                    "Telemetry snapshot cannot be null"
            );
        }

        if (snapshot.getStationCode() == null
                || snapshot.getStationCode().isBlank()) {

            throw new IllegalArgumentException(
                    "Telemetry snapshot has no station code"
            );
        }

        if (snapshot.getTimestamp() == null) {

            throw new IllegalArgumentException(
                    "Telemetry snapshot has no timestamp"
            );
        }

        PredictionFeatures features =
                new PredictionFeatures();

        features.setTemperatureC(
                snapshot.getTemperatureC()
        );

        features.setHumidityPct(
                snapshot.getHumidityPct()
        );

        features.setWindResourceIndex(
                snapshot.getWindResourceIndex()
        );

        features.setBatteryPercentage(
                snapshot.getBatteryPercentage()
        );

        features.setFuelPercentage(
                snapshot.getFuelPercentage()
        );

        features.setGeneratorLoadPct(
                snapshot.getGeneratorLoadPct()
        );

        features.setTotalConsumptionKw(
                snapshot.getTotalConsumptionKw()
        );

        PredictionRequest request =
                new PredictionRequest();

        request.setStation(
                snapshot.getStationCode()
        );

        request.setTimestamp(
                snapshot.getTimestamp().toString()
        );

        request.setFeatures(features);

        request.setHorizonHours(horizonHours);

        return request;
    }
}