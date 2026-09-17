package com.antaris.backend.ml.dto;

public class PredictionStationComparisonResponse {

    private FutureHealthScoreResponse stationA;
    private FutureHealthScoreResponse stationB;

    private Integer horizonHours;

    public PredictionStationComparisonResponse() {
    }

    public PredictionStationComparisonResponse(
            FutureHealthScoreResponse stationA,
            FutureHealthScoreResponse stationB,
            Integer horizonHours
    ) {
        this.stationA = stationA;
        this.stationB = stationB;
        this.horizonHours = horizonHours;
    }

    public FutureHealthScoreResponse getStationA() {
        return stationA;
    }

    public void setStationA(
            FutureHealthScoreResponse stationA
    ) {
        this.stationA = stationA;
    }

    public FutureHealthScoreResponse getStationB() {
        return stationB;
    }

    public void setStationB(
            FutureHealthScoreResponse stationB
    ) {
        this.stationB = stationB;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public void setHorizonHours(
            Integer horizonHours
    ) {
        this.horizonHours = horizonHours;
    }
}