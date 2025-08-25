# Set the Google Application Credentials environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS = "c:\Users\ASUS\Desktop\NITHIN AND TEAM\healthify\rainscare-credentials.json"

# Display the credentials path
Write-Host "Using service account credentials from: $env:GOOGLE_APPLICATION_CREDENTIALS"

# Run the Node.js script
Write-Host "Running Gemini 1.5 Pro test script..."
node --experimental-modules test-gemini-pro.js