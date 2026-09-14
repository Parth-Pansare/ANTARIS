package com.antaris.backend.service;

import com.antaris.backend.dto.MaintenanceRecordResponse;
import com.antaris.backend.entity.MaintenanceRecord;
import com.antaris.backend.repository.MaintenanceRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;

    public MaintenanceService(
            MaintenanceRecordRepository maintenanceRecordRepository) {
        this.maintenanceRecordRepository = maintenanceRecordRepository;
    }

    public List<MaintenanceRecordResponse> getRecordsByStation(Long stationId) {

        return maintenanceRecordRepository
                .findByStationIdOrderByScheduledDateDesc(stationId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public MaintenanceRecordResponse getRecordById(Long id) {

        MaintenanceRecord record = maintenanceRecordRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Maintenance record not found with id: " + id
                        ));

        return convertToResponse(record);
    }

    public MaintenanceRecordResponse saveRecord(MaintenanceRecord record) {

        MaintenanceRecord savedRecord =
                maintenanceRecordRepository.save(record);

        return convertToResponse(savedRecord);
    }

    private MaintenanceRecordResponse convertToResponse(
            MaintenanceRecord record) {

        MaintenanceRecordResponse response =
                new MaintenanceRecordResponse();

        response.setId(record.getId());

        response.setStationId(record.getStation().getId());
        response.setStationCode(record.getStation().getCode());

        response.setEquipmentCode(record.getEquipmentCode());
        response.setEquipmentName(record.getEquipmentName());

        response.setMaintenanceType(record.getMaintenanceType());
        response.setStatus(record.getStatus());

        response.setDescription(record.getDescription());

        response.setScheduledDate(record.getScheduledDate());
        response.setCompletedDate(record.getCompletedDate());
        response.setCreatedAt(record.getCreatedAt());

        return response;
    }
}