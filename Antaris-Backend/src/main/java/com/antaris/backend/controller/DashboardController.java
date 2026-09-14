package com.antaris.backend.controller;

import com.antaris.backend.dto.DashboardResponse;
import com.antaris.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{stationId}")
    public ResponseEntity<DashboardResponse> getDashboard(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                dashboardService.getDashboard(stationId)
        );
    }
}