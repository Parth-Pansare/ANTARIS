package com.antaris.backend.controller;

import com.antaris.backend.service.AlertEngineService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertEngineController {

    private final AlertEngineService alertEngineService;

    public AlertEngineController(
            AlertEngineService alertEngineService
    ) {
        this.alertEngineService = alertEngineService;
    }

    @GetMapping("/evaluate")
    public List<Map<String, String>> evaluateAlerts() {

        return alertEngineService
                .evaluateCurrentTelemetry();
    }
}