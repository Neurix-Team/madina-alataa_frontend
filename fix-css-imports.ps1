# Script to remove CSS imports from all JSX files

$files = @(
    "src\components\tabs\DailyTasksTab.jsx",
    "src\components\tabs\CityMapTab.jsx",
    "src\components\tabs\CityExplorationTab.jsx",
    "src\components\tabs\ProfileTab_REFACTORED.jsx"
)

foreach ($file in $files) {
    Write-Host "Processing: $file"
    $content = Get-Content $file -Raw -Encoding UTF8
    $newContent = $content -replace "import\s+['\`"][^'\`"]*\.css['\`"];\r?\n?", ""
    Set-Content $file -Value $newContent -Encoding UTF8 -NoNewline
    Write-Host "  ✅ Fixed: $file"
}

Write-Host "`n✨ All CSS imports removed!"
