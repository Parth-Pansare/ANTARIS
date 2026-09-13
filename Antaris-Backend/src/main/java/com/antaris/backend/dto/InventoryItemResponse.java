package com.antaris.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemResponse {

    private Long id;
    private Long stationId;
    private String stationCode;

    private String itemCode;
    private String itemName;
    private String category;

    private Double quantity;
    private String unit;
    private Double minimumRequired;

    private String status;
}