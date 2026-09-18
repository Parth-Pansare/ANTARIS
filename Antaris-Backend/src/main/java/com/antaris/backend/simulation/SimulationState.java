package com.antaris.backend.simulation;

import com.antaris.backend.simulator.TelemetrySnapshot;

public class SimulationState {

    private TelemetrySnapshot state;

    public SimulationState() {
    }

    public SimulationState(TelemetrySnapshot state) {
        this.state = state;
    }

    public TelemetrySnapshot getState() {
        return state;
    }

    public void setState(TelemetrySnapshot state) {
        this.state = state;
    }
}