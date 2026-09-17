package com.antaris.backend.ml.service;

import com.antaris.backend.ml.dto.FutureHealthScoreResponse;
import com.antaris.backend.ml.dto.PredictionRiskResponse;
import com.antaris.backend.ml.dto.PredictionStationComparisonResponse;
import org.springframework.stereotype.Service;

@Service
public class PredictionStationComparisonService {

    private final FutureHealthScoreService futureHealthScoreService;

    public PredictionStationComparisonService(
            FutureHealthScoreService futureHealthScoreService
    ) {
        this.futureHealthScoreService =
                futureHealthScoreService;
    }

    // ============================================================
    // COMPARE PREDICTED STATION HEALTH
    // ============================================================

    public PredictionStationComparisonResponse compareStations(
            PredictionRiskResponse stationAEnergyRisk,
            PredictionRiskResponse stationAFuelRisk,
            PredictionRiskResponse stationAEnvironmentRisk,
            PredictionRiskResponse stationAEquipmentRisk,

            PredictionRiskResponse stationBEnergyRisk,
            PredictionRiskResponse stationBFuelRisk,
            PredictionRiskResponse stationBEnvironmentRisk,
            PredictionRiskResponse stationBEquipmentRisk
    ) {

        validateStationInputs(
                stationAEnergyRisk,
                stationAFuelRisk,
                stationAEnvironmentRisk,
                stationAEquipmentRisk
        );

        validateStationInputs(
                stationBEnergyRisk,
                stationBFuelRisk,
                stationBEnvironmentRisk,
                stationBEquipmentRisk
        );

        FutureHealthScoreResponse stationA =
                futureHealthScoreService
                        .calculateFutureHealthScore(
                                stationAEnergyRisk,
                                stationAFuelRisk,
                                stationAEnvironmentRisk,
                                stationAEquipmentRisk
                        );

        FutureHealthScoreResponse stationB =
                futureHealthScoreService
                        .calculateFutureHealthScore(
                                stationBEnergyRisk,
                                stationBFuelRisk,
                                stationBEnvironmentRisk,
                                stationBEquipmentRisk
                        );

        if (!stationA.getHorizonHours()
                .equals(stationB.getHorizonHours())) {

            throw new IllegalArgumentException(
                    "Both stations must use the same forecast horizon"
            );
        }

        return new PredictionStationComparisonResponse(
                stationA,
                stationB,
                stationA.getHorizonHours()
        );
    }

    // ============================================================
    // VALIDATE STATION INPUTS
    // ============================================================

    private void validateStationInputs(
            PredictionRiskResponse energyRisk,
            PredictionRiskResponse fuelRisk,
            PredictionRiskResponse environmentRisk,
            PredictionRiskResponse equipmentRisk
    ) {

        if (energyRisk == null
                || fuelRisk == null
                || environmentRisk == null
                || equipmentRisk == null) {

            throw new IllegalArgumentException(
                    "All four prediction risks are required for each station"
            );
        }

        String station =
                energyRisk.getStation();

        if (station == null
                || station.isBlank()) {

            throw new IllegalArgumentException(
                    "Station code cannot be empty"
            );
        }

        validateStationMatch(
                station,
                fuelRisk.getStation()
        );

        validateStationMatch(
                station,
                environmentRisk.getStation()
        );

        validateStationMatch(
                station,
                equipmentRisk.getStation()
        );
    }

    // ============================================================
    // VALIDATE SAME STATION
    // ============================================================

    private void validateStationMatch(
            String expectedStation,
            String actualStation
    ) {

        if (actualStation == null
                || !expectedStation.equalsIgnoreCase(
                actualStation
        )) {

            throw new IllegalArgumentException(
                    "All prediction risks must belong to the same station"
            );
        }
    }
}