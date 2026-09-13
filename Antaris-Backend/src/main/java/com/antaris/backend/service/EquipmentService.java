package com.antaris.backend.service;

import com.antaris.backend.dto.EquipmentResponse;
import com.antaris.backend.entity.Equipment;
import com.antaris.backend.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<EquipmentResponse> getEquipmentByStation(Long stationId) {

        return equipmentRepository
                .findByStationIdOrderByEquipmentNameAsc(stationId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public EquipmentResponse getEquipmentById(Long id) {

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Equipment not found with id: " + id
                        ));

        return convertToResponse(equipment);
    }

    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }

    private EquipmentResponse convertToResponse(Equipment equipment) {

        return new EquipmentResponse(
                equipment.getId(),
                equipment.getStation().getId(),
                equipment.getStation().getCode(),

                equipment.getEquipmentCode(),
                equipment.getEquipmentName(),
                equipment.getEquipmentType(),
                equipment.getStatus(),

                equipment.getHealthScore(),
                equipment.getLoadPercentage(),
                equipment.getTemperature(),
                equipment.getRuntimeHours(),

                equipment.getLastMaintenance(),
                equipment.getTimestamp()
        );
    }
}