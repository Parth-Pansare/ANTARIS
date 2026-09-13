package com.antaris.backend.repository;

import com.antaris.backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByStationIdOrderByEquipmentNameAsc(Long stationId);
}