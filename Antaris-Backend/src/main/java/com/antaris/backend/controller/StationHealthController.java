package com.antaris.backend.controller;

import com.antaris.backend.service.StationHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "http://localhost:5173")
public class StationHealthController {

    private final StationHealthService stationHealthService;

    public StationHealthController(
            StationHealthService stationHealthService
    ) {
        this.stationHealthService =
                stationHealthService;
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentHealth() {

        return ResponseEntity.ok(
                stationHealthService.calculateCurrentHealth()
        );
    }
}