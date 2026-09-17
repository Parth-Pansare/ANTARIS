package com.antaris.backend.ml.dto;

public class PredictionRecommendationResponse {

    private String station;
    private String predictionType;
    private String riskLevel;
    private String recommendation;
    private String priority;
    private String modelVersion;
    private Integer horizonHours;

    public PredictionRecommendationResponse() {
    }

    public PredictionRecommendationResponse(
            String station,
            String predictionType,
            String riskLevel,
            String recommendation,
            String priority,
            String modelVersion,
            Integer horizonHours
    ) {
        this.station = station;
        this.predictionType = predictionType;
        this.riskLevel = riskLevel;
        this.recommendation = recommendation;
        this.priority = priority;
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

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
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