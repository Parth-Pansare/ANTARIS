package com.antaris.backend.ml.dto;

public class PredictionRiskResponse {

    private String station;
    private String predictionType;
    private Double predictedValue;
    private Double riskScore;
    private String riskLevel;
    private String reason;
    private String modelVersion;
    private Integer horizonHours;

    public PredictionRiskResponse() {
    }

    public PredictionRiskResponse(
            String station,
            String predictionType,
            Double predictedValue,
            Double riskScore,
            String riskLevel,
            String reason,
            String modelVersion,
            Integer horizonHours
    ) {
        this.station = station;
        this.predictionType = predictionType;
        this.predictedValue = predictedValue;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.reason = reason;
        this.modelVersion = modelVersion;
        this.horizonHours = horizonHours;
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

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }
}