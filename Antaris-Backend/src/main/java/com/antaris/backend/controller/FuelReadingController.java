package com.antaris.backend.controller;

import com.antaris.backend.dto.FuelReadingResponse;
import com.antaris.backend.service.FuelReadingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
@CrossOrigin(origins = "http://localhost:5173")
public class FuelReadingController {

    private final FuelReadingService fuelReadingService;

    public FuelReadingController(FuelReadingService fuelReadingService) {
        this.fuelReadingService = fuelReadingService;
    }

    @GetMapping("/{stationId}/current")
    public ResponseEntity<FuelReadingResponse> getCurrentReading(
            @PathVariable Long stationId) {

        FuelReadingResponse reading =
                fuelReadingService.getLatestReading(stationId);

        if (reading == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(reading);
    }

    @GetMapping("/{stationId}/history")
    public ResponseEntity<List<FuelReadingResponse>> getHistory(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                fuelReadingService.getReadingsByStation(stationId)
        );
    }
}