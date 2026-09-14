package com.antaris.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    private LocalDateTime timestamp;
}