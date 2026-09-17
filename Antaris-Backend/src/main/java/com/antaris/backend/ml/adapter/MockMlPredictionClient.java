package com.antaris.backend.ml.adapter;

import com.antaris.backend.ml.dto.PredictionFeatures;
import com.antaris.backend.ml.dto.PredictionRequest;
import com.antaris.backend.ml.dto.PredictionResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("mock-ml")
public class MockMlPredictionClient implements MlPredictionClient {

    @Override
    public PredictionResponse predictEnergy(
            PredictionRequest request
    ) {

        PredictionFeatures features = request.getFeatures();

        double currentConsumption = 0.0;

        if (features != null
                && features.getTotalConsumptionKw() != null) {

            currentConsumption =
                    features.getTotalConsumptionKw();
        }

        double predictedValue =
                currentConsumption * 1.03;

        predictedValue =
                Math.round(predictedValue * 100.0) / 100.0;

        return new PredictionResponse(
                request.getStation(),
                "ENERGY_CONSUMPTION",
                predictedValue,
                "kW",
                request.getHorizonHours(),
                "MOCK-ENERGY-V1"
        );
    }

    @Override
    public PredictionResponse predictFuel(
            PredictionRequest request
    ) {

        PredictionFeatures features = request.getFeatures();

        double currentFuelPercentage = 0.0;

        if (features != null
                && features.getFuelPercentage() != null) {

            currentFuelPercentage =
                    features.getFuelPercentage();
        }

        /*
         * Mock fuel prediction:
         * Predict a small decrease in fuel percentage
         * based on the requested prediction horizon.
         *
         * This is only a temporary mock model.
         * The real ML model will replace this later.
         */
        double predictedFuelPercentage =
                currentFuelPercentage
                        - (0.15 * request.getHorizonHours());

        predictedFuelPercentage =
                Math.max(0.0, predictedFuelPercentage);

        predictedFuelPercentage =
                Math.round(
                        predictedFuelPercentage * 100.0
                ) / 100.0;

        return new PredictionResponse(
                request.getStation(),
                "FUEL_LEVEL",
                predictedFuelPercentage,
                "%",
                request.getHorizonHours(),
                "MOCK-FUEL-V1"
        );
    }
}