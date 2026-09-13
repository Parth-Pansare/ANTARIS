package com.antaris.backend.controller;

import com.antaris.backend.dto.EnergyReadingResponse;
import com.antaris.backend.service.EnergyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/energy")
@CrossOrigin(origins = "http://localhost:5173")
public class EnergyController {

    private final EnergyService energyService;

    public EnergyController(EnergyService energyService) {
        this.energyService = energyService;
    }

    @GetMapping("/{stationId}/current")
    public ResponseEntity<EnergyReadingResponse> getCurrentReading(
            @PathVariable Long stationId) {

        EnergyReadingResponse reading =
                energyService.getLatestReading(stationId);

        if (reading == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reading);
    }

    @GetMapping("/{stationId}/history")
    public ResponseEntity<List<EnergyReadingResponse>> getHistory(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                energyService.getReadingsByStation(stationId)
        );
    }
}