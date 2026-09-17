package com.antaris.backend.ml.controller;

import com.antaris.backend.dto.AlertResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import com.antaris.backend.ml.service.PredictiveAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predictive-alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictiveAlertController {

    private final PredictiveAlertService predictiveAlertService;

    public PredictiveAlertController(
            PredictiveAlertService predictiveAlertService
    ) {
        this.predictiveAlertService =
                predictiveAlertService;
    }

    // ============================================================
    // CREATE PREDICTIVE ALERT
    // ============================================================

    @PostMapping
    public ResponseEntity<AlertResponse> createPredictiveAlert(
            @RequestBody PredictionRiskResponse risk
    ) {

        AlertResponse alert =
                predictiveAlertService.createPredictiveAlert(
                        risk
                );

        /*
         * LOW and MEDIUM risks intentionally do not
         * generate alerts.
         */
        if (alert == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(alert);
    }
}