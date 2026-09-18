package com.antaris.backend.simulation.entity;

import com.antaris.backend.entity.Station;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_scenarios")
public class SimulationScenarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private String scenarioName;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer horizonHours;

    @Column
    private Double temperatureChangeC;

    @Column
    private Double humidityChangePct;

    @Column
    private Double windResourceChange;

    @Column
    private Double generatorAvailabilityChangePct;

    @Column
    private Double fuelChangePct;

    @Column
    private Double batteryChangePct;

    @Column
    private Double consumptionChangePct;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public SimulationScenarioEntity() {
    }

    public Long getId() {
        return id;
    }

    public Station getStation() {
        return station;
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public String getDescription() {
        return description;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public Double getTemperatureChangeC() {
        return temperatureChangeC;
    }

    public Double getHumidityChangePct() {
        return humidityChangePct;
    }

    public Double getWindResourceChange() {
        return windResourceChange;
    }

    public Double getGeneratorAvailabilityChangePct() {
        return generatorAvailabilityChangePct;
    }

    public Double getFuelChangePct() {
        return fuelChangePct;
    }

    public Double getBatteryChangePct() {
        return batteryChangePct;
    }

    public Double getConsumptionChangePct() {
        return consumptionChangePct;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setStation(Station station) {
        this.station = station;
    }

    public void setScenarioName(String scenarioName) {
        this.scenarioName = scenarioName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }

    public void setTemperatureChangeC(Double temperatureChangeC) {
        this.temperatureChangeC = temperatureChangeC;
    }

    public void setHumidityChangePct(Double humidityChangePct) {
        this.humidityChangePct = humidityChangePct;
    }

    public void setWindResourceChange(Double windResourceChange) {
        this.windResourceChange = windResourceChange;
    }

    public void setGeneratorAvailabilityChangePct(
            Double generatorAvailabilityChangePct
    ) {
        this.generatorAvailabilityChangePct =
                generatorAvailabilityChangePct;
    }

    public void setFuelChangePct(Double fuelChangePct) {
        this.fuelChangePct = fuelChangePct;
    }

    public void setBatteryChangePct(Double batteryChangePct) {
        this.batteryChangePct = batteryChangePct;
    }

    public void setConsumptionChangePct(Double consumptionChangePct) {
        this.consumptionChangePct = consumptionChangePct;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}