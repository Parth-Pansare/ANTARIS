package com.antaris.backend.repository;

import com.antaris.backend.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StationRepository extends JpaRepository<Station, Long> {

    Optional<Station> findByCode(String code);
}