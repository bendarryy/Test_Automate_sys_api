# PowerShell script to add Header component imports to all page files
# and insert a comment where the Header component should be placed

$pageFiles = Get-ChildItem -Path "src\pages" -Include "*.tsx" -Recurse
$pagesCount = 0

foreach ($file in $pageFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file doesn't already have the Header import
    if (-not ($content -match "import Header from '[\.\/]+\/components\/Header';")) {
        # Add import statement after the first import
        $newContent = $content -replace "^(import .+;[\r\n]+)", "`$1import Header from '../../components/Header';`r`n"
        
        # Add a comment where the Header component should be placed - typically after a top-level div
        # This is just a marker for manual replacement
        $newContent = $newContent -replace "(<div[^>]*>[\r\n\s]*<h1|<Row[^>]*>[\r\n\s]*<Col[^>]*>[\r\n\s]*<h1)", "<!-- Replace with Header component -->`r`n      `$1"
        
        # Write the modified content back to the file
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated $($file.FullName)"
        $pagesCount++
    }
}

Write-Host "Updated $pagesCount page files."
