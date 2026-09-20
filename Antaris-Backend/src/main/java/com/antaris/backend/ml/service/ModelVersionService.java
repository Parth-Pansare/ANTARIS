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

    /**
     * Registers or re-registers a model version.
     *
     * Model-version invariant:
     * For every model type, exactly one version is active after
     * registration.
     *
     * If the version already exists, it becomes the active version
     * and all other versions of the same model type are deactivated.
     *
     * If the version is new, all existing active versions of the
     * same model type are deactivated before the new version is
     * created as active.
     */
    @Transactional
    public ModelVersion registerModelVersion(
            String modelType,
            String version,
            String provider
    ) {

        validateModelDetails(
                modelType,
                version,
                provider
        );

        ModelVersion modelVersion =
                modelVersionRepository
                        .findByModelTypeAndVersion(
                                modelType,
                                version
                        )
                        .orElse(null);

        // --------------------------------------------------------
        // Existing model version
        // --------------------------------------------------------

        if (modelVersion != null) {

            deactivateOtherActiveVersions(
                    modelType,
                    modelVersion.getId()
            );

            modelVersion.setProvider(provider);
            modelVersion.setActive(true);

            return modelVersionRepository.save(
                    modelVersion
            );
        }

        // --------------------------------------------------------
        // New model version
        // --------------------------------------------------------

        deactivateOtherActiveVersions(
                modelType,
                null
        );

        modelVersion = new ModelVersion();

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
    }

    // ============================================================
    // GET MODEL VERSION
    // ============================================================

    public ModelVersion getModelVersion(
            String modelType,
            String version
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

        validateModelType(modelType);

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

        validateModelType(modelType);

        return modelVersionRepository
                .findByModelTypeAndActiveTrue(
                        modelType
                );
    }

    // ============================================================
    // ACTIVATE MODEL VERSION
    // ============================================================

    /**
     * Activates exactly one model version for its model type.
     *
     * All other active versions belonging to the same model type
     * are first deactivated.
     */
    @Transactional
    public ModelVersion activateModelVersion(
            Long modelVersionId
    ) {

        validateModelVersionId(modelVersionId);

        ModelVersion selectedModel =
                modelVersionRepository
                        .findById(modelVersionId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Model version not found with ID: "
                                                + modelVersionId
                                )
                        );

        deactivateOtherActiveVersions(
                selectedModel.getModelType(),
                selectedModel.getId()
        );

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

        validateModelVersionId(modelVersionId);

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

    // ============================================================
    // INTERNAL HELPERS
    // ============================================================

    /**
     * Deactivates every currently active version of the specified
     * model type except the supplied version ID.
     *
     * A null excluded ID means that all currently active versions
     * should be deactivated.
     */
    private void deactivateOtherActiveVersions(
            String modelType,
            Long excludedModelVersionId
    ) {

        List<ModelVersion> existingActiveModels =
                modelVersionRepository
                        .findByModelTypeAndActiveTrue(
                                modelType
                        );

        for (ModelVersion model :
                existingActiveModels) {

            if (excludedModelVersionId != null
                    && excludedModelVersionId.equals(
                    model.getId()
            )) {
                continue;
            }

            if (Boolean.TRUE.equals(
                    model.getActive()
            )) {

                model.setActive(false);

                modelVersionRepository.save(
                        model
                );
            }
        }
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateModelDetails(
            String modelType,
            String version,
            String provider
    ) {

        validateModelType(modelType);

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
    }

    private void validateModelType(
            String modelType
    ) {

        if (modelType == null || modelType.isBlank()) {
            throw new IllegalArgumentException(
                    "Model type is required"
            );
        }
    }

    private void validateModelVersionId(
            Long modelVersionId
    ) {

        if (modelVersionId == null
                || modelVersionId <= 0) {

            throw new IllegalArgumentException(
                    "Model version ID must be greater than zero"
            );
        }
    }
}