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

    @Override
    public PredictionResponse predictEnvironment(
            PredictionRequest request
    ) {

        PredictionFeatures features = request.getFeatures();

        double currentTemperature = 0.0;

        if (features != null
                && features.getTemperatureC() != null) {

            currentTemperature =
                    features.getTemperatureC();
        }

        double predictedTemperature =
                currentTemperature
                        - (0.20 * request.getHorizonHours());

        predictedTemperature =
                Math.round(
                        predictedTemperature * 100.0
                ) / 100.0;

        return new PredictionResponse(
                request.getStation(),
                "TEMPERATURE",
                predictedTemperature,
                "°C",
                request.getHorizonHours(),
                "MOCK-ENVIRONMENT-V1"
        );
    }

    @Override
    public PredictionResponse predictEquipment(
            PredictionRequest request
    ) {

        PredictionFeatures features = request.getFeatures();

        double generatorLoad = 0.0;

        if (features != null
                && features.getGeneratorLoadPct() != null) {

            generatorLoad =
                    features.getGeneratorLoadPct();
        }

        /*
         * Temporary mock anomaly score.
         *
         * Higher generator load produces a higher
         * equipment anomaly score.
         *
         * Real ML anomaly detection will replace
         * this calculation later.
         */
        double anomalyScore =
                Math.min(1.0, generatorLoad / 100.0);

        anomalyScore =
                Math.round(
                        anomalyScore * 100.0
                ) / 100.0;

        return new PredictionResponse(
                request.getStation(),
                "EQUIPMENT_ANOMALY",
                anomalyScore,
                "score",
                request.getHorizonHours(),
                "MOCK-EQUIPMENT-V1"
        );
    }
}