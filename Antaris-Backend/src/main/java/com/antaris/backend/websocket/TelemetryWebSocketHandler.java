package com.antaris.backend.websocket;

import com.antaris.backend.simulator.TelemetrySimulatorService;
import com.antaris.backend.simulator.TelemetrySnapshot;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PreDestroy;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Component
public class TelemetryWebSocketHandler extends TextWebSocketHandler {

    private final TelemetrySimulatorService telemetrySimulatorService;
    private final ObjectMapper objectMapper;

    private final Set<WebSocketSession> sessions =
            java.util.concurrent.ConcurrentHashMap.newKeySet();

    /**
     * Dedicated executor for WebSocket broadcasting.
     *
     * Telemetry event processing does not wait for WebSocket
     * clients to receive their messages.
     */
    private final ExecutorService broadcastExecutor =
            Executors.newSingleThreadExecutor(runnable -> {

                Thread thread =
                        new Thread(
                                runnable,
                                "antaris-websocket-broadcast"
                        );

                thread.setDaemon(true);

                return thread;
            });

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

    /**
     * Receives telemetry events without blocking the publisher.
     *
     * The actual WebSocket broadcasting is delegated to the
     * dedicated executor.
     */
    @EventListener
    public void handleTelemetryUpdatedEvent(
            TelemetryUpdatedEvent event
    ) {

        if (event == null
                || event.snapshot() == null) {

            return;
        }

        TelemetrySnapshot snapshot =
                event.snapshot();

        try {

            broadcastExecutor.submit(
                    () -> safeBroadcastSnapshot(snapshot)
            );

        } catch (RuntimeException e) {

            System.err.println(
                    "Failed to queue WebSocket telemetry broadcast: "
                            + e.getMessage()
            );
        }
    }

    /**
     * Protects the executor thread from unexpected failures.
     *
     * A failure while broadcasting one telemetry snapshot must
     * not terminate the WebSocket broadcast worker.
     */
    private void safeBroadcastSnapshot(
            TelemetrySnapshot snapshot
    ) {

        try {

            broadcastSnapshot(snapshot);

        } catch (Throwable throwable) {

            System.err.println(
                    "WebSocket broadcast error: "
                            + throwable.getClass().getSimpleName()
                            + ": "
                            + throwable.getMessage()
            );

            throwable.printStackTrace(System.err);
        }
    }

    /**
     * Serializes and broadcasts telemetry to connected sessions.
     */
    private void broadcastSnapshot(
            TelemetrySnapshot snapshot
    ) {

        try {

            String json =
                    objectMapper.writeValueAsString(snapshot);

            TextMessage message =
                    new TextMessage(json);

            for (WebSocketSession session : sessions) {

                if (!session.isOpen()) {
                    continue;
                }

                try {

                    /*
                     * Protect each session from concurrent sends.
                     */
                    synchronized (session) {

                        if (session.isOpen()) {
                            session.sendMessage(message);
                        }
                    }

                } catch (IOException e) {

                    System.err.println(
                            "Failed to send telemetry to session: "
                                    + e.getMessage()
                    );

                    sessions.remove(session);
                } catch (RuntimeException e) {

                    System.err.println(
                            "WebSocket session error: "
                                    + e.getMessage()
                    );
                }
            }

        } catch (IOException e) {

            System.err.println(
                    "Failed to serialize telemetry: "
                            + e.getMessage()
            );
        }
    }

    /**
     * Gracefully shuts down the broadcast worker when the
     * Spring application stops.
     */
    @PreDestroy
    public void shutdown() {

        broadcastExecutor.shutdown();

        try {

            if (!broadcastExecutor.awaitTermination(
                    5,
                    TimeUnit.SECONDS
            )) {

                broadcastExecutor.shutdownNow();
            }

        } catch (InterruptedException e) {

            broadcastExecutor.shutdownNow();

            Thread.currentThread().interrupt();
        }
    }
}