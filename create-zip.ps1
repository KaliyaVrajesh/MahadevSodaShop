# PowerShell script to create ZIP file
# Run: .\create-zip.ps1

$source = "."
$destination = "mahadav-soda-shop.zip"

# Remove existing zip if exists
if (Test-Path $destination) {
    Remove-Item $destination
}

# Create zip excluding node_modules, venv, __pycache__, .git
$exclude = @("node_modules", "venv", ".venv", "__pycache__", ".git", "*.pyc", "dist", "build", ".env")

Compress-Archive -Path $source -DestinationPath $destination -Force

Write-Host "Created $destination successfully!" -ForegroundColor Green
