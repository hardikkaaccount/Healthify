# PowerShell script to run food image analysis tests

Write-Host "🍎 Food Image Analysis Test Runner" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if food images exist
$foodImagesDir = "client\foodimages"
if (-not (Test-Path $foodImagesDir)) {
    Write-Host "❌ Food images directory not found: $foodImagesDir" -ForegroundColor Red
    exit 1
}

$imageFiles = Get-ChildItem $foodImagesDir -Filter "*.jpg", "*.jpeg", "*.png", "*.webp"
Write-Host "📸 Found $($imageFiles.Count) food images:" -ForegroundColor Blue
foreach ($file in $imageFiles) {
    $sizeKB = [math]::Round($file.Length / 1024, 2)
    Write-Host "   - $($file.Name) ($sizeKB KB)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Choose test type:" -ForegroundColor Yellow
Write-Host "1. API Test (requires backend server running)" -ForegroundColor White
Write-Host "2. Direct Service Test (tests service function directly)" -ForegroundColor White
Write-Host "3. Test specific image via API" -ForegroundColor White
Write-Host "4. Test specific image directly" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Running API tests..." -ForegroundColor Green
        Write-Host "⚠️  Make sure the backend server is running (npm run dev in backend directory)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        node test-foodimages-analysis.js
    }
    "2" {
        Write-Host "🚀 Running direct service tests..." -ForegroundColor Green
        node test-foodimages-direct.js
    }
    "3" {
        Write-Host "Available images:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $imageFiles.Count; $i++) {
            Write-Host "   $($i + 1). $($imageFiles[$i].Name)" -ForegroundColor Cyan
        }
        $imageChoice = Read-Host "Enter image number (1-$($imageFiles.Count))"
        $selectedImage = $imageFiles[$imageChoice - 1].Name
        
        Write-Host "Enter health conditions (comma-separated, or press Enter for none):" -ForegroundColor Yellow
        $healthConditions = Read-Host
        
        if ($healthConditions) {
            $conditionsArray = $healthConditions -split "," | ForEach-Object { $_.Trim() }
            Write-Host "🚀 Testing $selectedImage with conditions: $($conditionsArray -join ', ')" -ForegroundColor Green
            node test-foodimages-analysis.js $selectedImage @conditionsArray
        } else {
            Write-Host "🚀 Testing $selectedImage with no health conditions" -ForegroundColor Green
            node test-foodimages-analysis.js $selectedImage
        }
    }
    "4" {
        Write-Host "Available images:" -ForegroundColor Yellow
        for ($i = 0; $i -lt $imageFiles.Count; $i++) {
            Write-Host "   $($i + 1). $($imageFiles[$i].Name)" -ForegroundColor Cyan
        }
        $imageChoice = Read-Host "Enter image number (1-$($imageFiles.Count))"
        $selectedImage = $imageFiles[$imageChoice - 1].Name
        
        Write-Host "Enter health conditions (comma-separated, or press Enter for none):" -ForegroundColor Yellow
        $healthConditions = Read-Host
        
        if ($healthConditions) {
            $conditionsArray = $healthConditions -split "," | ForEach-Object { $_.Trim() }
            Write-Host "🚀 Testing $selectedImage directly with conditions: $($conditionsArray -join ', ')" -ForegroundColor Green
            node test-foodimages-direct.js $selectedImage @conditionsArray
        } else {
            Write-Host "🚀 Testing $selectedImage directly with no health conditions" -ForegroundColor Green
            node test-foodimages-direct.js $selectedImage
        }
    }
    "5" {
        Write-Host "👋 Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Test completed! Check the results above and any generated JSON files." -ForegroundColor Green