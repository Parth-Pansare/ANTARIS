package com.antaris.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private String equipmentCode;

    @Column(nullable = false)
    private String equipmentName;

    @Column(nullable = false)
    private String equipmentType;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Double healthScore;

    @Column(nullable = false)
    private Double loadPercentage;

    @Column(nullable = false)
    private Double temperature;

    @Column(nullable = false)
    private Double runtimeHours;

    @Column(nullable = false)
    private LocalDateTime lastMaintenance;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}