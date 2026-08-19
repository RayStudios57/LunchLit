# Auto Git Sync script for LunchLit workspace
$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH
$WorkspacePath = "c:\Users\krish_vcht8fe\Downloads\LunchLit-main (2)"
Set-Location $WorkspacePath

Write-Host "Starting Auto Git Sync Watcher for $WorkspacePath..."

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $WorkspacePath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::DirectoryName

$script:pendingChange = $false
$script:lastChangeTime = [System.DateTime]::MinValue

$action = {
    param($sender, $e)
    $path = $e.FullPath
    if ($path -match "\\\.git\\" -or $path -match "\\node_modules\\" -or $path -match "\\dist\\") {
        return
    }
    $script:pendingChange = $true
    $script:lastChangeTime = [System.DateTime]::Now
}

Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null
Register-ObjectEvent $watcher "Renamed" -Action $action | Out-Null

Write-Host "Watcher active. Monitoring for saved changes..."

while ($true) {
    Start-Sleep -Seconds 2
    if ($script:pendingChange -and ([System.DateTime]::Now - $script:lastChangeTime).TotalSeconds -ge 2) {
        $script:pendingChange = $false
        
        # Check git status
        $status = git status --porcelain
        if ($status) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Write-Host "[$timestamp] Changes detected. Staging, committing, and pushing..."
            git add -A
            git commit -m "Auto-commit: saved changes ($timestamp)"
            git push origin main
        }
    }
}
