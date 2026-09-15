package com.antaris.backend.controller;

import com.antaris.backend.service.HistoricalTelemetryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
public class HistoricalTelemetryController {

    private final HistoricalTelemetryService historicalTelemetryService;

    public HistoricalTelemetryController(
            HistoricalTelemetryService historicalTelemetryService
    ) {
        this.historicalTelemetryService =
                historicalTelemetryService;
    }

    @GetMapping("/environment/{station}")
    public List<Map<String, String>> getEnvironmentTelemetry(
            @PathVariable String station,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "1000") int limit
    ) {

        return historicalTelemetryService
                .getEnvironmentTelemetry(
                        station,
                        from,
                        to,
                        limit
                );
    }

    @GetMapping("/energy/{station}")
    public List<Map<String, String>> getEnergyTelemetry(
            @PathVariable String station,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "1000") int limit
    ) {

        return historicalTelemetryService
                .getEnergyTelemetry(
                        station,
                        from,
                        to,
                        limit
                );
    }

    @GetMapping("/fuel/{station}")
    public List<Map<String, String>> getFuelTelemetry(
            @PathVariable String station,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "1000") int limit
    ) {

        return historicalTelemetryService
                .getFuelTelemetry(
                        station,
                        from,
                        to,
                        limit
                );
    }

    @GetMapping("/equipment/{station}")
    public List<Map<String, String>> getEquipmentTelemetry(
            @PathVariable String station,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "1000") int limit
    ) {

        return historicalTelemetryService
                .getEquipmentTelemetry(
                        station,
                        from,
                        to,
                        limit
                );
    }

    @GetMapping("/operations/{station}")
    public List<Map<String, String>> getOperationsTelemetry(
            @PathVariable String station,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "1000") int limit
    ) {

        return historicalTelemetryService
                .getOperationsTelemetry(
                        station,
                        from,
                        to,
                        limit
                );
    }

    @GetMapping("/inventory/{station}")
    public List<Map<String, String>> getInventoryTelemetry(
            @PathVariable String station,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "1000") int limit
    ) {

        return historicalTelemetryService
                .getInventoryTelemetry(
                        station,
                        from,
                        to,
                        limit
                );
    }
}