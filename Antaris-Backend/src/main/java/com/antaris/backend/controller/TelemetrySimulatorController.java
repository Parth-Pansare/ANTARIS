package com.antaris.backend.controller;

import com.antaris.backend.simulator.TelemetryDataLoader;
import com.antaris.backend.simulator.TelemetrySimulatorService;
import com.antaris.backend.simulator.TelemetrySnapshot;
import com.antaris.backend.simulator.TelemetrySnapshotBuilder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/simulator")
public class TelemetrySimulatorController {

    private final TelemetryDataLoader telemetryDataLoader;
    private final TelemetrySnapshotBuilder telemetrySnapshotBuilder;
    private final TelemetrySimulatorService telemetrySimulatorService;

    public TelemetrySimulatorController(
            TelemetryDataLoader telemetryDataLoader,
            TelemetrySnapshotBuilder telemetrySnapshotBuilder,
            TelemetrySimulatorService telemetrySimulatorService
    ) {
        this.telemetryDataLoader = telemetryDataLoader;
        this.telemetrySnapshotBuilder = telemetrySnapshotBuilder;
        this.telemetrySimulatorService = telemetrySimulatorService;
    }

    @GetMapping("/test")
    public List<Map<String, String>> testTelemetryLoader() {

        List<Map<String, String>> rows =
                telemetryDataLoader.load(
                        "01_station_environment_telemetry.csv"
                );

        return rows.stream()
                .limit(5)
                .toList();
    }

    @PostMapping("/speed")
    public TelemetrySnapshot setSimulatorSpeed(
            @RequestParam double value
    ) {

        telemetrySimulatorService.setSpeed(value);

        return telemetrySimulatorService.getCurrentSnapshot();
    }

    @GetMapping("/snapshot")
    public TelemetrySnapshot testSnapshotBuilder() {

        List<TelemetrySnapshot> snapshots =
                telemetrySnapshotBuilder.buildSnapshots();

        if (snapshots.isEmpty()) {
            throw new IllegalStateException(
                    "No telemetry snapshots could be built."
            );
        }

        return snapshots.get(0);
    }

    @PostMapping("/start")
    public TelemetrySnapshot startSimulator(
            @RequestParam(defaultValue = "BHARATI") String station
    ) {

        telemetrySimulatorService.start(station);

        return telemetrySimulatorService.getCurrentSnapshot();
    }

    @PostMapping("/pause")
    public TelemetrySnapshot pauseSimulator() {

        telemetrySimulatorService.pause();

        return telemetrySimulatorService.getCurrentSnapshot();
    }

    @PostMapping("/stop")
    public TelemetrySnapshot stopSimulator() {

        telemetrySimulatorService.stop();

        return telemetrySimulatorService.getCurrentSnapshot();
    }

    @PostMapping("/reset")
    public TelemetrySnapshot resetSimulator() {

        telemetrySimulatorService.reset();

        return telemetrySimulatorService.getCurrentSnapshot();
    }

    @PostMapping("/station/{station}")
    public TelemetrySnapshot switchStation(
            @PathVariable String station
    ) {

        telemetrySimulatorService.switchStation(station);

        return telemetrySimulatorService.getCurrentSnapshot();
    }

    @GetMapping("/current")
    public TelemetrySnapshot getCurrentSnapshot() {

        return telemetrySimulatorService.getCurrentSnapshot();
    }

    @GetMapping("/status")
    public Map<String, Object> getSimulatorStatus() {

        return Map.of(
                "running", telemetrySimulatorService.isRunning(),
                "station", telemetrySimulatorService.getCurrentStation(),
                "currentIndex", telemetrySimulatorService.getCurrentIndex(),
                "totalSnapshots", telemetrySimulatorService.getTotalSnapshots(),
                "speed", telemetrySimulatorService.getSpeed()
        );
    }
}