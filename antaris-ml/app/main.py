from fastapi import FastAPI

from app.schemas import PredictionRequest, PredictionResponse
from app.models import energy_model
from app.models import fuel_model
from app.models import environment_model
from app.models import equipment_model


app = FastAPI(
    title="ANTARIS ML Service",
    description="Machine Learning API for ANTARIS Antarctic Intelligence & Remote Operations System",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "ANTARIS ML Service",
        "version": "1.0.0"
    }


@app.get("/")
def root():
    return {
        "message": "ANTARIS ML Service is running",
        "service": "antaris-ml",
        "status": "UP"
    }


@app.post(
    "/predict/energy",
    response_model=PredictionResponse
)
def predict_energy(
    request: PredictionRequest
):
    return energy_model.predict(request)


@app.post(
    "/predict/fuel",
    response_model=PredictionResponse
)
def predict_fuel(
    request: PredictionRequest
):
    return fuel_model.predict(request)


@app.post(
    "/predict/environment",
    response_model=PredictionResponse
)
def predict_environment(
    request: PredictionRequest
):
    return environment_model.predict(request)


@app.post(
    "/predict/equipment",
    response_model=PredictionResponse
)
def predict_equipment(
    request: PredictionRequest
):
    return equipment_model.predict(request)