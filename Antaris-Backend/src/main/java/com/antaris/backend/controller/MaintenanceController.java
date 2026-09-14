package com.antaris.backend.controller;

import com.antaris.backend.dto.MaintenanceRecordResponse;
import com.antaris.backend.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(
            MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/{stationId}")
    public ResponseEntity<List<MaintenanceRecordResponse>> getRecordsByStation(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                maintenanceService.getRecordsByStation(stationId)
        );
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<MaintenanceRecordResponse> getRecordById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                maintenanceService.getRecordById(id)
        );
    }
}