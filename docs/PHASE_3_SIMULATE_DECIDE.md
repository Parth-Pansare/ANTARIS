# ANTARIS Phase 3 — SIMULATE + DECIDE

## 1. Overview

Phase 3 adds the simulation and decision-support layer to ANTARIS.

The purpose of this phase is to allow station operators to create hypothetical
scenarios, simulate their operational impact, evaluate risk, generate decisions,
provide recommended actions, and explain the reasoning behind those decisions.

The simulation layer never modifies the actual station telemetry state.

Core flow:

CURRENT STATE
      ↓
SCENARIO
      ↓
SIMULATE
      ↓
IMPACT ANALYSIS
      ↓
RISK
      ↓
DECISION
      ↓
RECOMMENDATION
      ↓
EXPLANATION


## 2. Phase 3 Architecture

Frontend
    ↓
Spring Boot Backend
    ↓
Scenario Management
    ↓
Simulation Engine
    ↓
Impact Analysis
    ↓
Scenario Risk Engine
    ↓
Decision Engine
    ↓
Action Recommendation Engine
    ↓
Decision Explanation Engine


## 3. Scenario Architecture

A simulation scenario contains:

- Station
- Scenario name
- Description
- Simulation horizon
- Temperature change
- Humidity change
- Wind resource change
- Generator availability change
- Fuel change
- Battery change
- Consumption change

Scenario data is persisted in the `simulation_scenarios` table.

Scenarios can be created, retrieved, listed by station, and deleted.


## 4. Scenario Management API

### Create Scenario

POST:

`/api/simulation/scenarios`

### Get All Scenarios

GET:

`/api/simulation/scenarios`

### Get Scenario

GET:

`/api/simulation/scenarios/{id}`

### Get Scenarios By Station

GET:

`/api/simulation/scenarios/station/{stationCode}`

### Delete Scenario

DELETE:

`/api/simulation/scenarios/{id}`


## 5. Current-State Snapshot

The simulation engine obtains the current station telemetry through
`CurrentStateSnapshotService`.

The current state is deep-copied before simulation.

This guarantees that scenario execution operates on a simulation copy rather
than modifying the actual station state.


## 6. Simulation Modules

### Energy Simulation

Energy simulation considers:

- Temperature-related heating demand
- Consumption change
- Generator availability
- Wind resource
- Battery state
- Generation and consumption balance

Generator availability and battery percentage are bounded within valid ranges.

### Fuel Simulation

Fuel simulation considers:

- Current fuel level
- Generator load
- Fuel consumption rate
- Consumption change
- Simulation horizon

Projected fuel usage is calculated over the selected simulation horizon.

Fuel level and fuel percentage are bounded at zero.

### Environment Simulation

Environment simulation considers:

- Temperature
- Humidity
- Wind resource
- Wind speed

Humidity is bounded between 0% and 100%.

Wind resource is bounded between 0 and 1.

### Equipment Simulation

Equipment simulation considers:

- Equipment temperature
- Equipment load
- Runtime
- Equipment health
- Equipment operational status

Equipment records are copied for simulation and are not persisted as modified
station equipment.

### Inventory Simulation

Inventory simulation estimates operational consumption over the simulation
horizon.

The current scenario contract does not contain a dedicated inventory-demand
parameter, so `consumptionChangePct` is used as the operational-demand factor.

Inventory quantities are bounded at zero.

Inventory status is evaluated as:

- AVAILABLE
- WARNING
- CRITICAL


## 7. Multi-Variable Simulation

`MultiVariableSimulationService` combines the individual simulation modules.

Processing order:

1. Current-state snapshot
2. Environment simulation
3. Energy simulation
4. Equipment simulation
5. Inventory simulation
6. Fuel simulation

The service returns:

- Baseline state
- Simulated state
- Simulated equipment
- Simulated inventory

The actual station state remains unchanged.


## 8. Scenario Impact Analysis

The impact analysis compares:

SIMULATED STATE - BASELINE STATE

The current impact model contains:

- Temperature delta
- Energy consumption delta
- Generator load delta
- Fuel consumption delta
- Fuel percentage delta
- Battery percentage delta


## 9. Scenario Risk Engine

The Scenario Risk Engine evaluates the combined impact of a scenario.

Risk domains:

- Energy
- Generator
- Fuel
- Battery
- Environment

The overall scenario risk is based on the highest domain risk.

Risk levels:

| Risk Score | Risk Level |
|------------|------------|
| < 0.25 | LOW |
| < 0.50 | MEDIUM |
| < 0.75 | HIGH |
| >= 0.75 | CRITICAL |

The primary risk domain is also returned.


## 10. Scenario Comparison

Multiple scenarios can be evaluated independently against the current baseline.

Endpoint:

POST:

`/api/simulation/comparison/{stationCode}`

The comparison response provides:

- Scenario name
- Description
- Horizon
- Impact
- Risk

A pair comparison endpoint is also available:

POST:

`/api/simulation/comparison/{stationCode}/pair`

Scenario comparison provides factual impact and risk information without
declaring a scenario as a winner.


## 11. Scenario Execution API

Saved scenarios can be executed using:

POST:

`/api/simulation/scenarios/{id}/run`

The endpoint:

1. Loads the saved scenario
2. Obtains the current station state
3. Runs the simulation
4. Calculates the impact
5. Returns baseline and simulated states

Invalid scenario IDs return HTTP 404.


## 12. Decision Engine

The Decision Engine converts scenario risk into an operational decision.

Decision mapping:

| Risk Level | Decision Code |
|------------|---------------|
| LOW | PROCEED |
| MEDIUM | PROCEED_WITH_MONITORING |
| HIGH | REVIEW_AND_PREPARE |
| CRITICAL | IMMEDIATE_ACTION_REQUIRED |

The decision also contains a reason based on the primary risk domain and
observed impact factors.


## 13. Action Recommendation Engine

The Action Recommendation Engine generates operational recommendations based
on the scenario impact, risk, and decision.

Example recommendation categories include:

- Reduce non-essential load
- Review power allocation
- Inspect generator
- Monitor generator load
- Review fuel reserve
- Monitor fuel consumption
- Plan fuel resupply
- Protect battery reserve
- Monitor battery
- Review battery capacity
- Review environmental impact
- Monitor environment
- Normal monitoring


## 14. Decision Explanation Engine

The Decision Explanation Engine provides a structured explanation containing:

- Summary
- Detailed explanation
- Operational implication
- Primary risk
- Risk level
- Risk score
- Decision code
- Decision
- Impact factors
- Recommendation count

The explanation is rule-based and traceable rather than an opaque AI-generated
decision.


## 15. Decision Support Flow

The complete Phase 3 flow is:

1. Operator creates a scenario.
2. Scenario is stored.
3. Operator executes the scenario.
4. Current station state is copied.
5. Simulation is performed.
6. Baseline and simulated states are compared.
7. Scenario impact is calculated.
8. Scenario risk is evaluated.
9. Decision is generated.
10. Recommended actions are generated.
11. Decision explanation is generated.


## 16. Validation and Testing

### Risk Validation

| Test | Score | Expected Level | Result |
|------|------:|----------------|--------|
| LOW | 0.00 | LOW | PASS |
| MEDIUM | 0.25 | MEDIUM | PASS |
| HIGH | 0.50 | HIGH | PASS |
| CRITICAL | 1.00 | CRITICAL | PASS |

### Scenario Validation

The following boundary and functional cases were tested:

- Null scenario changes
- Invalid scenario ID
- Wind resource lower bound
- Wind resource upper bound
- Battery lower bound
- Battery upper bound
- Generator availability lower bound
- Generator availability upper bound
- Fuel lower bound
- Fuel upper bound
- Multi-variable stress scenario
- Scenario execution
- Scenario comparison
- Decision generation
- Action recommendations
- Decision explanation
- State isolation


## 17. Multi-Variable Stress Test

Scenario:

- Station: BHARATI
- Horizon: 24 hours
- Temperature change: -10°C
- Humidity change: +10%
- Wind resource change: +0.2
- Generator availability change: -10%
- Fuel change: -10%
- Battery change: -15%
- Consumption change: +20%

Observed result:

- Temperature delta: -10°C
- Energy consumption delta: +168.83 kW
- Generator load delta: +24.93%
- Fuel consumption delta: +174.11 L/h
- Fuel percentage delta: -18.72%
- Battery percentage delta: -15%

Scenario risk:

- Risk score: 1.00
- Risk level: CRITICAL
- Primary risk: ENERGY


## 18. Scenario Comparison Validation

Two scenarios were compared for BHARATI.

### Extreme Cold Test

- Energy consumption delta: +153.48 kW
- Generator load delta: +16.62%
- Fuel consumption delta: +75.70 L/h
- Fuel percentage delta: -6.36%
- Temperature delta: -20°C
- Risk score: 1.00
- Risk level: CRITICAL

### Multi Variable Stress Test

- Energy consumption delta: +168.83 kW
- Generator load delta: +24.93%
- Fuel consumption delta: +174.11 L/h
- Fuel percentage delta: -18.72%
- Battery percentage delta: -15%
- Temperature delta: -10°C
- Risk score: 1.00
- Risk level: CRITICAL


## 19. State Isolation

Scenario simulations operate on copied state.

Simulation does not persist modified telemetry, equipment, or inventory as
actual station state.

This separation allows operators to perform what-if analysis safely.


## 20. Development Limitations

The simulation layer is intended for decision-support prototyping.

Operational energy, fuel, equipment, and inventory telemetry may use
simulation heuristics and synthetic operational data.

These values must not be presented as live NCPOR operational telemetry.

Environmental datasets can contain real AWS observations, while operational
telemetry is generated/derived for development and demonstration purposes.

Simulation coefficients should be calibrated using validated station
engineering data before production deployment.


## 21. Phase 3 Completion

Phase 3 implements:

MONITOR
    ↓
PREDICT
    ↓
SIMULATE
    ↓
IMPACT
    ↓
RISK
    ↓
DECIDE
    ↓
RECOMMEND
    ↓
EXPLAIN

Phase 3 — SIMULATE + DECIDE is complete after final regression testing and
Git checkpointing.