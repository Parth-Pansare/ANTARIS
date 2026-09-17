package com.antaris.backend.ml.adapter;

import com.antaris.backend.ml.dto.PredictionRequest;
import com.antaris.backend.ml.dto.PredictionResponse;

public interface MlPredictionClient {

    PredictionResponse predictEnergy(
            PredictionRequest request
    );
}