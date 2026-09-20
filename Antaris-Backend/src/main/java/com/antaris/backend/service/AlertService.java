package com.antaris.backend.service;

import com.antaris.backend.dto.AlertResponse;
import com.antaris.backend.entity.Alert;
import com.antaris.backend.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public List<AlertResponse> getAlertsByStation(Long stationId) {

        return alertRepository
                .findByStationIdOrderByTimestampDesc(stationId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<AlertResponse> getUnacknowledgedAlerts(Long stationId) {

        return alertRepository
                .findByStationIdAndAcknowledgedFalseOrderByTimestampDesc(
                        stationId
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public AlertResponse getAlertById(Long id) {

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: " + id
                        ));

        return convertToResponse(alert);
    }

    public Alert saveAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    public AlertResponse acknowledgeAlert(Long id) {

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: " + id
                        ));

        alert.setAcknowledged(true);

        return convertToResponse(
                alertRepository.save(alert)
        );
    }

    private AlertResponse convertToResponse(Alert alert) {

        return new AlertResponse(
                alert.getId(),
                alert.getStation().getId(),
                alert.getStation().getCode(),

                alert.getAlertType(),
                alert.getSeverity(),
                alert.getTitle(),
                alert.getMessage(),
                alert.getSource(),

                alert.getAcknowledged(),
                alert.getActive(),

                alert.getTimestamp()
        );
    }
}