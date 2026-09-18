package com.antaris.backend.simulation.dto;

import com.antaris.backend.simulator.TelemetrySnapshot;

public class SimulationResult {

    private String station;
    private String scenarioName;
    private Integer horizonHours;

    private TelemetrySnapshot baselineState;
    private TelemetrySnapshot simulatedState;

    private SimulationImpact impact;

    public SimulationResult() {
    }

    public String getStation() {
        return station;
    }

    public void setStation(String station) {
        this.station = station;
    }

    public String getScenarioName() {
        return scenarioName;
    }

    public void setScenarioName(String scenarioName) {
        this.scenarioName = scenarioName;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }

    public TelemetrySnapshot getBaselineState() {
        return baselineState;
    }

    public void setBaselineState(
            TelemetrySnapshot baselineState
    ) {
        this.baselineState = baselineState;
    }

    public TelemetrySnapshot getSimulatedState() {
        return simulatedState;
    }

    public void setSimulatedState(
            TelemetrySnapshot simulatedState
    ) {
        this.simulatedState = simulatedState;
    }

    public SimulationImpact getImpact() {
        return impact;
    }

    public void setImpact(SimulationImpact impact) {
        this.impact = impact;
    }
}