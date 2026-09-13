package com.antaris.backend.dto;

import java.time.LocalDateTime;

public class EnvironmentReadingResponse {

    private Long id;
    private Long stationId;
    private String stationCode;

    private Double temperature;
    private Double humidity;
    private Double pressure;
    private Double windSpeed;
    private Double windDirection;

    private LocalDateTime timestamp;

    public EnvironmentReadingResponse() {
    }

    public EnvironmentReadingResponse(
            Long id,
            Long stationId,
            String stationCode,
            Double temperature,
            Double humidity,
            Double pressure,
            Double windSpeed,
            Double windDirection,
            LocalDateTime timestamp
    ) {
        this.id = id;
        this.stationId = stationId;
        this.stationCode = stationCode;
        this.temperature = temperature;
        this.humidity = humidity;
        this.pressure = pressure;
        this.windSpeed = windSpeed;
        this.windDirection = windDirection;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public Long getStationId() {
        return stationId;
    }

    public String getStationCode() {
        return stationCode;
    }

    public Double getTemperature() {
        return temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public Double getPressure() {
        return pressure;
    }

    public Double getWindSpeed() {
        return windSpeed;
    }

    public Double getWindDirection() {
        return windDirection;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}