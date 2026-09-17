package com.antaris.backend.repository;

import com.antaris.backend.entity.ModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ModelVersionRepository
        extends JpaRepository<ModelVersion, Long> {

    Optional<ModelVersion> findByModelTypeAndVersion(
            String modelType,
            String version
    );

    List<ModelVersion> findByModelTypeOrderByCreatedAtDesc(
            String modelType
    );

    List<ModelVersion> findByModelTypeAndActiveTrue(
            String modelType
    );
}