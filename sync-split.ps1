# ============================================================
#  sync-split.ps1 — Auto-sync watcher for number-guessing-
#  Watches index.html and re-extracts CSS + JS into split/
#  whenever the file is saved.
#  Usage: Right-click → "Run with PowerShell"
#         or: powershell -ExecutionPolicy Bypass -File sync-split.ps1
# ============================================================

$root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcFile   = Join-Path $root "index.html"
$splitDir  = Join-Path $root "split"

function Sync-Split {
    try {
        $src = Get-Content $srcFile -Raw -Encoding UTF8

        # Extract content between <style>…</style>
        $css = [regex]::Match($src, '(?s)<style>(.*?)</style>').Groups[1].Value.Trim()
        # Extract content between <script>…</script>
        $js  = [regex]::Match($src, '(?s)<script>(.*?)</script>').Groups[1].Value.Trim()

        # Build clean split HTML (replace embedded blocks with external links)
        $html = $src `
            -replace '(?s)<style>.*?</style>',   '    <link rel="stylesheet" href="style.css" />' `
            -replace '(?s)<script>.*?</script>',  '    <script src="script.js"></script>'

        if (-not (Test-Path $splitDir)) {
            New-Item -ItemType Directory -Path $splitDir | Out-Null
        }

        Set-Content (Join-Path $splitDir "style.css")  -Value $css  -Encoding UTF8
        Set-Content (Join-Path $splitDir "script.js")  -Value $js   -Encoding UTF8
        Set-Content (Join-Path $splitDir "index.html") -Value $html -Encoding UTF8

        $ts = Get-Date -Format "HH:mm:ss"
        Write-Host "[$ts] OK  split/ synced  (css=$(($css.Length/1KB).ToString('F1'))KB  js=$(($js.Length/1KB).ToString('F1'))KB)" -ForegroundColor Green
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERR Sync error: $_" -ForegroundColor Red
    }
}

# --- initial sync ---
Write-Host ""
Write-Host "  [WATCH] $srcFile" -ForegroundColor Cyan
Write-Host "  [SYNC]  $splitDir" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""
Sync-Split

# --- file system watcher ---
$watcher                     = New-Object System.IO.FileSystemWatcher
$watcher.Path                = $root
$watcher.Filter              = "index.html"
$watcher.NotifyFilter        = [System.IO.NotifyFilters]::LastWrite
$watcher.EnableRaisingEvents = $true

# Debounce: ignore duplicate events fired within 800ms
$script:lastFired = [datetime]::MinValue

$action = {
    $now = [datetime]::Now
    if (($now - $script:lastFired).TotalMilliseconds -gt 800) {
        $script:lastFired = $now
        Start-Sleep -Milliseconds 150   # let the editor finish writing
        Sync-Split
    }
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null

# Keep the script alive
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`nWatcher stopped." -ForegroundColor Yellow
}
