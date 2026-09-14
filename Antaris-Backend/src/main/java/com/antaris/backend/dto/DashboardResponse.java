package com.antaris.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private Long stationId;
    private String stationCode;
    private String stationName;
    private String stationLocation;
    private String stationStatus;

    private EnvironmentSummary environment;
    private EnergySummary energy;
    private FuelSummary fuel;

    private Integer totalEquipment;
    private Integer operationalEquipment;
    private Integer warningEquipment;

    private Integer totalInventoryItems;
    private Integer lowInventoryItems;
    private Integer criticalInventoryItems;

    private Integer totalAlerts;
    private Integer activeAlerts;

    private Integer scheduledMaintenance;
    private Integer inProgressMaintenance;

    private LocalDateTime lastUpdated;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnvironmentSummary {

        private Double temperature;
        private Double humidity;
        private Double pressure;
        private Double windSpeed;
        private Double windDirection;
        private LocalDateTime timestamp;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnergySummary {

        private Double totalGeneration;
        private Double totalConsumption;
        private Double powerBalance;
        private Double batteryPercentage;
        private Double generatorLoad;
        private LocalDateTime timestamp;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FuelSummary {

        private Double fuelLevel;
        private Double fuelCapacity;
        private Double fuelPercentage;
        private Double consumptionRate;
        private Double estimatedRuntimeHours;
        private Double dailyConsumption;
        private LocalDateTime timestamp;
    }
}