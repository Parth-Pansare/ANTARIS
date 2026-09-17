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
}