package com.antaris.backend.simulation.dto;

public class ScenarioRequest {

    private String station;
    private String scenarioName;
    private String description;
    private Integer horizonHours;
    private ScenarioChangeRequest changes;

    public ScenarioRequest() {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getHorizonHours() {
        return horizonHours;
    }

    public void setHorizonHours(Integer horizonHours) {
        this.horizonHours = horizonHours;
    }

    public ScenarioChangeRequest getChanges() {
        return changes;
    }

    public void setChanges(ScenarioChangeRequest changes) {
        this.changes = changes;
    }
}