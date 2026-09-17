package com.antaris.backend.ml.controller;

import com.antaris.backend.ml.dto.FutureHealthScoreResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import com.antaris.backend.ml.service.FutureHealthScoreService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/future-health")
@CrossOrigin(origins = "http://localhost:5173")
public class FutureHealthScoreController {

    private final FutureHealthScoreService futureHealthScoreService;

    public FutureHealthScoreController(
            FutureHealthScoreService futureHealthScoreService
    ) {
        this.futureHealthScoreService =
                futureHealthScoreService;
    }

    // ============================================================
    // CALCULATE FUTURE HEALTH SCORE
    // ============================================================

    @PostMapping
    public ResponseEntity<FutureHealthScoreResponse>
    calculateFutureHealthScore(
            @RequestBody FutureHealthScoreRequest request
    ) {

        FutureHealthScoreResponse response =
                futureHealthScoreService
                        .calculateFutureHealthScore(
                                request.getEnergyRisk(),
                                request.getFuelRisk(),
                                request.getEnvironmentRisk(),
                                request.getEquipmentRisk()
                        );

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // REQUEST DTO
    // ============================================================

    public static class FutureHealthScoreRequest {

        private PredictionRiskResponse energyRisk;
        private PredictionRiskResponse fuelRisk;
        private PredictionRiskResponse environmentRisk;
        private PredictionRiskResponse equipmentRisk;

        public FutureHealthScoreRequest() {
        }

        public PredictionRiskResponse getEnergyRisk() {
            return energyRisk;
        }

        public void setEnergyRisk(
                PredictionRiskResponse energyRisk
        ) {
            this.energyRisk = energyRisk;
        }

        public PredictionRiskResponse getFuelRisk() {
            return fuelRisk;
        }

        public void setFuelRisk(
                PredictionRiskResponse fuelRisk
        ) {
            this.fuelRisk = fuelRisk;
        }

        public PredictionRiskResponse getEnvironmentRisk() {
            return environmentRisk;
        }

        public void setEnvironmentRisk(
                PredictionRiskResponse environmentRisk
        ) {
            this.environmentRisk = environmentRisk;
        }

        public PredictionRiskResponse getEquipmentRisk() {
            return equipmentRisk;
        }

        public void setEquipmentRisk(
                PredictionRiskResponse equipmentRisk
        ) {
            this.equipmentRisk = equipmentRisk;
        }
    }
}