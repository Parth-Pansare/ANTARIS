# ANTARIS Telemetry Dataset Pack

## Repository location
Copy this folder to:
`D:\ANTARIS\database\telemetry\`

## Source data
- Maitri AWS 2016: supplied Excel file.
- Bharati AWS 2026: supplied Excel file.
- Bharati uses `-999` as a missing-value sentinel; cleaned copies represent these as blank/NaN.

## Provenance
- `REAL_AWS`: directly from supplied AWS observations.
- `SIMULATED_OPERATIONAL`: generated operational telemetry for development/demo.
- `DERIVED`: calculated from telemetry/rules.
- `DERIVED_ML_FEATURE`: calculated features for future ML.

Operational telemetry is not claimed to be real NCPOR operational telemetry.

## Files
01_station_environment_telemetry.csv
02_station_energy_telemetry.csv
03_station_fuel_telemetry.csv
04_equipment_telemetry.csv
05_station_operations_telemetry.csv
06_inventory_logistics_telemetry.csv
07_maintenance_events.csv
08_alert_events.csv
09_station_ml_features.csv
source_maitri_aws_2016_cleaned.csv
source_bharati_aws_2026_cleaned.csv

## Resolution
The operational datasets use hourly timestamps. Bharati's minute-resolution AWS data is aggregated to hourly observations for the operational layer. The source-cleaned files preserve the source resolution.

## Modeling relationship
Weather -> heating demand -> energy consumption -> generator load -> fuel consumption -> fuel level.
Crew, inventory and communication are simulated operational layers.
