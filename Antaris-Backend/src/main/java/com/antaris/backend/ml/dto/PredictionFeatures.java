package com.antaris.backend.ml.dto;

public class PredictionFeatures {

    private Double temperatureC;
    private Double humidityPct;
    private Double windResourceIndex;
    private Double batteryPercentage;
    private Double fuelPercentage;
    private Double generatorLoadPct;
    private Double totalConsumptionKw;

    public PredictionFeatures() {
    }

    public Double getTemperatureC() {
        return temperatureC;
    }

    public void setTemperatureC(Double temperatureC) {
        this.temperatureC = temperatureC;
    }

    public Double getHumidityPct() {
        return humidityPct;
    }

    public void setHumidityPct(Double humidityPct) {
        this.humidityPct = humidityPct;
    }

    public Double getWindResourceIndex() {
        return windResourceIndex;
    }

    public void setWindResourceIndex(Double windResourceIndex) {
        this.windResourceIndex = windResourceIndex;
    }

    public Double getBatteryPercentage() {
        return batteryPercentage;
    }

    public void setBatteryPercentage(Double batteryPercentage) {
        this.batteryPercentage = batteryPercentage;
    }

    public Double getFuelPercentage() {
        return fuelPercentage;
    }

    public void setFuelPercentage(Double fuelPercentage) {
        this.fuelPercentage = fuelPercentage;
    }

    public Double getGeneratorLoadPct() {
        return generatorLoadPct;
    }

    public void setGeneratorLoadPct(Double generatorLoadPct) {
        this.generatorLoadPct = generatorLoadPct;
    }

    public Double getTotalConsumptionKw() {
        return totalConsumptionKw;
    }

    public void setTotalConsumptionKw(Double totalConsumptionKw) {
        this.totalConsumptionKw = totalConsumptionKw;
    }
}