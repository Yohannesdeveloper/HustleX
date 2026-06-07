# HustleX scale setup for Windows
# Run from backend/:  powershell -ExecutionPolicy Bypass -File scripts/setup-scale.ps1

Write-Host "HustleX scale setup" -ForegroundColor Cyan
Write-Host ""

# 1. Check Redis on port 6379
$redisUp = $false
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("127.0.0.1", 6379)
  $tcp.Close()
  $redisUp = $true
  Write-Host "[OK] Redis is running on localhost:6379" -ForegroundColor Green
} catch {
  Write-Host "[!!] Redis not running on port 6379" -ForegroundColor Yellow
  Write-Host "     Install one of:" -ForegroundColor Gray
  Write-Host "       - Docker Desktop, then: npm run scale:redis" -ForegroundColor Gray
  Write-Host "       - Memurai Developer: winget install Memurai.MemuraiDeveloper" -ForegroundColor Gray
  Write-Host "       - WSL: sudo apt install redis-server && redis-server" -ForegroundColor Gray
}

# 2. Create DB indexes
Write-Host ""
Write-Host "Creating MongoDB indexes..." -ForegroundColor Cyan
npm run scale:indexes
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Scale config applied. Start services:" -ForegroundColor Green
Write-Host "  Terminal 1: npm run dev:stable    (API)" -ForegroundColor White
Write-Host "  Terminal 2: npm run worker          (background jobs)" -ForegroundColor White
if (-not $redisUp) {
  Write-Host ""
  Write-Host "Start Redis first, then re-run the worker." -ForegroundColor Yellow
}
