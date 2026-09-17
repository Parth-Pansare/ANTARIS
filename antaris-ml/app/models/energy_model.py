from app.schemas import PredictionRequest, PredictionResponse


MODEL_VERSION = "BASELINE-ENERGY-V1"


def predict(request: PredictionRequest) -> PredictionResponse:
    features = request.features

    current_consumption = features.totalConsumptionKw or 0.0

    # Temporary baseline predictor.
    # This will be replaced by the trained ML model.
    predicted_value = current_consumption * (
        1.0 + (0.03 * request.horizonHours)
    )

    predicted_value = round(predicted_value, 2)

    return PredictionResponse(
        station=request.station,
        predictionType="ENERGY_CONSUMPTION",
        predictedValue=predicted_value,
        unit="kW",
        horizonHours=request.horizonHours,
        modelVersion=MODEL_VERSION,
    )