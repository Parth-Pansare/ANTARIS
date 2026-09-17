package com.antaris.backend.ml.service;

import com.antaris.backend.entity.ModelVersion;
import com.antaris.backend.repository.ModelVersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ModelVersionService {

    private final ModelVersionRepository modelVersionRepository;

    public ModelVersionService(
            ModelVersionRepository modelVersionRepository
    ) {
        this.modelVersionRepository = modelVersionRepository;
    }

    // ============================================================
    // REGISTER MODEL VERSION
    // ============================================================

    @Transactional
    public ModelVersion registerModelVersion(
            String modelType,
            String version,
            String provider
    ) {

        if (modelType == null || modelType.isBlank()) {
            throw new IllegalArgumentException(
                    "Model type is required"
            );
        }

        if (version == null || version.isBlank()) {
            throw new IllegalArgumentException(
                    "Model version is required"
            );
        }

        if (provider == null || provider.isBlank()) {
            throw new IllegalArgumentException(
                    "Model provider is required"
            );
        }

        return modelVersionRepository
                .findByModelTypeAndVersion(
                        modelType,
                        version
                )
                .orElseGet(() -> {

                    ModelVersion modelVersion =
                            new ModelVersion();

                    modelVersion.setModelType(modelType);
                    modelVersion.setVersion(version);
                    modelVersion.setProvider(provider);
                    modelVersion.setActive(true);
                    modelVersion.setCreatedAt(
                            LocalDateTime.now()
                    );

                    return modelVersionRepository.save(
                            modelVersion
                    );
                });
    }

    // ============================================================
    // GET MODEL VERSION
    // ============================================================

    public ModelVersion getModelVersion(
            String modelType,
            String version
    ) {

        return modelVersionRepository
                .findByModelTypeAndVersion(
                        modelType,
                        version
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Model version not found: "
                                        + modelType
                                        + " / "
                                        + version
                        )
                );
    }

    // ============================================================
    // GET ALL VERSIONS FOR MODEL TYPE
    // ============================================================

    public List<ModelVersion> getModelVersions(
            String modelType
    ) {

        if (modelType == null || modelType.isBlank()) {
            throw new IllegalArgumentException(
                    "Model type is required"
            );
        }

        return modelVersionRepository
                .findByModelTypeOrderByCreatedAtDesc(
                        modelType
                );
    }

    // ============================================================
    // GET ACTIVE MODEL VERSIONS
    // ============================================================

    public List<ModelVersion> getActiveModelVersions(
            String modelType
    ) {

        if (modelType == null || modelType.isBlank()) {
            throw new IllegalArgumentException(
                    "Model type is required"
            );
        }

        return modelVersionRepository
                .findByModelTypeAndActiveTrue(
                        modelType
                );
    }

    // ============================================================
    // ACTIVATE MODEL VERSION
    // ============================================================

    @Transactional
    public ModelVersion activateModelVersion(
            Long modelVersionId
    ) {

        if (modelVersionId == null
                || modelVersionId <= 0) {

            throw new IllegalArgumentException(
                    "Model version ID must be greater than zero"
            );
        }

        ModelVersion selectedModel =
                modelVersionRepository
                        .findById(modelVersionId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Model version not found with ID: "
                                                + modelVersionId
                                )
                        );

        List<ModelVersion> existingActiveModels =
                modelVersionRepository
                        .findByModelTypeAndActiveTrue(
                                selectedModel.getModelType()
                        );

        for (ModelVersion model :
                existingActiveModels) {

            if (!model.getId().equals(
                    selectedModel.getId()
            )) {
                model.setActive(false);
                modelVersionRepository.save(model);
            }
        }

        selectedModel.setActive(true);

        return modelVersionRepository.save(
                selectedModel
        );
    }

    // ============================================================
    // DEACTIVATE MODEL VERSION
    // ============================================================

    @Transactional
    public ModelVersion deactivateModelVersion(
            Long modelVersionId
    ) {

        if (modelVersionId == null
                || modelVersionId <= 0) {

            throw new IllegalArgumentException(
                    "Model version ID must be greater than zero"
            );
        }

        ModelVersion modelVersion =
                modelVersionRepository
                        .findById(modelVersionId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Model version not found with ID: "
                                                + modelVersionId
                                )
                        );

        modelVersion.setActive(false);

        return modelVersionRepository.save(
                modelVersion
        );
    }
}