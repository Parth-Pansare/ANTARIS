package com.antaris.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private String predictionType;

    @Column(nullable = false)
    private Double predictedValue;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private Integer horizonHours;

    @Column(nullable = false)
    private String modelVersion;

    @Column(nullable = false)
    private LocalDateTime predictionTimestamp;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Prediction() {
    }

    public Prediction(
            Long id,
            Station station,
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

    public Station getStation() {
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

    public void setStation(Station station) {
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

    public void setPredictionTimestamp(LocalDateTime predictionTimestamp) {
        this.predictionTimestamp = predictionTimestamp;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}