# Cascadex — Setup Script (PowerShell)
# Run this once to create all Python virtual environments and install dependencies.
# Usage: .\setup.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CASCADEX — Project Setup" -ForegroundColor Cyan
Write-Host "  Drug Metabolic Pathway Intelligence" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = $PSScriptRoot

# --- 1. FastAPI Backend venv ---
Write-Host "[1/3] Setting up FastAPI backend venv..." -ForegroundColor Yellow
$apiDir = Join-Path $ProjectRoot "packages\api"
$apiVenv = Join-Path $apiDir "venv"
if (!(Test-Path $apiVenv)) {
    python -m venv $apiVenv
    Write-Host "  Created venv at $apiVenv" -ForegroundColor Green
} else {
    Write-Host "  venv already exists at $apiVenv" -ForegroundColor DarkGray
}
& "$apiVenv\Scripts\pip.exe" install -r "$apiDir\requirements.txt" --quiet
Write-Host "  Installed API dependencies." -ForegroundColor Green

# --- 2. Data Pipeline venv ---
Write-Host "[2/3] Setting up data pipeline venv..." -ForegroundColor Yellow
$pipelineDir = Join-Path $ProjectRoot "apps\pipeline"
$pipelineVenv = Join-Path $pipelineDir "venv"
if (!(Test-Path $pipelineVenv)) {
    python -m venv $pipelineVenv
    Write-Host "  Created venv at $pipelineVenv" -ForegroundColor Green
} else {
    Write-Host "  venv already exists at $pipelineVenv" -ForegroundColor DarkGray
}
& "$pipelineVenv\Scripts\pip.exe" install -r "$pipelineDir\requirements.txt" --quiet
Write-Host "  Installed pipeline dependencies." -ForegroundColor Green

# --- 3. Graph Utilities venv ---
Write-Host "[3/3] Setting up graph utilities venv..." -ForegroundColor Yellow
$graphDir = Join-Path $ProjectRoot "packages\graph"
$graphVenv = Join-Path $graphDir "venv"
if (!(Test-Path $graphVenv)) {
    python -m venv $graphVenv
    Write-Host "  Created venv at $graphVenv" -ForegroundColor Green
} else {
    Write-Host "  venv already exists at $graphVenv" -ForegroundColor DarkGray
}
& "$graphVenv\Scripts\pip.exe" install -r "$graphDir\requirements.txt" --quiet
Write-Host "  Installed graph dependencies." -ForegroundColor Green

# --- 4. Copy .env if missing ---
$envFile = Join-Path $ProjectRoot ".env"
$envExample = Join-Path $ProjectRoot ".env.example"
if (!(Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host ""
    Write-Host "  Created .env from .env.example — FILL IN YOUR KEYS!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Fill in your API keys in .env" -ForegroundColor White
Write-Host "  2. Activate a venv:" -ForegroundColor White
Write-Host "       API:      packages\api\venv\Scripts\Activate.ps1" -ForegroundColor DarkGray
Write-Host "       Pipeline: apps\pipeline\venv\Scripts\Activate.ps1" -ForegroundColor DarkGray
Write-Host "       Graph:    packages\graph\venv\Scripts\Activate.ps1" -ForegroundColor DarkGray
Write-Host "  3. Start the API server:" -ForegroundColor White
Write-Host "       cd packages\api && uvicorn main:app --reload" -ForegroundColor DarkGray
Write-Host ""
