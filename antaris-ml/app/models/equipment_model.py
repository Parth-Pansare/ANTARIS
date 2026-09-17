from app.schemas import PredictionRequest, PredictionResponse


MODEL_VERSION = "BASELINE-EQUIPMENT-V1"


def predict(request: PredictionRequest) -> PredictionResponse:
    features = request.features

    generator_load = features.generatorLoadPct or 0.0

    # Temporary baseline anomaly score.
    # Higher generator load produces a higher anomaly score.
    #
    # This is NOT the final equipment ML model.
    # It will be replaced by the trained anomaly-detection model.
    anomaly_score = min(1.0, generator_load / 100.0)

    anomaly_score = round(anomaly_score, 2)

    return PredictionResponse(
        station=request.station,
        predictionType="EQUIPMENT_ANOMALY",
        predictedValue=anomaly_score,
        unit="score",
        horizonHours=request.horizonHours,
        modelVersion=MODEL_VERSION,
    )