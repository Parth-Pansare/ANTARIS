package com.antaris.backend.ml.dto;

import java.time.LocalDateTime;

public class PredictionHistoryResponse {

    private Long id;
    private String station;
    private String predictionType;
    private Double predictedValue;
    private String unit;
    private Integer horizonHours;
    private String modelVersion;
    private LocalDateTime predictionTimestamp;
    private LocalDateTime createdAt;

    public PredictionHistoryResponse() {
    }

    public PredictionHistoryResponse(
            Long id,
            String station,
            String predictionType,
            Double predictedValue,
            String unit,
            Integer horizonHours,
            String modelVersion,
            LocalDateTime predictionTimestamp,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.station = station;
        this.predictionType = predictionType;
        this.predictedValue = predictedValue;
        this.unit = unit;
        this.horizonHours = horizonHours;
        this.modelVersion = modelVersion;
        this.predictionTimestamp = predictionTimestamp;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getStation() {
        return station;
    }

    public String getPredictionType() {
        return predictionType;
    }

    public Double getPredictedValue() {
        return predictedValue;
    }

    public String getUnit() {
        return unit;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public LocalDateTime getPredictionTimestamp() {
        return predictionTimestamp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStation(String station) {
        this.station = station;
    }

    public void setPredictionType(String predictionType) {
        this.predictionType = predictionType;
    }

    public void setPredictedValue(Double predictedValue) {
        this.predictedValue = predictedValue;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public void setPredictionTimestamp(
            LocalDateTime predictionTimestamp
    ) {
        this.predictionTimestamp = predictionTimestamp;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}