package com.antaris.backend.ml.dto;

public class PredictionRequest {

    private String station;
    private String timestamp;
    private PredictionFeatures features;
    private Integer horizonHours;

    public PredictionRequest() {
    }

    public String getStation() {
        return station;
    }

    public void setStation(String station) {
        this.station = station;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public PredictionFeatures getFeatures() {
        return features;
    }

    public void setFeatures(PredictionFeatures features) {
        this.features = features;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }
}