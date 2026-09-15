package com.antaris.backend.websocket;

import com.antaris.backend.simulator.TelemetrySimulatorService;
import com.antaris.backend.simulator.TelemetrySnapshot;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TelemetryWebSocketHandler extends TextWebSocketHandler {

    private final TelemetrySimulatorService telemetrySimulatorService;
    private final ObjectMapper objectMapper;

    private final Set<WebSocketSession> sessions =
            ConcurrentHashMap.newKeySet();

    public TelemetryWebSocketHandler(
            TelemetrySimulatorService telemetrySimulatorService,
            ObjectMapper objectMapper
    ) {
        this.telemetrySimulatorService = telemetrySimulatorService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(
            WebSocketSession session
    ) throws IOException {

        sessions.add(session);

        sendCurrentSnapshot(session);
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            org.springframework.web.socket.CloseStatus status
    ) {

        sessions.remove(session);
    }

    private void sendCurrentSnapshot(
            WebSocketSession session
    ) throws IOException {

        TelemetrySnapshot snapshot =
                telemetrySimulatorService.getCurrentSnapshot();

        String json =
                objectMapper.writeValueAsString(snapshot);

        session.sendMessage(
                new TextMessage(json)
        );
    }

    @EventListener
    public void handleTelemetryUpdatedEvent(
            TelemetryUpdatedEvent event
    ) {

        broadcastSnapshot(event.snapshot());
    }

    private void broadcastSnapshot(
            TelemetrySnapshot snapshot
    ) {

        try {

            String json =
                    objectMapper.writeValueAsString(snapshot);

            TextMessage message =
                    new TextMessage(json);

            for (WebSocketSession session : sessions) {

                if (session.isOpen()) {

                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {

                        System.err.println(
                                "Failed to send telemetry to session: "
                                        + e.getMessage()
                        );
                    }
                }
            }

        } catch (IOException e) {

            System.err.println(
                    "Failed to serialize telemetry: "
                            + e.getMessage()
            );
        }
    }
}