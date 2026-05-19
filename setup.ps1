# Cascadex Setup Script (PowerShell)
# Usage: .\setup.ps1

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  CASCADEX - Project Setup"  -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. FastAPI Backend venv
Write-Host "[1/3] Setting up FastAPI backend venv..."  -ForegroundColor Yellow
$apiDir = Join-Path $ProjectRoot "packages\api"
$apiVenv = Join-Path $apiDir "venv"
if (-not (Test-Path $apiVenv)) {
    python -m venv $apiVenv
    Write-Host "  Created venv at $apiVenv"  -ForegroundColor Green
}
else {
    Write-Host "  venv already exists"  -ForegroundColor DarkGray
}
$apiPip = Join-Path $apiVenv "Scripts\pip.exe"
$apiReqs = Join-Path $apiDir "requirements.txt"
& $apiPip install -r $apiReqs --quiet
Write-Host "  Installed API dependencies."  -ForegroundColor Green

# 2. Data Pipeline venv
Write-Host "[2/3] Setting up data pipeline venv..."  -ForegroundColor Yellow
$pipelineDir = Join-Path $ProjectRoot "apps\pipeline"
$pipelineVenv = Join-Path $pipelineDir "venv"
if (-not (Test-Path $pipelineVenv)) {
    python -m venv $pipelineVenv
    Write-Host "  Created venv at $pipelineVenv"  -ForegroundColor Green
}
else {
    Write-Host "  venv already exists"  -ForegroundColor DarkGray
}
$pipePip = Join-Path $pipelineVenv "Scripts\pip.exe"
$pipeReqs = Join-Path $pipelineDir "requirements.txt"
& $pipePip install -r $pipeReqs --quiet
Write-Host "  Installed pipeline dependencies."  -ForegroundColor Green

# 3. Graph Utilities venv
Write-Host "[3/3] Setting up graph utilities venv..."  -ForegroundColor Yellow
$graphDir = Join-Path $ProjectRoot "packages\graph"
$graphVenv = Join-Path $graphDir "venv"
if (-not (Test-Path $graphVenv)) {
    python -m venv $graphVenv
    Write-Host "  Created venv at $graphVenv"  -ForegroundColor Green
}
else {
    Write-Host "  venv already exists"  -ForegroundColor DarkGray
}
$graphPip = Join-Path $graphVenv "Scripts\pip.exe"
$graphReqs = Join-Path $graphDir "requirements.txt"
& $graphPip install -r $graphReqs --quiet
Write-Host "  Installed graph dependencies."  -ForegroundColor Green

# 4. Copy .env if missing
$envFile = Join-Path $ProjectRoot ".env"
$envExample = Join-Path $ProjectRoot ".env.example"
if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "  Created .env from .env.example"  -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Green
Write-Host "  Setup complete!"  -ForegroundColor Green
Write-Host "========================================"  -ForegroundColor Green
Write-Host ""
