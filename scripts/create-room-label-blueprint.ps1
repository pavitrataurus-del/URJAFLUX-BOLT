Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 800, 600
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font("Arial", 28)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$g.DrawString("BEDROOM", $font, $brush, 80, 80)
$g.DrawString("KITCHEN", $font, $brush, 420, 180)
$g.DrawString("LIVING ROOM", $font, $brush, 200, 380)
$outPath = Join-Path $PSScriptRoot "..\test-data\floor_plan_rooms.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Created $outPath"
