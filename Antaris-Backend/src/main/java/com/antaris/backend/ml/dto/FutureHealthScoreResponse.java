package com.antaris.backend.ml.dto;

public class FutureHealthScoreResponse {

    private String station;
    private Integer horizonHours;

    private Double futureHealthScore;
    private String healthLevel;

    private Double energyRiskScore;
    private Double fuelRiskScore;
    private Double environmentRiskScore;
    private Double equipmentRiskScore;

    private String summary;

    public FutureHealthScoreResponse() {
    }

    public FutureHealthScoreResponse(
            String station,
            Integer horizonHours,
            Double futureHealthScore,
            String healthLevel,
            Double energyRiskScore,
            Double fuelRiskScore,
            Double environmentRiskScore,
            Double equipmentRiskScore,
            String summary
    ) {
        this.station = station;
        this.horizonHours = horizonHours;
        this.futureHealthScore = futureHealthScore;
        this.healthLevel = healthLevel;
        this.energyRiskScore = energyRiskScore;
        this.fuelRiskScore = fuelRiskScore;
        this.environmentRiskScore = environmentRiskScore;
        this.equipmentRiskScore = equipmentRiskScore;
        this.summary = summary;
    }

    public String getStation() {
        return station;
    }

    public void setStation(String station) {
        this.station = station;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }

    public Double getFutureHealthScore() {
        return futureHealthScore;
    }

    public void setFutureHealthScore(
            Double futureHealthScore
    ) {
        this.futureHealthScore =
                futureHealthScore;
    }

    public String getHealthLevel() {
        return healthLevel;
    }

    public void setHealthLevel(
            String healthLevel
    ) {
        this.healthLevel = healthLevel;
    }

    public Double getEnergyRiskScore() {
        return energyRiskScore;
    }

    public void setEnergyRiskScore(
            Double energyRiskScore
    ) {
        this.energyRiskScore =
                energyRiskScore;
    }

    public Double getFuelRiskScore() {
        return fuelRiskScore;
    }

    public void setFuelRiskScore(
            Double fuelRiskScore
    ) {
        this.fuelRiskScore =
                fuelRiskScore;
    }

    public Double getEnvironmentRiskScore() {
        return environmentRiskScore;
    }

    public void setEnvironmentRiskScore(
            Double environmentRiskScore
    ) {
        this.environmentRiskScore =
                environmentRiskScore;
    }

    public Double getEquipmentRiskScore() {
        return equipmentRiskScore;
    }

    public void setEquipmentRiskScore(
            Double equipmentRiskScore
    ) {
        this.equipmentRiskScore =
                equipmentRiskScore;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(
            String summary
    ) {
        this.summary = summary;
    }
}