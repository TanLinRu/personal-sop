# verify-frontend.ps1
# Usage: powershell -ExecutionPolicy Bypass -File .claude/scripts/verify-frontend.ps1 -projectDir ".\frontend" -waitSeconds 15

param(
    [string]$projectDir = ".\frontend",
    [int]$waitSeconds = 15,
    [string]$host = "localhost",
    [int]$port = 3000
)

$ErrorActionPreference = "Stop"

Write-Host "[verify-frontend] Starting frontend verification..." -ForegroundColor Cyan
Write-Host "[verify-frontend] Project: $projectDir" -ForegroundColor Gray

# Check project exists
if (-not (Test-Path $projectDir)) {
    Write-Host "[verify-frontend] ERROR: Project directory not found: $projectDir" -ForegroundColor Red
    exit 1
}

# Check for package.json
if (-not (Test-Path "$projectDir\package.json")) {
    Write-Host "[verify-frontend] ERROR: Not a Node.js project (no package.json)" -ForegroundColor Red
    exit 1
}

$fail = $false
$appPid = $null
$npm = $null

try {
    # Step 1: Install dependencies
    Write-Host "[verify-frontend] Step 1: Installing dependencies..." -ForegroundColor Yellow

    $npm = Start-Process -FilePath "npm" -ArgumentList "install", "--silent" -PassThru -WorkingDirectory $projectDir
    $npm.WaitForExit()
    if ($npm.ExitCode -ne 0) {
        Write-Host "[verify-frontend] ERROR: npm install failed" -ForegroundColor Red
        $fail = $true
    }

    if ($fail) { exit 1 }

    # Step 2: Start dev server (background)
    Write-Host "[verify-frontend] Step 2: Starting dev server..." -ForegroundColor Yellow

    $app = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WorkingDirectory $projectDir -RedirectStandardOutput "$projectDir\dev.log" -RedirectStandardError "$projectDir\dev.err"

    $appPid = $app.Id
    Write-Host "[verify-frontend] Started with PID: $appPid" -ForegroundColor Gray

    # Step 3: Wait for startup
    Write-Host "[verify-frontend] Step 3: Waiting ${waitSeconds}s for startup..." -ForegroundColor Yellow

    $started = $false
    for ($i = 0; $i -lt $waitSeconds; $i++) {
        Start-Sleep -Seconds 1

        try {
            $response = Invoke-WebRequest "http://${host}:${port}" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "[verify-frontend] Dev server started successfully" -ForegroundColor Green
                $started = $true
                break
            }
        } catch {
            Write-Host "[verify-frontend] Waiting... ($i/$waitSeconds)" -ForegroundColor Gray
        }
    }

    if (-not $started) {
        Write-Host "[verify-frontend] ERROR: Dev server failed to start within ${waitSeconds}s" -ForegroundColor Red
        $fail = $true
    }

    # Step 4: Verify response
    if ($started) {
        Write-Host "[verify-frontend] Step 4: Page access check..." -ForegroundColor Yellow

        try {
            $response = Invoke-WebRequest "http://${host}:${port}" -TimeoutSec 5
            Write-Host "[verify-frontend] Status: $($response.StatusCode)" -ForegroundColor $(if ($response.StatusCode -eq 200) { "Green" } else { "Yellow" })
        } catch {
            Write-Host "[verify-frontend] WARN: Page request failed" -ForegroundColor Yellow
        }
    }

} finally {
    # Cleanup: Stop application
    if ($appPid -and -not $fail) {
        Write-Host "[verify-frontend] Stopping dev server..." -ForegroundColor Cyan
        Stop-Process -Id $appPid -Force -ErrorAction SilentlyContinue
    }
}

if ($fail) {
    Write-Host "[verify-frontend] FAILED" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[verify-frontend] PASSED" -ForegroundColor Green
    exit 0
}