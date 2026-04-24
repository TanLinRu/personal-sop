# verify-backend.ps1
# Usage: powershell -ExecutionPolicy Bypass -File .claude/scripts/verify-backend.ps1 -projectDir ".\backend" -waitSeconds 30

param(
    [string]$projectDir = ".\backend",
    [int]$waitSeconds = 30,
    [string]$host = "localhost",
    [int]$port = 8080
)

$ErrorActionPreference = "Stop"

function Get-CdpErrors($port, $sec) {
    $err = @()
    try {
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $ct = [Threading.CancellationToken]::None
        $ws.ConnectAsync((Invoke-RestMethod "http://$host`:$port/actuator/health" -TimeoutSec 3)._links.self.href -replace "^ws", "http" -replace "/ws", "", $ct).Wait()
        "OK"
    } catch {
        $err += $_.Exception.Message
    }
    $err
}

Write-Host "[verify-backend] Starting backend verification..." -ForegroundColor Cyan
Write-Host "[verify-backend] Project: $projectDir" -ForegroundColor Gray

# Check project exists
if (-not (Test-Path $projectDir)) {
    Write-Host "[verify-backend] ERROR: Project directory not found: $projectDir" -ForegroundColor Red
    exit 1
}

# Check for pom.xml
$isMaven = Test-Path "$projectDir\pom.xml"
$isGradle = Test-Path "$projectDir\build.gradle" -or Test-Path "$projectDir\build.gradle.kts"

if (-not ($isMaven -or $isGradle)) {
    Write-Host "[verify-backend] ERROR: Not a Java project (no pom.xml or build.gradle)" -ForegroundColor Red
    exit 1
}

$start = Get-Date
$fail = $false
$appPid = $null

try {
    # Step 1: Compile
    Write-Host "[verify-backend] Step 1: Compiling..." -ForegroundColor Yellow

    if ($isMaven) {
        $compile = Start-Process -FilePath "mvn" -ArgumentList "clean", "compile", "-q" -PassThru -WorkingDirectory $projectDir
        $compile.WaitForExit()
        if ($compile.ExitCode -ne 0) {
            Write-Host "[verify-backend] ERROR: Maven compile failed" -ForegroundColor Red
            $fail = $true
        }
    } else {
        $compile = Start-Process -FilePath ".\gradlew" -ArgumentList "compileJava", "-q" -PassThru -WorkingDirectory $projectDir
        $compile.WaitForExit()
        if ($compile.ExitCode -ne 0) {
            Write-Host "[verify-backend] ERROR: Gradle compile failed" -ForegroundColor Red
            $fail = $true
        }
    }

    if ($fail) { exit 1 }

    # Step 2: Start application (background)
    Write-Host "[verify-backend] Step 2: Starting application..." -ForegroundColor Yellow

    if ($isMaven) {
        $app = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -PassThru -WorkingDirectory $projectDir -RedirectStandardOutput "$projectDir\target\app.log" -RedirectStandardError "$projectDir\target\app.err"
    } else {
        $app = Start-Process -FilePath ".\gradlew" -ArgumentList "bootRun" -PassThru -WorkingDirectory $projectDir -RedirectStandardOutput "$projectDir\build\app.log" -RedirectStandardError "$projectDir\build\app.err"
    }

    $appPid = $app.Id
    Write-Host "[verify-backend] Started with PID: $appPid" -ForegroundColor Gray

    # Step 3: Wait for startup
    Write-Host "[verify-backend] Step 3: Waiting ${waitSeconds}s for startup..." -ForegroundColor Yellow

    $started = $false
    for ($i = 0; $i -lt $waitSeconds; $i++) {
        Start-Sleep -Seconds 1

        try {
            $health = Invoke-RestMethod "http://${host}:${port}/actuator/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($health.status -eq "UP") {
                Write-Host "[verify-backend] Application started successfully" -ForegroundColor Green
                $started = $true
                break
            }
        } catch {
            Write-Host "[verify-backend] Waiting... ($i/$waitSeconds)" -ForegroundColor Gray
        }
    }

    if (-not $started) {
        Write-Host "[verify-backend] ERROR: Application failed to start within ${waitSeconds}s" -ForegroundColor Red
        $fail = $true
    }

    # Step 4: Health check
    if ($started) {
        Write-Host "[verify-backend] Step 4: Health check..." -ForegroundColor Yellow

        try {
            $health = Invoke-RestMethod "http://${host}:${port}/actuator/health" -TimeoutSec 5
            Write-Host "[verify-backend] Health: $($health.status)" -ForegroundColor $(if ($health.status -eq "UP") { "Green" } else { "Yellow" })
        } catch {
            Write-Host "[verify-backend] WARN: Health endpoint not available" -ForegroundColor Yellow
        }
    }

} finally {
    # Cleanup: Stop application
    if ($appPid -and -not $fail) {
        Write-Host "[verify-backend] Stopping application..." -ForegroundColor Cyan
        Stop-Process -Id $appPid -Force -ErrorAction SilentlyContinue
    }
}

if ($fail) {
    Write-Host "[verify-backend] FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[verify-backend] PASSED" -ForegroundColor Green
    exit 0
}