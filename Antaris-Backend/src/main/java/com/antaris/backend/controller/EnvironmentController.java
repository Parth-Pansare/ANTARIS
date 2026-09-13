package com.antaris.backend.controller;

import com.antaris.backend.dto.EnvironmentReadingResponse;
import com.antaris.backend.service.EnvironmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/environment")
@CrossOrigin(origins = "http://localhost:5173")
public class EnvironmentController {

    private final EnvironmentService environmentService;

    public EnvironmentController(EnvironmentService environmentService) {
        this.environmentService = environmentService;
    }

    @GetMapping("/{stationId}/current")
    public ResponseEntity<EnvironmentReadingResponse> getCurrentReading(
            @PathVariable Long stationId) {

        EnvironmentReadingResponse reading =
                environmentService.getLatestReading(stationId);

        if (reading == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reading);
    }

    @GetMapping("/{stationId}/history")
    public ResponseEntity<List<EnvironmentReadingResponse>> getHistory(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                environmentService.getReadingsByStation(stationId)
        );
    }
}