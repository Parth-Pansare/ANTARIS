from app.schemas import PredictionRequest, PredictionResponse


MODEL_VERSION = "BASELINE-ENVIRONMENT-V1"


def predict(request: PredictionRequest) -> PredictionResponse:
    features = request.features

    current_temperature = features.temperatureC or 0.0

    # Temporary baseline predictor.
    # Antarctic temperatures may legitimately be negative.
    predicted_value = current_temperature - (
        0.20 * request.horizonHours
    )

    predicted_value = round(predicted_value, 2)

    return PredictionResponse(
        station=request.station,
        predictionType="TEMPERATURE",
        predictedValue=predicted_value,
        unit="°C",
        horizonHours=request.horizonHours,
        modelVersion=MODEL_VERSION,
    )