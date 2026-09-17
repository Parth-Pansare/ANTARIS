package com.antaris.backend.ml.controller;

import com.antaris.backend.ml.dto.PredictionRecommendationResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import com.antaris.backend.ml.service.PredictionRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prediction-recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionRecommendationController {

    private final PredictionRecommendationService
            predictionRecommendationService;

    public PredictionRecommendationController(
            PredictionRecommendationService
                    predictionRecommendationService
    ) {
        this.predictionRecommendationService =
                predictionRecommendationService;
    }

    // ============================================================
    // GENERATE PREDICTION RECOMMENDATION
    // ============================================================

    @PostMapping
    public ResponseEntity<PredictionRecommendationResponse>
    generateRecommendation(
            @RequestBody PredictionRiskResponse risk
    ) {

        return ResponseEntity.ok(
                predictionRecommendationService
                        .generateRecommendation(risk)
        );
    }
}