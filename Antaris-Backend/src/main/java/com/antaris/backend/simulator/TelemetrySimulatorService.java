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
import com.antaris.backend.service.AlertEngineService;

@Service
public class TelemetrySimulatorService {

    private final TelemetrySnapshotBuilder snapshotBuilder;
    private final ApplicationEventPublisher eventPublisher;



    private final ScheduledExecutorService scheduler =
            Executors.newSingleThreadScheduledExecutor();

    private List<TelemetrySnapshot> allSnapshots = new ArrayList<>();

    private List<TelemetrySnapshot> stationSnapshots = new ArrayList<>();

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

        allSnapshots = snapshotBuilder.buildSnapshots();

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

        stationSnapshots = allSnapshots.stream()
                .filter(snapshot ->
                        stationCode.equalsIgnoreCase(
                                snapshot.getStationCode()
                        )
                )
                .toList();

        if (stationSnapshots.isEmpty()) {
            throw new IllegalArgumentException(
                    "No telemetry found for station: " + stationCode
            );
        }

        currentStation = stationCode.toUpperCase();
        currentIndex = 0;
    }

    /**
     * Starts telemetry playback.
     *
     * One dataset hour is played every 5 seconds.
     */
    public synchronized void start(String stationCode) {

        loadSnapshotsIfNeeded();

        if (stationCode != null && !stationCode.isBlank()
                && !stationCode.equalsIgnoreCase(currentStation)) {

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
                Math.max(100, Math.round(5000 / speed));

        playbackTask = scheduler.scheduleAtFixedRate(
                this::advance,
                0,
                intervalMillis,
                TimeUnit.MILLISECONDS
        );
    }

    public synchronized void setSpeed(double newSpeed) {

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
                new TelemetryUpdatedEvent(currentSnapshot)
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
     * Returns the currently active telemetry snapshot.
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