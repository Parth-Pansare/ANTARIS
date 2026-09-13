package com.antaris.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_readings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FuelReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private Double fuelLevel;

    @Column(nullable = false)
    private Double fuelCapacity;

    @Column(nullable = false)
    private Double fuelPercentage;

    @Column(nullable = false)
    private Double consumptionRate;

    @Column(nullable = false)
    private Double estimatedRuntimeHours;

    @Column(nullable = false)
    private Double dailyConsumption;

    @Column(nullable = false)
    private LocalDateTime lastRefill;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}