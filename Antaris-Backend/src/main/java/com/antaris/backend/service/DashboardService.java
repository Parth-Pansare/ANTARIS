package com.antaris.backend.service;

import com.antaris.backend.dto.DashboardResponse;
import com.antaris.backend.dto.EnergyReadingResponse;
import com.antaris.backend.dto.EnvironmentReadingResponse;
import com.antaris.backend.dto.FuelReadingResponse;
import com.antaris.backend.dto.MaintenanceRecordResponse;
import com.antaris.backend.dto.AlertResponse;
import com.antaris.backend.dto.InventoryItemResponse;
import com.antaris.backend.dto.EquipmentResponse;
import com.antaris.backend.entity.Station;
import com.antaris.backend.repository.StationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DashboardService {

    private final StationRepository stationRepository;
    private final EnvironmentService environmentService;
    private final EnergyService energyService;
    private final FuelReadingService fuelReadingService;
    private final EquipmentService equipmentService;
    private final InventoryItemService inventoryItemService;
    private final AlertService alertService;
    private final MaintenanceService maintenanceService;

    public DashboardService(
            StationRepository stationRepository,
            EnvironmentService environmentService,
            EnergyService energyService,
            FuelReadingService fuelReadingService,
            EquipmentService equipmentService,
            InventoryItemService inventoryItemService,
            AlertService alertService,
            MaintenanceService maintenanceService) {

        this.stationRepository = stationRepository;
        this.environmentService = environmentService;
        this.energyService = energyService;
        this.fuelReadingService = fuelReadingService;
        this.equipmentService = equipmentService;
        this.inventoryItemService = inventoryItemService;
        this.alertService = alertService;
        this.maintenanceService = maintenanceService;
    }

    public DashboardResponse getDashboard(Long stationId) {

        Station station = stationRepository.findById(stationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Station not found with id: " + stationId
                        ));

        EnvironmentReadingResponse environment =
                environmentService.getLatestReading(stationId);

        EnergyReadingResponse energy =
                energyService.getLatestReading(stationId);

        FuelReadingResponse fuel =
                fuelReadingService.getLatestReading(stationId);

        List<EquipmentResponse> equipment =
                equipmentService.getEquipmentByStation(stationId);

        List<InventoryItemResponse> inventory =
                inventoryItemService.getItemsByStation(stationId);

        List<AlertResponse> alerts =
                alertService.getAlertsByStation(stationId);

        List<AlertResponse> activeAlerts =
                alertService.getUnacknowledgedAlerts(stationId);

        List<MaintenanceRecordResponse> maintenance =
                maintenanceService.getRecordsByStation(stationId);

        DashboardResponse response = new DashboardResponse();

        response.setStationId(station.getId());
        response.setStationCode(station.getCode());
        response.setStationName(station.getName());
        response.setStationLocation(station.getLocation());
        response.setStationStatus(station.getStatus());

        // =========================
        // ENVIRONMENT
        // =========================

        if (environment != null) {
            response.setEnvironment(
                    new DashboardResponse.EnvironmentSummary(
                            environment.getTemperature(),
                            environment.getHumidity(),
                            environment.getPressure(),
                            environment.getWindSpeed(),
                            environment.getWindDirection(),
                            environment.getTimestamp()
                    )
            );
        }

        // =========================
        // ENERGY
        // =========================

        if (energy != null) {
            response.setEnergy(
                    new DashboardResponse.EnergySummary(
                            energy.getTotalGeneration(),
                            energy.getTotalConsumption(),
                            energy.getPowerBalance(),
                            energy.getBatteryPercentage(),
                            energy.getGeneratorLoad(),
                            energy.getTimestamp()
                    )
            );
        }

        // =========================
        // FUEL
        // =========================

        if (fuel != null) {
            response.setFuel(
                    new DashboardResponse.FuelSummary(
                            fuel.getFuelLevel(),
                            fuel.getFuelCapacity(),
                            fuel.getFuelPercentage(),
                            fuel.getConsumptionRate(),
                            fuel.getEstimatedRuntimeHours(),
                            fuel.getDailyConsumption(),
                            fuel.getTimestamp()
                    )
            );
        }

        // =========================
        // EQUIPMENT
        // =========================

        response.setTotalEquipment(equipment.size());

        response.setOperationalEquipment(
                (int) equipment.stream()
                        .filter(item ->
                                "OPERATIONAL".equalsIgnoreCase(
                                        item.getStatus()))
                        .count()
        );

        response.setWarningEquipment(
                (int) equipment.stream()
                        .filter(item ->
                                "WARNING".equalsIgnoreCase(
                                        item.getStatus()))
                        .count()
        );

        // =========================
        // INVENTORY
        // =========================

        response.setTotalInventoryItems(inventory.size());

        response.setLowInventoryItems(
                (int) inventory.stream()
                        .filter(item ->
                                "LOW".equalsIgnoreCase(
                                        item.getStatus()))
                        .count()
        );

        response.setCriticalInventoryItems(
                (int) inventory.stream()
                        .filter(item ->
                                "CRITICAL".equalsIgnoreCase(
                                        item.getStatus()))
                        .count()
        );

        // =========================
        // ALERTS
        // =========================

        response.setTotalAlerts(alerts.size());
        response.setActiveAlerts(activeAlerts.size());

        // =========================
        // MAINTENANCE
        // =========================

        response.setScheduledMaintenance(
                (int) maintenance.stream()
                        .filter(item ->
                                "SCHEDULED".equalsIgnoreCase(
                                        item.getStatus()))
                        .count()
        );

        response.setInProgressMaintenance(
                (int) maintenance.stream()
                        .filter(item ->
                                "IN_PROGRESS".equalsIgnoreCase(
                                        item.getStatus()))
                        .count()
        );

        // =========================
        // LAST UPDATED
        // =========================

        response.setLastUpdated(LocalDateTime.now());

        return response;
    }
}