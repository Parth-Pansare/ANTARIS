package com.antaris.backend.websocket;

import com.antaris.backend.simulator.TelemetrySnapshot;

public record TelemetryUpdatedEvent(
        TelemetrySnapshot snapshot
) {
}