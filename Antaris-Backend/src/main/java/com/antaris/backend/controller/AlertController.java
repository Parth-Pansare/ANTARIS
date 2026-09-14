package com.antaris.backend.controller;

import com.antaris.backend.dto.AlertResponse;
import com.antaris.backend.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/{stationId}")
    public ResponseEntity<List<AlertResponse>> getAlertsByStation(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                alertService.getAlertsByStation(stationId)
        );
    }

    @GetMapping("/{stationId}/active")
    public ResponseEntity<List<AlertResponse>> getActiveAlerts(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                alertService.getUnacknowledgedAlerts(stationId)
        );
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<AlertResponse> getAlertById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                alertService.getAlertById(id)
        );
    }

    @PutMapping("/item/{id}/acknowledge")
    public ResponseEntity<AlertResponse> acknowledgeAlert(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                alertService.acknowledgeAlert(id)
        );
    }
}