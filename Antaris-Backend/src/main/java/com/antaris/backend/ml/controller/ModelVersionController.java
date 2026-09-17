package com.antaris.backend.ml.controller;

import com.antaris.backend.entity.ModelVersion;
import com.antaris.backend.ml.service.ModelVersionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/model-versions")
@CrossOrigin(origins = "http://localhost:5173")
public class ModelVersionController {

    private final ModelVersionService modelVersionService;

    public ModelVersionController(
            ModelVersionService modelVersionService
    ) {
        this.modelVersionService = modelVersionService;
    }

    // ============================================================
    // GET ALL MODEL VERSIONS FOR A MODEL TYPE
    // ============================================================

    @GetMapping("/{modelType}")
    public ResponseEntity<List<ModelVersion>> getModelVersions(
            @PathVariable String modelType
    ) {

        return ResponseEntity.ok(
                modelVersionService.getModelVersions(
                        modelType
                )
        );
    }

    // ============================================================
    // GET ACTIVE MODEL VERSIONS
    // ============================================================

    @GetMapping("/{modelType}/active")
    public ResponseEntity<List<ModelVersion>> getActiveModelVersions(
            @PathVariable String modelType
    ) {

        return ResponseEntity.ok(
                modelVersionService.getActiveModelVersions(
                        modelType
                )
        );
    }

    // ============================================================
    // GET SPECIFIC MODEL VERSION
    // ============================================================

    @GetMapping("/{modelType}/{version}")
    public ResponseEntity<ModelVersion> getModelVersion(
            @PathVariable String modelType,
            @PathVariable String version
    ) {

        return ResponseEntity.ok(
                modelVersionService.getModelVersion(
                        modelType,
                        version
                )
        );
    }

    // ============================================================
    // ACTIVATE MODEL VERSION
    // ============================================================

    @PutMapping("/{id}/activate")
    public ResponseEntity<ModelVersion> activateModelVersion(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                modelVersionService.activateModelVersion(id)
        );
    }

    // ============================================================
    // DEACTIVATE MODEL VERSION
    // ============================================================

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ModelVersion> deactivateModelVersion(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                modelVersionService.deactivateModelVersion(id)
        );
    }
}