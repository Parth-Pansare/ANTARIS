package com.antaris.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AlertResponse {

    private Long id;
    private Long stationId;
    private String stationCode;

    private String alertType;
    private String severity;
    private String title;
    private String message;
    private String source;

    private Boolean acknowledged;
    private Boolean active;

    private LocalDateTime timestamp;

    /**
     * Constructor used by the current AlertService.
     */
    public AlertResponse(
            Long id,
            Long stationId,
            String stationCode,
            String alertType,
            String severity,
            String title,
            String message,
            String source,
            Boolean acknowledged,
            Boolean active,
            LocalDateTime timestamp
    ) {
        this.id = id;
        this.stationId = stationId;
        this.stationCode = stationCode;
        this.alertType = alertType;
        this.severity = severity;
        this.title = title;
        this.message = message;
        this.source = source;
        this.acknowledged = acknowledged;
        this.active = active;
        this.timestamp = timestamp;
    }

    /**
     * Backward-compatible constructor used by existing code.
     *
     * Existing callers that do not provide the lifecycle state
     * will treat the alert as active.
     */
    public AlertResponse(
            Long id,
            Long stationId,
            String stationCode,
            String alertType,
            String severity,
            String title,
            String message,
            String source,
            Boolean acknowledged,
            LocalDateTime timestamp
    ) {
        this.id = id;
        this.stationId = stationId;
        this.stationCode = stationCode;
        this.alertType = alertType;
        this.severity = severity;
        this.title = title;
        this.message = message;
        this.source = source;
        this.acknowledged = acknowledged;
        this.active = true;
        this.timestamp = timestamp;
    }
}