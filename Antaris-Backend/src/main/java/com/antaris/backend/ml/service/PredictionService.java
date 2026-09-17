package com.antaris.backend.ml.service;

import com.antaris.backend.entity.Prediction;
import com.antaris.backend.entity.Station;
import com.antaris.backend.ml.adapter.MlPredictionClient;
import com.antaris.backend.ml.dto.PredictionHistoryResponse;
import com.antaris.backend.ml.dto.PredictionRequest;
import com.antaris.backend.ml.dto.PredictionResponse;
import com.antaris.backend.repository.PredictionRepository;
import com.antaris.backend.repository.StationRepository;
import com.antaris.backend.simulator.TelemetrySnapshot;
import com.antaris.backend.simulator.TelemetrySimulatorService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class PredictionService {

    private final MlPredictionClient mlPredictionClient;
    private final PredictionRepository predictionRepository;
    private final StationRepository stationRepository;
    private final TelemetrySimulatorService telemetrySimulatorService;
    private final EnergyPredictionFeatureBuilder energyFeatureBuilder;
    private final FuelPredictionFeatureBuilder fuelFeatureBuilder;
    private final EnvironmentPredictionFeatureBuilder environmentFeatureBuilder;

    public PredictionService(
            MlPredictionClient mlPredictionClient,
            PredictionRepository predictionRepository,
            StationRepository stationRepository,
            TelemetrySimulatorService telemetrySimulatorService,
            EnergyPredictionFeatureBuilder energyFeatureBuilder,
            FuelPredictionFeatureBuilder fuelFeatureBuilder,
            EnvironmentPredictionFeatureBuilder environmentFeatureBuilder
    ) {
        this.mlPredictionClient = mlPredictionClient;
        this.predictionRepository = predictionRepository;
        this.stationRepository = stationRepository;
        this.telemetrySimulatorService = telemetrySimulatorService;
        this.energyFeatureBuilder = energyFeatureBuilder;
        this.fuelFeatureBuilder = fuelFeatureBuilder;
        this.environmentFeatureBuilder = environmentFeatureBuilder;
    }

    // ============================================================
    // ENERGY PREDICTION
    // ============================================================

    public PredictionResponse predictEnergy(
            PredictionRequest request
    ) {

        validateRequest(request);
        validateStation(request.getStation());

        PredictionResponse response =
                mlPredictionClient.predictEnergy(request);

        validatePredictionResponse(
                response,
                request,
                "ENERGY_CONSUMPTION"
        );

        savePrediction(request, response);

        return response;
    }

    public PredictionResponse predictCurrentEnergy(
            int horizonHours
    ) {

        validateHorizon(horizonHours);

        TelemetrySnapshot snapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        PredictionRequest request =
                energyFeatureBuilder.buildRequest(
                        snapshot,
                        horizonHours
                );

        return predictEnergy(request);
    }

    // ============================================================
    // FUEL PREDICTION
    // ============================================================

    public PredictionResponse predictFuel(
            PredictionRequest request
    ) {

        validateRequest(request);
        validateStation(request.getStation());

        PredictionResponse response =
                mlPredictionClient.predictFuel(request);

        validatePredictionResponse(
                response,
                request,
                "FUEL_LEVEL"
        );

        savePrediction(request, response);

        return response;
    }

    public PredictionResponse predictCurrentFuel(
            int horizonHours
    ) {

        validateHorizon(horizonHours);

        TelemetrySnapshot snapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        PredictionRequest request =
                fuelFeatureBuilder.buildRequest(
                        snapshot,
                        horizonHours
                );

        return predictFuel(request);
    }

    // ============================================================
    // ENVIRONMENT PREDICTION
    // ============================================================

    public PredictionResponse predictEnvironment(
            PredictionRequest request
    ) {

        validateRequest(request);
        validateStation(request.getStation());

        PredictionResponse response =
                mlPredictionClient.predictEnvironment(request);

        validatePredictionResponse(
                response,
                request,
                "TEMPERATURE"
        );

        savePrediction(request, response);

        return response;
    }

    public PredictionResponse predictCurrentEnvironment(
            int horizonHours
    ) {

        validateHorizon(horizonHours);

        TelemetrySnapshot snapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        PredictionRequest request =
                environmentFeatureBuilder.buildRequest(
                        snapshot,
                        horizonHours
                );

        return predictEnvironment(request);
    }

    // ============================================================
    // ENERGY HISTORY
    // ============================================================

    public List<PredictionHistoryResponse> getEnergyPredictionHistory(
            Long stationId
    ) {

        validateStationId(stationId);

        List<Prediction> predictions =
                predictionRepository
                        .findByStationIdAndPredictionTypeOrderByPredictionTimestampDesc(
                                stationId,
                                "ENERGY_CONSUMPTION"
                        );

        return predictions.stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    // ============================================================
    // FUEL HISTORY
    // ============================================================

    public List<PredictionHistoryResponse> getFuelPredictionHistory(
            Long stationId
    ) {

        validateStationId(stationId);

        List<Prediction> predictions =
                predictionRepository
                        .findByStationIdAndPredictionTypeOrderByPredictionTimestampDesc(
                                stationId,
                                "FUEL_LEVEL"
                        );

        return predictions.stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    // ============================================================
    // ENVIRONMENT HISTORY
    // ============================================================

    public List<PredictionHistoryResponse> getEnvironmentPredictionHistory(
            Long stationId
    ) {

        validateStationId(stationId);

        List<Prediction> predictions =
                predictionRepository
                        .findByStationIdAndPredictionTypeOrderByPredictionTimestampDesc(
                                stationId,
                                "TEMPERATURE"
                        );

        return predictions.stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    // ============================================================
    // REQUEST VALIDATION
    // ============================================================

    private void validateRequest(
            PredictionRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Prediction request cannot be null"
            );
        }

        if (request.getStation() == null
                || request.getStation().isBlank()) {

            throw new IllegalArgumentException(
                    "Station is required"
            );
        }

        if (request.getTimestamp() == null
                || request.getTimestamp().isBlank()) {

            throw new IllegalArgumentException(
                    "Timestamp is required"
            );
        }

        validateTimestamp(request.getTimestamp());

        if (request.getFeatures() == null) {

            throw new IllegalArgumentException(
                    "Prediction features are required"
            );
        }

        if (request.getHorizonHours() == null
                || request.getHorizonHours() <= 0) {

            throw new IllegalArgumentException(
                    "Horizon hours must be greater than zero"
            );
        }

        if (request.getHorizonHours() > 168) {

            throw new IllegalArgumentException(
                    "Horizon hours cannot exceed 168 hours"
            );
        }

        validateFeatures(request);
    }

    private void validateHorizon(
            int horizonHours
    ) {

        if (horizonHours <= 0) {
            throw new IllegalArgumentException(
                    "Horizon hours must be greater than zero"
            );
        }

        if (horizonHours > 168) {
            throw new IllegalArgumentException(
                    "Horizon hours cannot exceed 168 hours"
            );
        }
    }

    private void validateFeatures(
            PredictionRequest request
    ) {

        if (request.getFeatures().getTemperatureC() == null) {
            throw new IllegalArgumentException(
                    "Temperature is required"
            );
        }

        if (request.getFeatures().getHumidityPct() == null) {
            throw new IllegalArgumentException(
                    "Humidity is required"
            );
        }

        if (request.getFeatures().getWindResourceIndex() == null) {
            throw new IllegalArgumentException(
                    "Wind resource index is required"
            );
        }

        if (request.getFeatures().getBatteryPercentage() == null) {
            throw new IllegalArgumentException(
                    "Battery percentage is required"
            );
        }

        if (request.getFeatures().getFuelPercentage() == null) {
            throw new IllegalArgumentException(
                    "Fuel percentage is required"
            );
        }

        if (request.getFeatures().getGeneratorLoadPct() == null) {
            throw new IllegalArgumentException(
                    "Generator load percentage is required"
            );
        }

        if (request.getFeatures().getTotalConsumptionKw() == null) {
            throw new IllegalArgumentException(
                    "Total consumption is required"
            );
        }

        validatePercentage(
                request.getFeatures().getHumidityPct(),
                "Humidity"
        );

        validatePercentage(
                request.getFeatures().getBatteryPercentage(),
                "Battery percentage"
        );

        validatePercentage(
                request.getFeatures().getFuelPercentage(),
                "Fuel percentage"
        );

        validatePercentage(
                request.getFeatures().getGeneratorLoadPct(),
                "Generator load percentage"
        );

        if (request.getFeatures().getWindResourceIndex() < 0
                || request.getFeatures().getWindResourceIndex() > 1) {

            throw new IllegalArgumentException(
                    "Wind resource index must be between 0 and 1"
            );
        }

        if (request.getFeatures().getTotalConsumptionKw() < 0) {

            throw new IllegalArgumentException(
                    "Total consumption cannot be negative"
            );
        }
    }

    private void validatePercentage(
            Double value,
            String fieldName
    ) {

        if (value < 0 || value > 100) {

            throw new IllegalArgumentException(
                    fieldName + " must be between 0 and 100"
            );
        }
    }

    // ============================================================
    // TIMESTAMP VALIDATION
    // ============================================================

    private void validateTimestamp(
            String timestamp
    ) {

        try {

            LocalDateTime.parse(timestamp);

        } catch (DateTimeParseException exception) {

            throw new IllegalArgumentException(
                    "Invalid timestamp. Expected ISO format such as "
                            + "2026-09-17T10:00:00"
            );
        }
    }

    // ============================================================
    // STATION VALIDATION
    // ============================================================

    private void validateStation(
            String stationCode
    ) {

        stationRepository
                .findByCode(stationCode)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Station not found with code: "
                                        + stationCode
                        )
                );
    }

    private void validateStationId(
            Long stationId
    ) {

        if (stationId == null || stationId <= 0) {

            throw new IllegalArgumentException(
                    "Station ID must be greater than zero"
            );
        }
    }

    // ============================================================
    // ML RESPONSE VALIDATION
    // ============================================================

    private void validatePredictionResponse(
            PredictionResponse response,
            PredictionRequest request,
            String expectedPredictionType
    ) {

        if (response == null) {

            throw new IllegalStateException(
                    "ML provider returned an empty prediction response"
            );
        }

        if (response.getPredictedValue() == null) {

            throw new IllegalStateException(
                    "ML provider returned no predicted value"
            );
        }

        /*
         * Temperature can legitimately be negative.
         * Therefore, negative values are rejected only for
         * energy and fuel predictions.
         */
        if (!"TEMPERATURE".equals(expectedPredictionType)
                && response.getPredictedValue() < 0) {

            throw new IllegalStateException(
                    "ML provider returned a negative prediction"
            );
        }

        if (response.getPredictionType() == null
                || response.getPredictionType().isBlank()) {

            throw new IllegalStateException(
                    "ML provider returned no prediction type"
            );
        }

        if (!expectedPredictionType.equals(
                response.getPredictionType()
        )) {

            throw new IllegalStateException(
                    "ML provider returned an unexpected prediction type"
            );
        }

        if (response.getUnit() == null
                || response.getUnit().isBlank()) {

            throw new IllegalStateException(
                    "ML provider returned no prediction unit"
            );
        }

        if (response.getHorizonHours() == null
                || response.getHorizonHours() <= 0) {

            throw new IllegalStateException(
                    "ML provider returned an invalid prediction horizon"
            );
        }

        if (response.getModelVersion() == null
                || response.getModelVersion().isBlank()) {

            throw new IllegalStateException(
                    "ML provider returned no model version"
            );
        }

        if (response.getStation() == null
                || !request.getStation().equalsIgnoreCase(
                response.getStation()
        )) {

            throw new IllegalStateException(
                    "ML provider returned a different station"
            );
        }
    }

    // ============================================================
    // DATABASE PERSISTENCE
    // ============================================================

    private void savePrediction(
            PredictionRequest request,
            PredictionResponse response
    ) {

        Station station =
                stationRepository
                        .findByCode(request.getStation())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Station not found with code: "
                                                + request.getStation()
                                )
                        );

        LocalDateTime predictionTimestamp;

        try {

            predictionTimestamp =
                    LocalDateTime.parse(
                            request.getTimestamp()
                    );

        } catch (DateTimeParseException exception) {

            throw new IllegalArgumentException(
                    "Invalid prediction timestamp: "
                            + request.getTimestamp()
            );
        }

        Prediction prediction =
                new Prediction();

        prediction.setStation(station);

        prediction.setPredictionType(
                response.getPredictionType()
        );

        prediction.setPredictedValue(
                response.getPredictedValue()
        );

        prediction.setUnit(
                response.getUnit()
        );

        prediction.setHorizonHours(
                response.getHorizonHours()
        );

        prediction.setModelVersion(
                response.getModelVersion()
        );

        prediction.setPredictionTimestamp(
                predictionTimestamp
        );

        prediction.setCreatedAt(
                LocalDateTime.now()
        );

        predictionRepository.save(prediction);
    }

    // ============================================================
    // HISTORY RESPONSE
    // ============================================================

    private PredictionHistoryResponse toHistoryResponse(
            Prediction prediction
    ) {

        return new PredictionHistoryResponse(
                prediction.getId(),
                prediction.getStation().getCode(),
                prediction.getPredictionType(),
                prediction.getPredictedValue(),
                prediction.getUnit(),
                prediction.getHorizonHours(),
                prediction.getModelVersion(),
                prediction.getPredictionTimestamp(),
                prediction.getCreatedAt()
        );
    }
}