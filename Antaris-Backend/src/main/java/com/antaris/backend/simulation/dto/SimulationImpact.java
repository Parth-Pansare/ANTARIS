package com.antaris.backend.simulation.dto;

public class SimulationImpact {

    private Double temperatureDeltaC;
    private Double energyConsumptionDeltaKw;
    private Double generatorLoadDeltaPct;
    private Double fuelConsumptionDeltaLph;
    private Double fuelPercentageDelta;
    private Double batteryPercentageDelta;

    public SimulationImpact() {
    }

    public Double getTemperatureDeltaC() {
        return temperatureDeltaC;
    }

    public void setTemperatureDeltaC(Double temperatureDeltaC) {
        this.temperatureDeltaC = temperatureDeltaC;
    }

    public Double getEnergyConsumptionDeltaKw() {
        return energyConsumptionDeltaKw;
    }

    public void setEnergyConsumptionDeltaKw(
            Double energyConsumptionDeltaKw
    ) {
        this.energyConsumptionDeltaKw =
                energyConsumptionDeltaKw;
    }

    public Double getGeneratorLoadDeltaPct() {
        return generatorLoadDeltaPct;
    }

    public void setGeneratorLoadDeltaPct(
            Double generatorLoadDeltaPct
    ) {
        this.generatorLoadDeltaPct =
                generatorLoadDeltaPct;
    }

    public Double getFuelConsumptionDeltaLph() {
        return fuelConsumptionDeltaLph;
    }

    public void setFuelConsumptionDeltaLph(
            Double fuelConsumptionDeltaLph
    ) {
        this.fuelConsumptionDeltaLph =
                fuelConsumptionDeltaLph;
    }

    public Double getFuelPercentageDelta() {
        return fuelPercentageDelta;
    }

    public void setFuelPercentageDelta(
            Double fuelPercentageDelta
    ) {
        this.fuelPercentageDelta =
                fuelPercentageDelta;
    }

    public Double getBatteryPercentageDelta() {
        return batteryPercentageDelta;
    }

    public void setBatteryPercentageDelta(
            Double batteryPercentageDelta
    ) {
        this.batteryPercentageDelta =
                batteryPercentageDelta;
    }
}