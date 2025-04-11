@echo off
setlocal EnableDelayedExpansion

REM Load environment variables from .env file
if not exist .env (
    echo .env file not found
    exit /b 1
)

REM Read and set environment variables from .env
for /f "tokens=*" %%a in (.env) do (
    set %%a
)

REM Check required variables
set REQUIRED_VARS=DB_HOST DB_PORT DB_USERNAME DB_PASSWORD DB_DATABASE
for %%v in (%REQUIRED_VARS%) do (
    if "!%%v!"=="" (
        echo Error: %%v is not set in .env file
        exit /b 1
    )
)

REM Create Elastic Beanstalk environment
eb create develop ^
    --cname %GITHUB_USERNAME%-cart-api-develop ^
    --single ^
    --envvars DB_HOST=%DB_HOST%,DB_PORT=%DB_PORT%,DB_USERNAME=%DB_USERNAME%,DB_PASSWORD=%DB_PASSWORD%,DB_DATABASE=%DB_DATABASE%

endlocal
