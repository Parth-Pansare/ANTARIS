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
public class MaintenanceRecordResponse {

    private Long id;

    private Long stationId;
    private String stationCode;

    private String equipmentCode;
    private String equipmentName;

    private String maintenanceType;
    private String status;

    private String description;

    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;
    private LocalDateTime createdAt;
}