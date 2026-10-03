# Run this in PowerShell as Administrator
# Forwards port 3001 from Windows LAN to WSL2 server

$wslIp = (wsl hostname -I).Trim().Split(" ")[0]
Write-Host "WSL2 IP: $wslIp"

# Remove old rule if exists
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>$null

# Add new rule
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIp

# Allow through firewall
New-NetFirewallRule -DisplayName "Falatorio API" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

Write-Host "Port forwarding: 0.0.0.0:3001 -> ${wslIp}:3001"
Write-Host "Phone should connect to: http://$((Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' }).IPAddress):3001"
