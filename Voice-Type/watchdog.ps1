# Voice-Type Service Watchdog
# Monitors and auto-restarts STT (Parakeet), TTS (Edge TTS), and Cloudflare tunnel
# Run with: powershell -ExecutionPolicy Bypass -File watchdog.ps1

$ErrorActionPreference = "Continue"

# Configuration
$STTScript = "D:/Projects/Ai/Liquid-Stories/Voice-Type/main.py"
$TTSScript = "D:/Projects/Ai/Liquid-Stories/Voice-Type/tts_edge_server.py"
$CloudflaredExe = "C:/Program Files (x86)/cloudflared/cloudflared.exe"
$TunnelName = "voice-type"
$CheckIntervalSeconds = 30
$LogFile = "D:/Projects/Ai/Liquid-Stories/Voice-Type/watchdog.log"

# Notification Configuration
# Set to $null to disable, or set your webhook URL
$WebhookUrl = $null  # Example: "https://discord.com/api/webhooks/xxx" or "https://hooks.slack.com/xxx"
$EnableToastNotifications = $true

# Process names to monitor
$PythonProcessName = "python"
$CloudflaredProcessName = "cloudflared"

# Setup System Tray notification icon
$global:NotifyIcon = $null
if ($EnableToastNotifications) {
    try {
        Add-Type -AssemblyName System.Windows.Forms
        $global:NotifyIcon = New-Object System.Windows.Forms.NotifyIcon
        $global:NotifyIcon.Icon = [System.Drawing.SystemIcons]::Information
        $global:NotifyIcon.Text = "Voice-Type Watchdog"
        $global:NotifyIcon.Visible = $true
    } catch {
        Write-Host "System tray notifications not available: $_"
    }
}

function Send-Notification {
    param(
        [string]$Title,
        [string]$Message,
        [string]$Type = "Warning"  # Warning, Error, Info
    )

    # Windows Balloon Notification (works on all Windows versions)
    if ($EnableToastNotifications -and $global:NotifyIcon) {
        try {
            $iconType = switch ($Type) {
                "Error" { [System.Windows.Forms.ToolTipIcon]::Error }
                "Warning" { [System.Windows.Forms.ToolTipIcon]::Warning }
                "Info" { [System.Windows.Forms.ToolTipIcon]::Info }
                default { [System.Windows.Forms.ToolTipIcon]::None }
            }
            $global:NotifyIcon.ShowBalloonTip(5000, $Title, $Message, $iconType)
        } catch {
            Write-Log "Failed to show notification: $_"
        }
    }

    # Webhook Notification (Discord/Slack compatible)
    if ($WebhookUrl) {
        try {
            $emoji = switch ($Type) {
                "Error" { ":red_circle:" }
                "Warning" { ":warning:" }
                "Info" { ":information_source:" }
                default { ":bell:" }
            }

            $body = @{
                content = "$emoji **$Title**`n$Message"
            } | ConvertTo-Json

            Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        } catch {
            Write-Log "Failed to send webhook notification: $_"
        }
    }
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LogFile -Value $logMessage
}

function Test-STTServiceHealth {
    # Check if STT (Parakeet) server is responding on port 8000
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Test-TTSServiceHealth {
    # Check if TTS (Edge TTS) server is responding on port 8001
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Start-STTServer {
    Write-Log "Starting STT (Parakeet) server on port 8000..."
    $process = Start-Process -FilePath "python" -ArgumentList $STTScript -PassThru -WindowStyle Minimized
    Write-Log "Started STT server (PID: $($process.Id))"
    return $process
}

function Start-TTSServer {
    Write-Log "Starting TTS (Edge TTS) server on port 8001..."
    $process = Start-Process -FilePath "uvicorn" -ArgumentList "tts_edge_server:app --host 0.0.0.0 --port 8001" -WorkingDirectory "D:/Projects/Ai/Liquid-Stories/Voice-Type" -PassThru -WindowStyle Minimized
    Write-Log "Started TTS server (PID: $($process.Id))"
    return $process
}

function Start-CloudflareTunnel {
    Write-Log "Starting Cloudflare tunnel..."
    $process = Start-Process -FilePath $CloudflaredExe -ArgumentList "tunnel run $TunnelName" -PassThru -WindowStyle Minimized
    Write-Log "Started Cloudflare tunnel (PID: $($process.Id))"
    return $process
}

function Get-STTServerProcess {
    # Check if STT health endpoint responds - most reliable indicator
    Test-STTServiceHealth
}

function Get-TTSServerProcess {
    # Check if TTS health endpoint responds - most reliable indicator
    Test-TTSServiceHealth
}

function Get-CloudflaredProcess {
    # Check if any cloudflared process is running
    $proc = Get-Process -Name $CloudflaredProcessName -ErrorAction SilentlyContinue
    return ($proc -ne $null)
}

# Main watchdog loop
Write-Log "========================================="
Write-Log "Voice-Type Watchdog Started"
Write-Log "Monitoring: STT (port 8000), TTS (port 8001), Cloudflare tunnel"
Write-Log "Monitoring interval: ${CheckIntervalSeconds}s"
Write-Log "Toast notifications: $EnableToastNotifications"
Write-Log "Webhook: $(if ($WebhookUrl) { 'Configured' } else { 'Disabled' })"
Write-Log "========================================="

# Kill any existing watchdog instances (prevent stacking)
$currentPid = $PID
$existingWatchdogs = Get-WmiObject Win32_Process | Where-Object {
    $_.CommandLine -like "*watchdog.ps1*" -and $_.ProcessId -ne $currentPid
}
foreach ($proc in $existingWatchdogs) {
    Write-Log "Killing existing watchdog instance (PID: $($proc.ProcessId))"
    Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
}

# Also kill any orphaned cmd.exe windows that launched old watchdogs
$cmdProcesses = Get-WmiObject Win32_Process | Where-Object {
    $_.Name -eq "cmd.exe" -and $_.CommandLine -like "*watchdog*"
}
foreach ($proc in $cmdProcesses) {
    # Don't kill our parent
    $parentOfCurrent = (Get-WmiObject Win32_Process -Filter "ProcessId=$currentPid").ParentProcessId
    if ($proc.ProcessId -ne $parentOfCurrent) {
        Write-Log "Killing orphaned cmd window (PID: $($proc.ProcessId))"
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

Send-Notification -Title "Watchdog Started" -Message "STT, TTS, and tunnel services are being monitored. You'll be notified of any crashes." -Type "Info"

# Force fresh start - kill any existing processes on our ports to ensure new code is loaded
Write-Log "Clearing existing processes to ensure fresh code..."

# Kill processes using port 8000 (STT)
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $port8000) {
    if ($procId -and $procId -ne 0) {
        Write-Log "Killing process $procId on port 8000"
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

# Kill processes using port 8001 (TTS)
$port8001 = Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $port8001) {
    if ($procId -and $procId -ne 0) {
        Write-Log "Killing process $procId on port 8001"
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2  # Wait for ports to be released

# Initial startup - always start fresh
$sttProc = $null
$ttsProc = $null
$cloudflaredProc = $null

Write-Log "Starting STT server (fresh)..."
Start-STTServer
Start-Sleep -Seconds 5  # Wait for server to initialize

Write-Log "Starting TTS server (fresh)..."
Start-TTSServer
Start-Sleep -Seconds 5  # Wait for server to initialize

# Cloudflare tunnel - only start if not running (tunnel doesn't need code updates)
$cloudflaredRunning = Get-Process -Name $CloudflaredProcessName -ErrorAction SilentlyContinue
if (-not $cloudflaredRunning) {
    Start-CloudflareTunnel
} else {
    Write-Log "Cloudflare tunnel already running (PID: $($cloudflaredRunning.Id))"
}

# Cleanup on exit
$cleanup = {
    if ($global:NotifyIcon) {
        $global:NotifyIcon.Visible = $false
        $global:NotifyIcon.Dispose()
    }
    Write-Log "Watchdog stopped"
}
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null

# Watchdog loop
while ($true) {
    Start-Sleep -Seconds $CheckIntervalSeconds

    # Check if STT server is healthy (responds to /health on port 8000)
    $sttHealthy = Test-STTServiceHealth
    if (-not $sttHealthy) {
        Write-Log "ERROR: STT server not responding! Restarting..."
        Send-Notification -Title "STT Server Down!" -Message "Parakeet transcription server not responding. Auto-restarting..." -Type "Error"

        # Kill any existing python processes that might be hung
        Get-Process -Name $PythonProcessName -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*main.py*" } | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2

        Start-STTServer
        Start-Sleep -Seconds 5

        # Verify restart succeeded
        if (Test-STTServiceHealth) {
            Write-Log "STT server restarted successfully"
            Send-Notification -Title "STT Server Restored" -Message "Parakeet server back online." -Type "Info"
        } else {
            Write-Log "WARNING: STT server restart may have failed - health check not passing"
            Send-Notification -Title "STT Server Issue" -Message "Server restarted but health check failing. May need manual intervention." -Type "Warning"
        }
    }

    # Check if TTS server is healthy (responds to /health on port 8001)
    $ttsHealthy = Test-TTSServiceHealth
    if (-not $ttsHealthy) {
        Write-Log "ERROR: TTS server not responding! Restarting..."
        Send-Notification -Title "TTS Server Down!" -Message "Edge TTS server not responding. Auto-restarting..." -Type "Error"

        # Kill any existing python/uvicorn processes that might be hung
        Get-Process -Name $PythonProcessName -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*tts_edge_server.py*" } | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2

        Start-TTSServer
        Start-Sleep -Seconds 5

        # Verify restart succeeded
        if (Test-TTSServiceHealth) {
            Write-Log "TTS server restarted successfully"
            Send-Notification -Title "TTS Server Restored" -Message "Edge TTS server back online." -Type "Info"
        } else {
            Write-Log "WARNING: TTS server restart may have failed - health check not passing"
            Send-Notification -Title "TTS Server Issue" -Message "Server restarted but health check failing. May need manual intervention." -Type "Warning"
        }
    }

    # Check if Cloudflared is running
    $cloudflaredProc = Get-Process -Name $CloudflaredProcessName -ErrorAction SilentlyContinue
    if (-not $cloudflaredProc) {
        Write-Log "ERROR: Cloudflare tunnel crashed! Restarting..."
        Send-Notification -Title "Tunnel Crashed!" -Message "Cloudflare tunnel stopped unexpectedly. Users cannot connect. Auto-restarting..." -Type "Error"
        Start-CloudflareTunnel
        Start-Sleep -Seconds 3
        Write-Log "Cloudflare tunnel restarted"
        Send-Notification -Title "Tunnel Restored" -Message "Cloudflare tunnel back online." -Type "Info"
    }

    # Periodic status log (every 5 minutes)
    if ((Get-Date).Minute % 5 -eq 0 -and (Get-Date).Second -lt $CheckIntervalSeconds) {
        Write-Log "Status: STT=$sttHealthy, TTS=$ttsHealthy, Cloudflare=$($cloudflaredProc -ne $null)"
    }
}
