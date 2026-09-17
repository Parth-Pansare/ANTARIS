package com.antaris.backend.ml.config;

import com.antaris.backend.ml.service.ModelVersionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelVersionInitializer {

    @Bean
    public CommandLineRunner initializeModelVersions(
            ModelVersionService modelVersionService
    ) {

        return args -> {

            // ====================================================
            // ENERGY MODEL
            // ====================================================

            modelVersionService.registerModelVersion(
                    "ENERGY_CONSUMPTION",
                    "MOCK-ENERGY-V1",
                    "MOCK"
            );

            // ====================================================
            // FUEL MODEL
            // ====================================================

            modelVersionService.registerModelVersion(
                    "FUEL_LEVEL",
                    "MOCK-FUEL-V1",
                    "MOCK"
            );

            // ====================================================
            // ENVIRONMENT MODEL
            // ====================================================

            modelVersionService.registerModelVersion(
                    "TEMPERATURE",
                    "MOCK-ENVIRONMENT-V1",
                    "MOCK"
            );

            // ====================================================
            // EQUIPMENT ANOMALY MODEL
            // ====================================================

            modelVersionService.registerModelVersion(
                    "EQUIPMENT_ANOMALY",
                    "MOCK-EQUIPMENT-V1",
                    "MOCK"
            );

            modelVersionService.registerModelVersion(
                    "EQUIPMENT_ANOMALY",
                    "BASELINE-EQUIPMENT-V1",
                    "PYTHON-ML"
            );
        };
    }
}