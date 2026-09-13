package com.antaris.backend.repository;

import com.antaris.backend.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryItemRepository
        extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByStationIdOrderByItemNameAsc(Long stationId);
}