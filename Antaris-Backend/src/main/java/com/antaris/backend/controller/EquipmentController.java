package com.antaris.backend.controller;

import com.antaris.backend.dto.EquipmentResponse;
import com.antaris.backend.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping("/{stationId}")
    public ResponseEntity<List<EquipmentResponse>> getEquipmentByStation(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                equipmentService.getEquipmentByStation(stationId)
        );
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<EquipmentResponse> getEquipmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                equipmentService.getEquipmentById(id)
        );
    }
}