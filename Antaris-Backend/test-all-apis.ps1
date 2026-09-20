$ErrorActionPreference = "Stop"

$BaseUrl = "http://localhost:8080"
$Passed = 0
$Failed = 0
$Results = @()

function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [int[]]$ExpectedStatus = @(200),
        [string]$Body = $null
    )

    try {
        $params = @{
            Uri             = "$BaseUrl$Url"
            Method          = $Method
            ErrorAction     = "Stop"
            UseBasicParsing = $true
        }

        if ($Body) {
            $params.ContentType = "application/json"
            $params.Body = $Body
        }

        $start = Get-Date
        $response = Invoke-WebRequest @params
        $elapsed = ((Get-Date) - $start).TotalMilliseconds

        $status = [int]$response.StatusCode

        if ($ExpectedStatus -contains $status) {
            $script:Passed++

            $Results += [PSCustomObject]@{
                Status   = "PASS"
                Method   = $Method
                Endpoint = $Url
                HTTP     = $status
                Time     = "$([math]::Round($elapsed,0)) ms"
            }

            Write-Host "[PASS] $Method $Url -> HTTP $status ($([math]::Round($elapsed,0)) ms)" -ForegroundColor Green

            return $response
        }

        throw "Expected HTTP $($ExpectedStatus -join ', ') but received $status"
    }
    catch {
        $script:Failed++

        $httpStatus = "-"
        $errorBody = ""

        if ($_.Exception.Response) {
            try {
                $httpStatus = [int]$_.Exception.Response.StatusCode

                if ($_.Exception.Response.GetResponseStream()) {
                    $reader = New-Object System.IO.StreamReader(
                        $_.Exception.Response.GetResponseStream()
                    )

                    $errorBody = $reader.ReadToEnd()
                    $reader.Close()
                }
            }
            catch {
                $errorBody = ""
            }
        }

        $Results += [PSCustomObject]@{
            Status   = "FAIL"
            Method   = $Method
            Endpoint = $Url
            HTTP     = $httpStatus
            Time     = "-"
        }

        Write-Host "[FAIL] $Method $Url -> HTTP $httpStatus" -ForegroundColor Red

        if ($errorBody) {
            Write-Host "       Response: $errorBody" -ForegroundColor DarkRed
        }
        else {
            Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        }

        return $null
    }
}

function Get-Json {
    param(
        [object]$Response
    )

    if ($null -eq $Response) {
        return $null
    }

    try {
        return ($Response.Content | ConvertFrom-Json)
    }
    catch {
        return $null
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "       ANTARIS API TEST SUITE" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"
Write-Host ""

# ------------------------------------------------------------
# 1. BACKEND CONNECTIVITY
# ------------------------------------------------------------

Write-Host "========== BACKEND ==========" -ForegroundColor Yellow

$stationsResponse = Test-Api `
    -Name "Get all stations" `
    -Method "GET" `
    -Url "/api/stations"

if ($null -eq $stationsResponse) {
    Write-Host ""
    Write-Host "Backend is not responding. Stop test." -ForegroundColor Red
    exit 1
}

$stations = Get-Json $stationsResponse

$MaitriId = 1
$BharatiId = 2

if ($stations) {
    $maitri = $stations |
        Where-Object { $_.code -eq "MAITRI" } |
        Select-Object -First 1

    $bharati = $stations |
        Where-Object { $_.code -eq "BHARATI" } |
        Select-Object -First 1

    if ($maitri -and $maitri.id) {
        $MaitriId = $maitri.id
    }

    if ($bharati -and $bharati.id) {
        $BharatiId = $bharati.id
    }
}

Write-Host "Maitri ID : $MaitriId"
Write-Host "Bharati ID: $BharatiId"
Write-Host ""

# ------------------------------------------------------------
# 2. STATIONS
# ------------------------------------------------------------

Write-Host "========== STATIONS ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Get Maitri" `
    -Method "GET" `
    -Url "/api/stations/$MaitriId" | Out-Null

Test-Api `
    -Name "Get Bharati" `
    -Method "GET" `
    -Url "/api/stations/$BharatiId" | Out-Null

# ------------------------------------------------------------
# 3. ENVIRONMENT
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== ENVIRONMENT ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri current environment" `
    -Method "GET" `
    -Url "/api/environment/$MaitriId/current" | Out-Null

Test-Api `
    -Name "Maitri environment history" `
    -Method "GET" `
    -Url "/api/environment/$MaitriId/history" | Out-Null

Test-Api `
    -Name "Bharati current environment" `
    -Method "GET" `
    -Url "/api/environment/$BharatiId/current" | Out-Null

Test-Api `
    -Name "Bharati environment history" `
    -Method "GET" `
    -Url "/api/environment/$BharatiId/history" | Out-Null

# ------------------------------------------------------------
# 4. ENERGY
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== ENERGY ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri current energy" `
    -Method "GET" `
    -Url "/api/energy/$MaitriId/current" | Out-Null

Test-Api `
    -Name "Maitri energy history" `
    -Method "GET" `
    -Url "/api/energy/$MaitriId/history" | Out-Null

Test-Api `
    -Name "Bharati current energy" `
    -Method "GET" `
    -Url "/api/energy/$BharatiId/current" | Out-Null

Test-Api `
    -Name "Bharati energy history" `
    -Method "GET" `
    -Url "/api/energy/$BharatiId/history" | Out-Null

# ------------------------------------------------------------
# 5. FUEL
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== FUEL ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri current fuel" `
    -Method "GET" `
    -Url "/api/fuel/$MaitriId/current" | Out-Null

Test-Api `
    -Name "Maitri fuel history" `
    -Method "GET" `
    -Url "/api/fuel/$MaitriId/history" | Out-Null

Test-Api `
    -Name "Bharati current fuel" `
    -Method "GET" `
    -Url "/api/fuel/$BharatiId/current" | Out-Null

Test-Api `
    -Name "Bharati fuel history" `
    -Method "GET" `
    -Url "/api/fuel/$BharatiId/history" | Out-Null

# ------------------------------------------------------------
# 6. EQUIPMENT
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== EQUIPMENT ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri equipment" `
    -Method "GET" `
    -Url "/api/equipment/$MaitriId" | Out-Null

Test-Api `
    -Name "Bharati equipment" `
    -Method "GET" `
    -Url "/api/equipment/$BharatiId" | Out-Null

# ------------------------------------------------------------
# 7. INVENTORY
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== INVENTORY ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri inventory" `
    -Method "GET" `
    -Url "/api/inventory/$MaitriId" | Out-Null

Test-Api `
    -Name "Bharati inventory" `
    -Method "GET" `
    -Url "/api/inventory/$BharatiId" | Out-Null

# ------------------------------------------------------------
# 8. MAINTENANCE
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== MAINTENANCE ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri maintenance" `
    -Method "GET" `
    -Url "/api/maintenance/$MaitriId" | Out-Null

Test-Api `
    -Name "Bharati maintenance" `
    -Method "GET" `
    -Url "/api/maintenance/$BharatiId" | Out-Null

# ------------------------------------------------------------
# 9. ALERTS
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== ALERTS ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri alerts" `
    -Method "GET" `
    -Url "/api/alerts/$MaitriId" | Out-Null

Test-Api `
    -Name "Maitri active alerts" `
    -Method "GET" `
    -Url "/api/alerts/$MaitriId/active" | Out-Null

Test-Api `
    -Name "Bharati alerts" `
    -Method "GET" `
    -Url "/api/alerts/$BharatiId" | Out-Null

Test-Api `
    -Name "Bharati active alerts" `
    -Method "GET" `
    -Url "/api/alerts/$BharatiId/active" | Out-Null

Test-Api `
    -Name "Alert engine evaluation" `
    -Method "GET" `
    -Url "/api/alerts/evaluate" | Out-Null

# ------------------------------------------------------------
# 10. DASHBOARD / HEALTH / COMPARISON
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== DASHBOARD / HEALTH ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Maitri dashboard" `
    -Method "GET" `
    -Url "/api/dashboard/$MaitriId" | Out-Null

Test-Api `
    -Name "Bharati dashboard" `
    -Method "GET" `
    -Url "/api/dashboard/$BharatiId" | Out-Null

Test-Api `
    -Name "Current station health" `
    -Method "GET" `
    -Url "/api/health/current" | Out-Null

Test-Api `
    -Name "Station comparison" `
    -Method "GET" `
    -Url "/api/comparison/stations" | Out-Null

# ------------------------------------------------------------
# 11. HISTORICAL TELEMETRY
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== HISTORICAL TELEMETRY ==========" -ForegroundColor Yellow

foreach ($station in @("MAITRI", "BHARATI")) {

    Test-Api `
        -Name "Environment telemetry $station" `
        -Method "GET" `
        -Url "/api/telemetry/environment/${station}?limit=5" | Out-Null

    Test-Api `
        -Name "Energy telemetry $station" `
        -Method "GET" `
        -Url "/api/telemetry/energy/${station}?limit=5" | Out-Null

    Test-Api `
        -Name "Fuel telemetry $station" `
        -Method "GET" `
        -Url "/api/telemetry/fuel/${station}?limit=5" | Out-Null

    Test-Api `
        -Name "Equipment telemetry $station" `
        -Method "GET" `
        -Url "/api/telemetry/equipment/${station}?limit=5" | Out-Null

    Test-Api `
        -Name "Operations telemetry $station" `
        -Method "GET" `
        -Url "/api/telemetry/operations/${station}?limit=5" | Out-Null

    Test-Api `
        -Name "Inventory telemetry $station" `
        -Method "GET" `
        -Url "/api/telemetry/inventory/${station}?limit=5" | Out-Null
}

# ------------------------------------------------------------
# 12. TELEMETRY SIMULATOR
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== TELEMETRY SIMULATOR ==========" -ForegroundColor Yellow

Test-Api `
    -Name "Simulator test loader" `
    -Method "GET" `
    -Url "/api/simulator/test" | Out-Null

Test-Api `
    -Name "Simulator snapshot" `
    -Method "GET" `
    -Url "/api/simulator/snapshot" | Out-Null

Test-Api `
    -Name "Simulator current snapshot" `
    -Method "GET" `
    -Url "/api/simulator/current" | Out-Null

Test-Api `
    -Name "Simulator status" `
    -Method "GET" `
    -Url "/api/simulator/status" | Out-Null

Test-Api `
    -Name "Set simulator speed" `
    -Method "POST" `
    -Url "/api/simulator/speed?value=1.0" | Out-Null

Test-Api `
    -Name "Switch simulator station" `
    -Method "POST" `
    -Url "/api/simulator/station/MAITRI" | Out-Null

Test-Api `
    -Name "Start simulator" `
    -Method "POST" `
    -Url "/api/simulator/start?station=MAITRI" | Out-Null

Test-Api `
    -Name "Pause simulator" `
    -Method "POST" `
    -Url "/api/simulator/pause" | Out-Null

Test-Api `
    -Name "Reset simulator" `
    -Method "POST" `
    -Url "/api/simulator/reset" | Out-Null

# ------------------------------------------------------------
# 13. MODEL VERSIONS
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== MODEL VERSIONS ==========" -ForegroundColor Yellow

foreach ($modelType in @("ENERGY", "FUEL", "ENVIRONMENT", "EQUIPMENT")) {

    Test-Api `
        -Name "Model versions $modelType" `
        -Method "GET" `
        -Url "/api/model-versions/$modelType" | Out-Null

    Test-Api `
        -Name "Active model versions $modelType" `
        -Method "GET" `
        -Url "/api/model-versions/$modelType/active" | Out-Null
}

# ------------------------------------------------------------
# 14. ML PREDICTIONS
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== ML PREDICTIONS ==========" -ForegroundColor Yellow

# LocalDateTime format required by Java backend:
# yyyy-MM-ddTHH:mm:ss
$predictionTimestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")

$predictionBody = @{
    station = "MAITRI"

    timestamp = $predictionTimestamp

    features = @{
        temperatureC = -20.0
        humidityPct = 65.0
        windResourceIndex = 0.7
        batteryPercentage = 80.0
        fuelPercentage = 75.0
        generatorLoadPct = 55.0
        totalConsumptionKw = 120.0
    }

    horizonHours = 24
} | ConvertTo-Json -Depth 10

Write-Host "Prediction timestamp: $predictionTimestamp" -ForegroundColor DarkCyan

$energyPrediction = Test-Api `
    -Name "Energy prediction" `
    -Method "POST" `
    -Url "/api/predictions/energy" `
    -ExpectedStatus @(200) `
    -Body $predictionBody

$fuelPrediction = Test-Api `
    -Name "Fuel prediction" `
    -Method "POST" `
    -Url "/api/predictions/fuel" `
    -ExpectedStatus @(200) `
    -Body $predictionBody

$environmentPrediction = Test-Api `
    -Name "Environment prediction" `
    -Method "POST" `
    -Url "/api/predictions/environment" `
    -ExpectedStatus @(200) `
    -Body $predictionBody

$equipmentPrediction = Test-Api `
    -Name "Equipment prediction" `
    -Method "POST" `
    -Url "/api/predictions/equipment" `
    -ExpectedStatus @(200) `
    -Body $predictionBody

Test-Api `
    -Name "Current energy prediction" `
    -Method "POST" `
    -Url "/api/predictions/energy/current?horizonHours=24" | Out-Null

Test-Api `
    -Name "Current fuel prediction" `
    -Method "POST" `
    -Url "/api/predictions/fuel/current?horizonHours=24" | Out-Null

Test-Api `
    -Name "Current environment prediction" `
    -Method "POST" `
    -Url "/api/predictions/environment/current?horizonHours=24" | Out-Null

Test-Api `
    -Name "Current equipment prediction" `
    -Method "POST" `
    -Url "/api/predictions/equipment/current?horizonHours=24" | Out-Null

Test-Api `
    -Name "Energy prediction history" `
    -Method "GET" `
    -Url "/api/predictions/energy/history/$MaitriId" | Out-Null

Test-Api `
    -Name "Fuel prediction history" `
    -Method "GET" `
    -Url "/api/predictions/fuel/history/$MaitriId" | Out-Null

Test-Api `
    -Name "Environment prediction history" `
    -Method "GET" `
    -Url "/api/predictions/environment/history/$MaitriId" | Out-Null

Test-Api `
    -Name "Equipment prediction history" `
    -Method "GET" `
    -Url "/api/predictions/equipment/history/$MaitriId" | Out-Null

# ------------------------------------------------------------
# 15. PREDICTION RISK
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== PREDICTION RISK ==========" -ForegroundColor Yellow

$prediction = Get-Json $energyPrediction

$risk = $null

if ($prediction) {

    $riskResponse = Test-Api `
        -Name "Evaluate prediction risk" `
        -Method "POST" `
        -Url "/api/prediction-risk" `
        -ExpectedStatus @(200) `
        -Body ($prediction | ConvertTo-Json -Depth 10)

    $risk = Get-Json $riskResponse
}
else {
    Write-Host "[SKIP] Prediction risk - energy prediction unavailable" -ForegroundColor DarkYellow
}

# ------------------------------------------------------------
# 16. PREDICTION RECOMMENDATION / ALERT
# ------------------------------------------------------------

if ($risk) {

    Test-Api `
        -Name "Prediction recommendation" `
        -Method "POST" `
        -Url "/api/prediction-recommendations" `
        -ExpectedStatus @(200) `
        -Body ($risk | ConvertTo-Json -Depth 10) | Out-Null

    Test-Api `
        -Name "Predictive alert" `
        -Method "POST" `
        -Url "/api/predictive-alerts" `
        -ExpectedStatus @(200,204) `
        -Body ($risk | ConvertTo-Json -Depth 10) | Out-Null
}
else {
    Write-Host "[SKIP] Prediction recommendation - risk unavailable" -ForegroundColor DarkYellow
    Write-Host "[SKIP] Predictive alert - risk unavailable" -ForegroundColor DarkYellow
}

# ------------------------------------------------------------
# 17. FUTURE HEALTH
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== FUTURE HEALTH ==========" -ForegroundColor Yellow

if ($risk) {

    $futureHealthBody = @{
        energyRisk       = $risk
        fuelRisk         = $risk
        environmentRisk  = $risk
        equipmentRisk    = $risk
    } | ConvertTo-Json -Depth 10

    Test-Api `
        -Name "Future health score" `
        -Method "POST" `
        -Url "/api/future-health" `
        -ExpectedStatus @(200) `
        -Body $futureHealthBody | Out-Null
}
else {
    Write-Host "[SKIP] Future health - risk unavailable" -ForegroundColor DarkYellow
}

# ------------------------------------------------------------
# 18. PREDICTION STATION COMPARISON
# ------------------------------------------------------------

if ($risk) {

    $comparisonBody = @{
        maitriEnergyRisk       = $risk
        maitriFuelRisk         = $risk
        maitriEnvironmentRisk  = $risk
        maitriEquipmentRisk    = $risk
        bharatiEnergyRisk      = $risk
        bharatiFuelRisk        = $risk
        bharatiEnvironmentRisk = $risk
        bharatiEquipmentRisk   = $risk
    } | ConvertTo-Json -Depth 10

    Test-Api `
        -Name "Prediction station comparison" `
        -Method "POST" `
        -Url "/api/prediction-comparison" `
        -ExpectedStatus @(200) `
        -Body $comparisonBody | Out-Null
}
else {
    Write-Host "[SKIP] Prediction comparison - risk unavailable" -ForegroundColor DarkYellow
}

# ------------------------------------------------------------
# 19. SIMULATION SCENARIOS
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== SIMULATION ==========" -ForegroundColor Yellow

$scenarioBody = @{
    station = "MAITRI"

    scenarioName = "API Automated Test Scenario"

    description = "Created by ANTARIS API test suite"

    horizonHours = 24

    changes = @{
        temperatureChangeC = 2.0
        humidityChangePct = 5.0
        windResourceChange = -0.1
        generatorAvailabilityChangePct = -5.0
        fuelChangePct = -10.0
        batteryChangePct = -5.0
        consumptionChangePct = 10.0
    }
} | ConvertTo-Json -Depth 10

$scenarioResponse = Test-Api `
    -Name "Create simulation scenario" `
    -Method "POST" `
    -Url "/api/simulation/scenarios" `
    -ExpectedStatus @(200,201) `
    -Body $scenarioBody

$scenario = Get-Json $scenarioResponse
$ScenarioId = $null

if ($scenario -and $scenario.id) {
    $ScenarioId = $scenario.id
    Write-Host "Created Scenario ID: $ScenarioId" -ForegroundColor Cyan
}

Test-Api `
    -Name "Get all scenarios" `
    -Method "GET" `
    -Url "/api/simulation/scenarios" | Out-Null

Test-Api `
    -Name "Get Maitri scenarios" `
    -Method "GET" `
    -Url "/api/simulation/scenarios/station/MAITRI" | Out-Null

if ($ScenarioId) {

    Test-Api `
        -Name "Get scenario by ID" `
        -Method "GET" `
        -Url "/api/simulation/scenarios/$ScenarioId" | Out-Null

    Test-Api `
        -Name "Run simulation scenario" `
        -Method "POST" `
        -Url "/api/simulation/scenarios/$ScenarioId/run" | Out-Null
}
else {
    Write-Host "[SKIP] Get scenario by ID - scenario creation failed" -ForegroundColor DarkYellow
    Write-Host "[SKIP] Run simulation scenario - scenario creation failed" -ForegroundColor DarkYellow
}

# ------------------------------------------------------------
# 20. DECISION ENGINE
# ------------------------------------------------------------

Write-Host ""
Write-Host "========== DECISION ENGINE ==========" -ForegroundColor Yellow

$impactBody = @{
    temperatureDeltaC = 2.0
    energyConsumptionDeltaKw = 12.0
    generatorLoadDeltaPct = 8.0
    fuelConsumptionDeltaLph = 1.5
    fuelPercentageDelta = -10.0
    batteryPercentageDelta = -5.0
} | ConvertTo-Json

Test-Api `
    -Name "Simulation decision" `
    -Method "POST" `
    -Url "/api/simulation/decision" `
    -ExpectedStatus @(200) `
    -Body $impactBody | Out-Null

Test-Api `
    -Name "Simulation recommendations" `
    -Method "POST" `
    -Url "/api/simulation/recommendations" `
    -ExpectedStatus @(200) `
    -Body $impactBody | Out-Null

Test-Api `
    -Name "Simulation explanation" `
    -Method "POST" `
    -Url "/api/simulation/explanation" `
    -ExpectedStatus @(200) `
    -Body $impactBody | Out-Null

# ------------------------------------------------------------
# 21. SCENARIO COMPARISON
# ------------------------------------------------------------

$scenario1 = @{
    station = "MAITRI"
    scenarioName = "Comparison Scenario A"
    description = "API test scenario A"
    horizonHours = 24

    changes = @{
        temperatureChangeC = 1.0
        humidityChangePct = 2.0
        windResourceChange = 0.1
        generatorAvailabilityChangePct = 0.0
        fuelChangePct = -5.0
        batteryChangePct = -2.0
        consumptionChangePct = 5.0
    }
}

$scenario2 = @{
    station = "MAITRI"
    scenarioName = "Comparison Scenario B"
    description = "API test scenario B"
    horizonHours = 48

    changes = @{
        temperatureChangeC = 3.0
        humidityChangePct = 5.0
        windResourceChange = -0.2
        generatorAvailabilityChangePct = -10.0
        fuelChangePct = -15.0
        batteryChangePct = -10.0
        consumptionChangePct = 15.0
    }
}

$scenarioListBody = @($scenario1, $scenario2) |
    ConvertTo-Json -Depth 10

Test-Api `
    -Name "Compare simulation scenarios" `
    -Method "POST" `
    -Url "/api/simulation/comparison/MAITRI" `
    -ExpectedStatus @(200) `
    -Body $scenarioListBody | Out-Null

Test-Api `
    -Name "Compare simulation scenario pair" `
    -Method "POST" `
    -Url "/api/simulation/comparison/MAITRI/pair" `
    -ExpectedStatus @(200) `
    -Body $scenarioListBody | Out-Null

# ------------------------------------------------------------
# 22. DELETE TEST SCENARIO
# ------------------------------------------------------------

if ($ScenarioId) {

    Test-Api `
        -Name "Delete test scenario" `
        -Method "DELETE" `
        -Url "/api/simulation/scenarios/$ScenarioId" `
        -ExpectedStatus @(200,204) | Out-Null
}

# ------------------------------------------------------------
# FINAL REPORT
# ------------------------------------------------------------

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "              TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "PASSED : $Passed" -ForegroundColor Green
Write-Host "FAILED : $Failed" -ForegroundColor Red
Write-Host "TOTAL  : $($Passed + $Failed)"
Write-Host ""

if ($Results.Count -gt 0) {
    $Results | Format-Table -AutoSize
}

Write-Host "============================================" -ForegroundColor Cyan

if ($Failed -eq 0) {
    Write-Host "ALL API TESTS PASSED" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    exit 0
}
else {
    Write-Host "SOME API TESTS FAILED" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Cyan
    exit 1
}