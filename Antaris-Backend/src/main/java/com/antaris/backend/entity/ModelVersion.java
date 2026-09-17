package com.antaris.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "model_versions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_model_type_version",
                        columnNames = {
                                "model_type",
                                "version"
                        }
                )
        }
)
public class ModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "model_type",
            nullable = false
    )
    private String modelType;

    @Column(
            nullable = false
    )
    private String version;

    @Column(
            nullable = false
    )
    private String provider;

    @Column(
            nullable = false
    )
    private Boolean active;

    @Column(
            nullable = false
    )
    private LocalDateTime createdAt;

    public ModelVersion() {
    }

    public ModelVersion(
            Long id,
            String modelType,
            String version,
            String provider,
            Boolean active,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.modelType = modelType;
        this.version = version;
        this.provider = provider;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}