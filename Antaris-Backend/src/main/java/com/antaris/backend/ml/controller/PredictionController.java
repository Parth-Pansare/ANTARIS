package com.antaris.backend.ml.controller;

import com.antaris.backend.ml.dto.PredictionHistoryResponse;
import com.antaris.backend.ml.dto.PredictionRequest;
import com.antaris.backend.ml.dto.PredictionResponse;
import com.antaris.backend.ml.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(
            PredictionService predictionService
    ) {
        this.predictionService = predictionService;
    }

    // ============================================================
    // ENERGY PREDICTION
    // ============================================================

    @PostMapping("/energy")
    public ResponseEntity<PredictionResponse> predictEnergy(
            @RequestBody PredictionRequest request
    ) {

        return ResponseEntity.ok(
                predictionService.predictEnergy(request)
        );
    }

    @PostMapping("/energy/current")
    public ResponseEntity<PredictionResponse> predictCurrentEnergy(
            @RequestParam(defaultValue = "1") int horizonHours
    ) {

        return ResponseEntity.ok(
                predictionService.predictCurrentEnergy(
                        horizonHours
                )
        );
    }

    @GetMapping("/energy/history/{stationId}")
    public ResponseEntity<List<PredictionHistoryResponse>>
    getEnergyPredictionHistory(
            @PathVariable Long stationId
    ) {

        return ResponseEntity.ok(
                predictionService
                        .getEnergyPredictionHistory(stationId)
        );
    }

    // ============================================================
    // FUEL PREDICTION
    // ============================================================

    @PostMapping("/fuel")
    public ResponseEntity<PredictionResponse> predictFuel(
            @RequestBody PredictionRequest request
    ) {

        return ResponseEntity.ok(
                predictionService.predictFuel(request)
        );
    }

    @PostMapping("/fuel/current")
    public ResponseEntity<PredictionResponse> predictCurrentFuel(
            @RequestParam(defaultValue = "1") int horizonHours
    ) {

        return ResponseEntity.ok(
                predictionService.predictCurrentFuel(
                        horizonHours
                )
        );
    }

    @GetMapping("/fuel/history/{stationId}")
    public ResponseEntity<List<PredictionHistoryResponse>>
    getFuelPredictionHistory(
            @PathVariable Long stationId
    ) {

        return ResponseEntity.ok(
                predictionService
                        .getFuelPredictionHistory(stationId)
        );
    }

    // ============================================================
    // ENVIRONMENT PREDICTION
    // ============================================================

    @PostMapping("/environment")
    public ResponseEntity<PredictionResponse> predictEnvironment(
            @RequestBody PredictionRequest request
    ) {

        return ResponseEntity.ok(
                predictionService.predictEnvironment(request)
        );
    }

    @PostMapping("/environment/current")
    public ResponseEntity<PredictionResponse> predictCurrentEnvironment(
            @RequestParam(defaultValue = "1") int horizonHours
    ) {

        return ResponseEntity.ok(
                predictionService.predictCurrentEnvironment(
                        horizonHours
                )
        );
    }

    @GetMapping("/environment/history/{stationId}")
    public ResponseEntity<List<PredictionHistoryResponse>>
    getEnvironmentPredictionHistory(
            @PathVariable Long stationId
    ) {

        return ResponseEntity.ok(
                predictionService
                        .getEnvironmentPredictionHistory(stationId)
        );
    }
}