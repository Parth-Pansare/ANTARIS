package com.antaris.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private String alertType;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private Boolean acknowledged = false;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean active = true;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    /**
     * Backward-compatible constructor.
     *
     * Existing initializers and older code do not provide
     * the new active lifecycle field.
     *
     * New alerts are active by default.
     */
    public Alert(
            Long id,
            Station station,
            String alertType,
            String severity,
            String title,
            String message,
            String source,
            Boolean acknowledged,
            LocalDateTime timestamp
    ) {
        this.id = id;
        this.station = station;
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