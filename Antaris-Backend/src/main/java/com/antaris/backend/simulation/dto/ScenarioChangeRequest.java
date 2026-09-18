package com.antaris.backend.simulation.dto;

public class ScenarioChangeRequest {

    private Double temperatureChangeC;
    private Double humidityChangePct;
    private Double windResourceChange;
    private Double generatorAvailabilityChangePct;
    private Double fuelChangePct;
    private Double batteryChangePct;
    private Double consumptionChangePct;

    public ScenarioChangeRequest() {
    }

    public Double getTemperatureChangeC() {
        return temperatureChangeC;
    }

    public void setTemperatureChangeC(Double temperatureChangeC) {
        this.temperatureChangeC = temperatureChangeC;
    }

    public Double getHumidityChangePct() {
        return humidityChangePct;
    }

    public void setHumidityChangePct(Double humidityChangePct) {
        this.humidityChangePct = humidityChangePct;
    }

    public Double getWindResourceChange() {
        return windResourceChange;
    }

    public void setWindResourceChange(Double windResourceChange) {
        this.windResourceChange = windResourceChange;
    }

    public Double getGeneratorAvailabilityChangePct() {
        return generatorAvailabilityChangePct;
    }

    public void setGeneratorAvailabilityChangePct(
            Double generatorAvailabilityChangePct
    ) {
        this.generatorAvailabilityChangePct =
                generatorAvailabilityChangePct;
    }

    public Double getFuelChangePct() {
        return fuelChangePct;
    }

    public void setFuelChangePct(Double fuelChangePct) {
        this.fuelChangePct = fuelChangePct;
    }

    public Double getBatteryChangePct() {
        return batteryChangePct;
    }

    public void setBatteryChangePct(Double batteryChangePct) {
        this.batteryChangePct = batteryChangePct;
    }

    public Double getConsumptionChangePct() {
        return consumptionChangePct;
    }

    public void setConsumptionChangePct(Double consumptionChangePct) {
        this.consumptionChangePct = consumptionChangePct;
    }
}