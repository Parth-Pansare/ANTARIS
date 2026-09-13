package com.antaris.backend.service;

import com.antaris.backend.dto.InventoryItemResponse;
import com.antaris.backend.entity.InventoryItem;
import com.antaris.backend.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryItemService(
            InventoryItemRepository inventoryItemRepository) {

        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<InventoryItemResponse> getItemsByStation(Long stationId) {

        return inventoryItemRepository
                .findByStationIdOrderByItemNameAsc(stationId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public InventoryItemResponse getItemById(Long id) {

        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory item not found with id: " + id
                        ));

        return convertToResponse(item);
    }

    public InventoryItem saveItem(InventoryItem item) {
        return inventoryItemRepository.save(item);
    }

    private InventoryItemResponse convertToResponse(
            InventoryItem item) {

        return new InventoryItemResponse(
                item.getId(),
                item.getStation().getId(),
                item.getStation().getCode(),

                item.getItemCode(),
                item.getItemName(),
                item.getCategory(),

                item.getQuantity(),
                item.getUnit(),
                item.getMinimumRequired(),

                item.getStatus()
        );
    }
}