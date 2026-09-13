package com.antaris.backend.controller;

import com.antaris.backend.dto.InventoryItemResponse;
import com.antaris.backend.service.InventoryItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(
            InventoryItemService inventoryItemService) {

        this.inventoryItemService = inventoryItemService;
    }

    @GetMapping("/{stationId}")
    public ResponseEntity<List<InventoryItemResponse>> getItemsByStation(
            @PathVariable Long stationId) {

        return ResponseEntity.ok(
                inventoryItemService.getItemsByStation(stationId)
        );
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<InventoryItemResponse> getItemById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                inventoryItemService.getItemById(id)
        );
    }
}