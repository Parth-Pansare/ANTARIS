package com.antaris.backend.ml.controller;

import com.antaris.backend.ml.dto.PredictionRiskResponse;
import com.antaris.backend.ml.dto.PredictionStationComparisonResponse;
import com.antaris.backend.ml.service.PredictionStationComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prediction-comparison")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionStationComparisonController {

    private final PredictionStationComparisonService
            comparisonService;

    public PredictionStationComparisonController(
            PredictionStationComparisonService comparisonService
    ) {
        this.comparisonService =
                comparisonService;
    }

    // ============================================================
    // COMPARE TWO STATIONS
    // ============================================================

    @PostMapping
    public ResponseEntity<PredictionStationComparisonResponse>
    compareStations(
            @RequestBody PredictionStationComparisonRequest request
    ) {

        PredictionStationComparisonResponse response =
                comparisonService.compareStations(

                        // MAITRI
                        request.getMaitriEnergyRisk(),
                        request.getMaitriFuelRisk(),
                        request.getMaitriEnvironmentRisk(),
                        request.getMaitriEquipmentRisk(),

                        // BHARATI
                        request.getBharatiEnergyRisk(),
                        request.getBharatiFuelRisk(),
                        request.getBharatiEnvironmentRisk(),
                        request.getBharatiEquipmentRisk()
                );

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // REQUEST DTO
    // ============================================================

    public static class PredictionStationComparisonRequest {

        private PredictionRiskResponse maitriEnergyRisk;
        private PredictionRiskResponse maitriFuelRisk;
        private PredictionRiskResponse maitriEnvironmentRisk;
        private PredictionRiskResponse maitriEquipmentRisk;

        private PredictionRiskResponse bharatiEnergyRisk;
        private PredictionRiskResponse bharatiFuelRisk;
        private PredictionRiskResponse bharatiEnvironmentRisk;
        private PredictionRiskResponse bharatiEquipmentRisk;

        public PredictionStationComparisonRequest() {
        }

        public PredictionRiskResponse getMaitriEnergyRisk() {
            return maitriEnergyRisk;
        }

        public void setMaitriEnergyRisk(
                PredictionRiskResponse maitriEnergyRisk
        ) {
            this.maitriEnergyRisk = maitriEnergyRisk;
        }

        public PredictionRiskResponse getMaitriFuelRisk() {
            return maitriFuelRisk;
        }

        public void setMaitriFuelRisk(
                PredictionRiskResponse maitriFuelRisk
        ) {
            this.maitriFuelRisk = maitriFuelRisk;
        }

        public PredictionRiskResponse getMaitriEnvironmentRisk() {
            return maitriEnvironmentRisk;
        }

        public void setMaitriEnvironmentRisk(
                PredictionRiskResponse maitriEnvironmentRisk
        ) {
            this.maitriEnvironmentRisk =
                    maitriEnvironmentRisk;
        }

        public PredictionRiskResponse getMaitriEquipmentRisk() {
            return maitriEquipmentRisk;
        }

        public void setMaitriEquipmentRisk(
                PredictionRiskResponse maitriEquipmentRisk
        ) {
            this.maitriEquipmentRisk =
                    maitriEquipmentRisk;
        }

        public PredictionRiskResponse getBharatiEnergyRisk() {
            return bharatiEnergyRisk;
        }

        public void setBharatiEnergyRisk(
                PredictionRiskResponse bharatiEnergyRisk
        ) {
            this.bharatiEnergyRisk =
                    bharatiEnergyRisk;
        }

        public PredictionRiskResponse getBharatiFuelRisk() {
            return bharatiFuelRisk;
        }

        public void setBharatiFuelRisk(
                PredictionRiskResponse bharatiFuelRisk
        ) {
            this.bharatiFuelRisk =
                    bharatiFuelRisk;
        }

        public PredictionRiskResponse getBharatiEnvironmentRisk() {
            return bharatiEnvironmentRisk;
        }

        public void setBharatiEnvironmentRisk(
                PredictionRiskResponse bharatiEnvironmentRisk
        ) {
            this.bharatiEnvironmentRisk =
                    bharatiEnvironmentRisk;
        }

        public PredictionRiskResponse getBharatiEquipmentRisk() {
            return bharatiEquipmentRisk;
        }

        public void setBharatiEquipmentRisk(
                PredictionRiskResponse bharatiEquipmentRisk
        ) {
            this.bharatiEquipmentRisk =
                    bharatiEquipmentRisk;
        }
    }
}