package com.antaris.backend.ml.dto;

public class PredictionResponse {

    private String station;
    private String predictionType;
    private Double predictedValue;
    private String unit;
    private Integer horizonHours;
    private String modelVersion;

    public PredictionResponse() {
    }

    public PredictionResponse(
            String station,
            String predictionType,
            Double predictedValue,
            String unit,
            Integer horizonHours,
            String modelVersion
    ) {
        this.station = station;
        this.predictionType = predictionType;
        this.predictedValue = predictedValue;
        this.unit = unit;
        this.horizonHours = horizonHours;
        this.modelVersion = modelVersion;
    }

    public String getStation() {
        return station;
    }

    public void setStation(String station) {
        this.station = station;
    }

    public String getPredictionType() {
        return predictionType;
    }

    public void setPredictionType(String predictionType) {
        this.predictionType = predictionType;
    }

    public Double getPredictedValue() {
        return predictedValue;
    }

    public void setPredictedValue(Double predictedValue) {
        this.predictedValue = predictedValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}