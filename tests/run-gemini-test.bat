@echo off
echo Setting Google Application Credentials...
set GOOGLE_APPLICATION_CREDENTIALS=c:\Users\ASUS\Desktop\NITHIN AND TEAM\healthify\rainscare-credentials.json

echo Using service account credentials from: %GOOGLE_APPLICATION_CREDENTIALS%

echo Running Gemini 1.5 Pro test script...
node --experimental-modules test-gemini-pro.js

pause