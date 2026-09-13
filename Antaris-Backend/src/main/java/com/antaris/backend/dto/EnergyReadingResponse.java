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
public class EnergyReadingResponse {

    private Long id;
    private Long stationId;
    private String stationCode;

    private Double solarGeneration;
    private Double windGeneration;
    private Double generatorGeneration;

    private Double totalGeneration;
    private Double totalConsumption;
    private Double powerBalance;

    private Double batteryLevel;
    private Double batteryPercentage;
    private Double generatorLoad;

    private LocalDateTime timestamp;
}