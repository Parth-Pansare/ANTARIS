package com.antaris.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "energy_readings")
public class EnergyReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private Double solarGeneration;

    @Column(nullable = false)
    private Double windGeneration;

    @Column(nullable = false)
    private Double generatorGeneration;

    @Column(nullable = false)
    private Double totalConsumption;

    @Column(nullable = false)
    private Double batteryLevel;

    @Column(nullable = false)
    private Double batteryPercentage;

    @Column(nullable = false)
    private Double generatorLoad;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public EnergyReading() {
    }

    public EnergyReading(
            Station station,
            Double solarGeneration,
            Double windGeneration,
            Double generatorGeneration,
            Double totalConsumption,
            Double batteryLevel,
            Double batteryPercentage,
            Double generatorLoad,
            LocalDateTime timestamp
    ) {
        this.station = station;
        this.solarGeneration = solarGeneration;
        this.windGeneration = windGeneration;
        this.generatorGeneration = generatorGeneration;
        this.totalConsumption = totalConsumption;
        this.batteryLevel = batteryLevel;
        this.batteryPercentage = batteryPercentage;
        this.generatorLoad = generatorLoad;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public Station getStation() {
        return station;
    }

    public void setStation(Station station) {
        this.station = station;
    }

    public Double getSolarGeneration() {
        return solarGeneration;
    }

    public void setSolarGeneration(Double solarGeneration) {
        this.solarGeneration = solarGeneration;
    }

    public Double getWindGeneration() {
        return windGeneration;
    }

    public void setWindGeneration(Double windGeneration) {
        this.windGeneration = windGeneration;
    }

    public Double getGeneratorGeneration() {
        return generatorGeneration;
    }

    public void setGeneratorGeneration(Double generatorGeneration) {
        this.generatorGeneration = generatorGeneration;
    }

    public Double getTotalConsumption() {
        return totalConsumption;
    }

    public void setTotalConsumption(Double totalConsumption) {
        this.totalConsumption = totalConsumption;
    }

    public Double getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(Double batteryLevel) {
        this.batteryLevel = batteryLevel;
    }

    public Double getBatteryPercentage() {
        return batteryPercentage;
    }

    public void setBatteryPercentage(Double batteryPercentage) {
        this.batteryPercentage = batteryPercentage;
    }

    public Double getGeneratorLoad() {
        return generatorLoad;
    }

    public void setGeneratorLoad(Double generatorLoad) {
        this.generatorLoad = generatorLoad;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}