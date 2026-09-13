package com.antaris.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FuelReadingResponse {

    private Long id;
    private Long stationId;
    private String stationCode;

    private Double fuelLevel;
    private Double fuelCapacity;
    private Double fuelPercentage;
    private Double consumptionRate;
    private Double estimatedRuntimeHours;
    private Double dailyConsumption;

    private LocalDateTime lastRefill;
    private LocalDateTime timestamp;
}