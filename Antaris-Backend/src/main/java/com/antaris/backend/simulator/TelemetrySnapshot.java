package com.antaris.backend.simulator;

import java.time.LocalDateTime;

public class TelemetrySnapshot {

    private LocalDateTime timestamp;

    private String stationCode;

    // Environment
    private Double temperatureC;
    private Double airPressureHpa;
    private Double humidityPct;
    private Double windSpeed;
    private Double windDirectionDeg;
    private Double windResourceIndex;

    // Energy
    private Double solarGenerationKw;
    private Double windGenerationKw;
    private Double generatorGenerationKw;
    private Double totalGenerationKw;
    private Double totalConsumptionKw;
    private Double powerBalanceKw;
    private Double batteryLevelKwh;
    private Double batteryPercentage;
    private Double generatorLoadPct;

    // Fuel
    private Double fuelLevelL;
    private Double fuelCapacityL;
    private Double fuelPercentage;
    private Double fuelConsumptionRateLph;
    private Double estimatedRuntimeHours;

    public TelemetrySnapshot() {
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getStationCode() {
        return stationCode;
    }

    public void setStationCode(String stationCode) {
        this.stationCode = stationCode;
    }

    public Double getTemperatureC() {
        return temperatureC;
    }

    public void setTemperatureC(Double temperatureC) {
        this.temperatureC = temperatureC;
    }

    public Double getAirPressureHpa() {
        return airPressureHpa;
    }

    public void setAirPressureHpa(Double airPressureHpa) {
        this.airPressureHpa = airPressureHpa;
    }

    public Double getHumidityPct() {
        return humidityPct;
    }

    public void setHumidityPct(Double humidityPct) {
        this.humidityPct = humidityPct;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    public Double getWindDirectionDeg() {
        return windDirectionDeg;
    }

    public void setWindDirectionDeg(Double windDirectionDeg) {
        this.windDirectionDeg = windDirectionDeg;
    }

    public Double getWindResourceIndex() {
        return windResourceIndex;
    }

    public void setWindResourceIndex(Double windResourceIndex) {
        this.windResourceIndex = windResourceIndex;
    }

    public Double getSolarGenerationKw() {
        return solarGenerationKw;
    }

    public void setSolarGenerationKw(Double solarGenerationKw) {
        this.solarGenerationKw = solarGenerationKw;
    }

    public Double getWindGenerationKw() {
        return windGenerationKw;
    }

    public void setWindGenerationKw(Double windGenerationKw) {
        this.windGenerationKw = windGenerationKw;
    }

    public Double getGeneratorGenerationKw() {
        return generatorGenerationKw;
    }

    public void setGeneratorGenerationKw(Double generatorGenerationKw) {
        this.generatorGenerationKw = generatorGenerationKw;
    }

    public Double getTotalGenerationKw() {
        return totalGenerationKw;
    }

    public void setTotalGenerationKw(Double totalGenerationKw) {
        this.totalGenerationKw = totalGenerationKw;
    }

    public Double getTotalConsumptionKw() {
        return totalConsumptionKw;
    }

    public void setTotalConsumptionKw(Double totalConsumptionKw) {
        this.totalConsumptionKw = totalConsumptionKw;
    }

    public Double getPowerBalanceKw() {
        return powerBalanceKw;
    }

    public void setPowerBalanceKw(Double powerBalanceKw) {
        this.powerBalanceKw = powerBalanceKw;
    }

    public Double getBatteryLevelKwh() {
        return batteryLevelKwh;
    }

    public void setBatteryLevelKwh(Double batteryLevelKwh) {
        this.batteryLevelKwh = batteryLevelKwh;
    }

    public Double getBatteryPercentage() {
        return batteryPercentage;
    }

    public void setBatteryPercentage(Double batteryPercentage) {
        this.batteryPercentage = batteryPercentage;
    }

    public Double getGeneratorLoadPct() {
        return generatorLoadPct;
    }

    public void setGeneratorLoadPct(Double generatorLoadPct) {
        this.generatorLoadPct = generatorLoadPct;
    }

    public Double getFuelLevelL() {
        return fuelLevelL;
    }

    public void setFuelLevelL(Double fuelLevelL) {
        this.fuelLevelL = fuelLevelL;
    }

    public Double getFuelCapacityL() {
        return fuelCapacityL;
    }

    public void setFuelCapacityL(Double fuelCapacityL) {
        this.fuelCapacityL = fuelCapacityL;
    }

    public Double getFuelPercentage() {
        return fuelPercentage;
    }

    public void setFuelPercentage(Double fuelPercentage) {
        this.fuelPercentage = fuelPercentage;
    }

    public Double getFuelConsumptionRateLph() {
        return fuelConsumptionRateLph;
    }

    public void setFuelConsumptionRateLph(Double fuelConsumptionRateLph) {
        this.fuelConsumptionRateLph = fuelConsumptionRateLph;
    }

    public Double getEstimatedRuntimeHours() {
        return estimatedRuntimeHours;
    }

    public void setEstimatedRuntimeHours(Double estimatedRuntimeHours) {
        this.estimatedRuntimeHours = estimatedRuntimeHours;
    }
}