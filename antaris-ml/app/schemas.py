from typing import Optional

from pydantic import BaseModel, Field


class PredictionFeatures(BaseModel):
    temperatureC: Optional[float] = None
    humidityPct: Optional[float] = None
    windResourceIndex: Optional[float] = None
    batteryPercentage: Optional[float] = None
    fuelPercentage: Optional[float] = None
    generatorLoadPct: Optional[float] = None
    totalConsumptionKw: Optional[float] = None


class PredictionRequest(BaseModel):
    station: str
    timestamp: str
    features: PredictionFeatures
    horizonHours: int = Field(gt=0, le=168)


class PredictionResponse(BaseModel):
    station: str
    predictionType: str
    predictedValue: float
    unit: str
    horizonHours: int
    modelVersion: str