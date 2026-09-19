package com.antaris.backend.simulator;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import com.antaris.backend.websocket.TelemetryUpdatedEvent;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class TelemetrySimulatorService {

    private final TelemetrySnapshotBuilder snapshotBuilder;
    private final ApplicationEventPublisher eventPublisher;

    private final ScheduledExecutorService scheduler =
            Executors.newSingleThreadScheduledExecutor();

    private List<TelemetrySnapshot> allSnapshots =
            new ArrayList<>();

    private List<TelemetrySnapshot> stationSnapshots =
            new ArrayList<>();

    private int currentIndex = 0;

    private String currentStation = "BHARATI";

    private boolean running = false;

    private double speed = 1.0;

    private ScheduledFuture<?> playbackTask;

    public TelemetrySimulatorService(
            TelemetrySnapshotBuilder snapshotBuilder,
            ApplicationEventPublisher eventPublisher
    ) {
        this.snapshotBuilder = snapshotBuilder;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Loads all telemetry snapshots into memory.
     */
    private synchronized void loadSnapshotsIfNeeded() {

        if (!allSnapshots.isEmpty()) {
            return;
        }

        allSnapshots =
                snapshotBuilder.buildSnapshots();

        if (allSnapshots.isEmpty()) {
            throw new IllegalStateException(
                    "No telemetry snapshots available."
            );
        }

        selectStationSnapshots(currentStation);
    }

    /**
     * Selects telemetry belonging to one station.
     */
    private synchronized void selectStationSnapshots(
            String stationCode
    ) {

        stationSnapshots =
                allSnapshots.stream()
                        .filter(snapshot ->
                                stationCode.equalsIgnoreCase(
                                        snapshot.getStationCode()
                                )
                        )
                        .toList();

        if (stationSnapshots.isEmpty()) {
            throw new IllegalArgumentException(
                    "No telemetry found for station: "
                            + stationCode
            );
        }

        currentStation =
                stationCode.toUpperCase();

        currentIndex = 0;
    }

    /**
     * Starts telemetry playback.
     *
     * One dataset hour is played every 5 seconds.
     */
    public synchronized void start(
            String stationCode
    ) {

        loadSnapshotsIfNeeded();

        if (stationCode != null
                && !stationCode.isBlank()
                && !stationCode.equalsIgnoreCase(
                currentStation
        )) {

            selectStationSnapshots(stationCode);
        }

        if (running) {
            return;
        }

        running = true;

        schedulePlayback();
    }

    private synchronized void schedulePlayback() {

        if (playbackTask != null) {
            playbackTask.cancel(false);
        }

        long intervalMillis =
                Math.max(
                        100,
                        Math.round(5000 / speed)
                );

        playbackTask =
                scheduler.scheduleAtFixedRate(
                        this::advance,
                        0,
                        intervalMillis,
                        TimeUnit.MILLISECONDS
                );
    }

    public synchronized void setSpeed(
            double newSpeed
    ) {

        if (newSpeed <= 0) {
            throw new IllegalArgumentException(
                    "Speed must be greater than 0."
            );
        }

        speed = newSpeed;

        if (running) {
            schedulePlayback();
        }
    }

    public synchronized double getSpeed() {
        return speed;
    }

    /**
     * Advances the simulator to the next telemetry snapshot.
     */
    private synchronized void advance() {

        if (!running || stationSnapshots.isEmpty()) {
            return;
        }

        currentIndex++;

        if (currentIndex >= stationSnapshots.size()) {
            currentIndex = 0;
        }

        TelemetrySnapshot currentSnapshot =
                stationSnapshots.get(currentIndex);

        eventPublisher.publishEvent(
                new TelemetryUpdatedEvent(
                        currentSnapshot
                )
        );
    }

    /**
     * Pauses playback at the current snapshot.
     */
    public synchronized void pause() {

        running = false;

        if (playbackTask != null) {
            playbackTask.cancel(false);
            playbackTask = null;
        }
    }

    /**
     * Stops playback and resets to the first snapshot.
     */
    public synchronized void stop() {

        pause();

        currentIndex = 0;
    }

    public synchronized void reset() {

        pause();

        currentIndex = 0;
    }

    public synchronized void switchStation(
            String stationCode
    ) {

        pause();

        loadSnapshotsIfNeeded();

        selectStationSnapshots(stationCode);
    }

    /**
     * Returns the currently active telemetry snapshot
     * for the globally selected simulator station.
     */
    public synchronized TelemetrySnapshot getCurrentSnapshot() {

        loadSnapshotsIfNeeded();

        if (stationSnapshots.isEmpty()) {
            throw new IllegalStateException(
                    "No telemetry snapshots available."
            );
        }

        return stationSnapshots.get(currentIndex);
    }

    /**
     * Returns a current telemetry snapshot for a specific
     * station without changing the global simulator state.
     *
     * The method first attempts to find the requested station
     * at the same timestamp as the currently selected global
     * simulator snapshot. If no matching timestamp exists,
     * the first available snapshot for that station is used.
     *
     * IMPORTANT:
     * This method does NOT change:
     *
     * - currentStation
     * - currentIndex
     * - stationSnapshots
     * - running state
     */
    public synchronized TelemetrySnapshot getCurrentSnapshot(
            String stationCode
    ) {

        if (stationCode == null
                || stationCode.isBlank()) {

            throw new IllegalArgumentException(
                    "Station code cannot be null or blank."
            );
        }

        loadSnapshotsIfNeeded();

        String requestedStation =
                stationCode.trim().toUpperCase();

        /*
         * Ensure the requested station actually exists.
         */
        boolean stationExists =
                allSnapshots.stream()
                        .anyMatch(snapshot ->
                                requestedStation.equalsIgnoreCase(
                                        snapshot.getStationCode()
                                )
                        );

        if (!stationExists) {
            throw new IllegalArgumentException(
                    "No telemetry found for station: "
                            + requestedStation
            );
        }

        /*
         * Capture the currently active timestamp without
         * modifying the global simulator state.
         */
        TelemetrySnapshot globalSnapshot =
                stationSnapshots.isEmpty()
                        ? null
                        : stationSnapshots.get(currentIndex);

        /*
         * Prefer the requested station's snapshot at the
         * same timestamp as the active simulator snapshot.
         */
        if (globalSnapshot != null
                && globalSnapshot.getTimestamp() != null) {

            TelemetrySnapshot matchingSnapshot =
                    allSnapshots.stream()
                            .filter(snapshot ->
                                    requestedStation.equalsIgnoreCase(
                                            snapshot.getStationCode()
                                    )
                            )
                            .filter(snapshot ->
                                    globalSnapshot.getTimestamp()
                                            .equals(
                                                    snapshot.getTimestamp()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (matchingSnapshot != null) {
                return matchingSnapshot;
            }
        }

        /*
         * Fallback:
         * return the first available snapshot for the
         * requested station.
         */
        return allSnapshots.stream()
                .filter(snapshot ->
                        requestedStation.equalsIgnoreCase(
                                snapshot.getStationCode()
                        )
                )
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No telemetry found for station: "
                                        + requestedStation
                        )
                );
    }

    /**
     * Returns whether the simulator is currently running.
     */
    public synchronized boolean isRunning() {
        return running;
    }

    /**
     * Returns the currently selected station.
     */
    public synchronized String getCurrentStation() {
        return currentStation;
    }

    /**
     * Returns the current playback position.
     */
    public synchronized int getCurrentIndex() {
        return currentIndex;
    }

    /**
     * Returns total snapshots for the selected station.
     */
    public synchronized int getTotalSnapshots() {

        loadSnapshotsIfNeeded();

        return stationSnapshots.size();
    }

    /**
     * Releases the scheduler when the application shuts down.
     */
    public void shutdown() {
        scheduler.shutdownNow();
    }
}