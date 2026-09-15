package com.antaris.backend.controller;

import com.antaris.backend.service.StationComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/comparison")
@CrossOrigin(origins = "http://localhost:5173")
public class StationComparisonController {

    private final StationComparisonService stationComparisonService;

    public StationComparisonController(
            StationComparisonService stationComparisonService
    ) {
        this.stationComparisonService =
                stationComparisonService;
    }

    /**
     * Compares Maitri and Bharati.
     */
    @GetMapping("/stations")
    public ResponseEntity<Map<String, Object>> compareStations() {

        return ResponseEntity.ok(
                stationComparisonService
                        .compareStations()
        );
    }
}