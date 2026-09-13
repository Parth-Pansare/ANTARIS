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
public class EquipmentResponse {

    private Long id;
    private Long stationId;
    private String stationCode;

    private String equipmentCode;
    private String equipmentName;
    private String equipmentType;
    private String status;

    private Double healthScore;
    private Double loadPercentage;
    private Double temperature;
    private Double runtimeHours;

    private LocalDateTime lastMaintenance;
    private LocalDateTime timestamp;
}