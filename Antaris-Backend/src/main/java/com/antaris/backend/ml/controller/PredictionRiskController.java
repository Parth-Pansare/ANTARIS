package com.antaris.backend.ml.controller;

import com.antaris.backend.ml.dto.PredictionResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import com.antaris.backend.ml.service.PredictionRiskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prediction-risk")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionRiskController {

    private final PredictionRiskService predictionRiskService;

    public PredictionRiskController(
            PredictionRiskService predictionRiskService
    ) {
        this.predictionRiskService =
                predictionRiskService;
    }

    // ============================================================
    // EVALUATE PREDICTION RISK
    // ============================================================

    @PostMapping
    public ResponseEntity<PredictionRiskResponse> evaluateRisk(
            @RequestBody PredictionResponse prediction
    ) {

        return ResponseEntity.ok(
                predictionRiskService.evaluateRisk(
                        prediction
                )
        );
    }
}