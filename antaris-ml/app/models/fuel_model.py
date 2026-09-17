from app.schemas import PredictionRequest, PredictionResponse


MODEL_VERSION = "BASELINE-FUEL-V1"


def predict(request: PredictionRequest) -> PredictionResponse:
    features = request.features

    current_fuel = features.fuelPercentage or 0.0

    # Temporary baseline predictor.
    # This will be replaced by the trained ML model.
    predicted_value = current_fuel - (
        0.15 * request.horizonHours
    )

    predicted_value = max(0.0, predicted_value)
    predicted_value = round(predicted_value, 2)

    return PredictionResponse(
        station=request.station,
        predictionType="FUEL_LEVEL",
        predictedValue=predicted_value,
        unit="%",
        horizonHours=request.horizonHours,
        modelVersion=MODEL_VERSION,
    )