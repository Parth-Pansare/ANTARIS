# ANTARIS — Phase 2: PREDICT

## Project

**ANTARIS — Antarctic Intelligence & Remote Operations System**

### SIH Problem Statement

**SIH26060 — Digital Platform for efficient remote management of Indian Antarctic Research Stations**

### Phase

**Phase 2 — PREDICT**

---

# 1. Phase Objective

Phase 2 extends the ANTARIS backend from real-time monitoring to predictive intelligence.

The system accepts current station telemetry, prepares prediction features, sends them through a stable ML adapter interface, receives predictions from the ML provider, validates the prediction, stores the prediction history, and uses the predictions for risk analysis, alerts, recommendations, future health scoring, and station comparison.

The architecture is designed so that the frontend does not directly communicate with the ML service.

---

# 2. Phase 2 Architecture

```text
                    ANTARIS FRONTEND
                           |
                           v
                 +-------------------+
                 |   SPRING BOOT     |
                 |      BACKEND      |
                 |                   |
                 | Prediction API    |
                 | PredictionService |
                 | ML Adapter        |
                 | Risk Engine       |
                 | Alert Engine      |
                 | Recommendation    |
                 +---------+---------+
                           |
                           v
                    +-------------+
                    |   ML API    |
                    |   FastAPI    |
                    +------+------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
       Energy            Fuel         Environment
        Model            Model            Model
          |                |                |
          +----------------+----------------+
                           |
                           v
                   Equipment Anomaly
                           |
                           v
                      Predictions
                           |
                           v
                         Risk
                           |
                           v
                        Alerts
                           |
                           v
                  Recommendations