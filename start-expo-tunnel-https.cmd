@echo off
cd /d R:\gym
set HOME=R:\gym
set USERPROFILE=R:\gym
set EXPO_HOME=R:\gym\.expo
set EXPO_NO_TELEMETRY=1
set npm_config_cache=R:\gym\.npm-cache
set EXPO_PACKAGER_PROXY_URL=https://rdsa0ki-anonymous-8081.exp.direct
set PATH=R:\gym\.tools\node-v20.19.6-win-x64;%PATH%
R:\gym\.tools\node-v20.19.6-win-x64\node.exe .\node_modules\expo\bin\cli start --tunnel -c 1>R:\gym\expo-tunnel-https.log 2>R:\gym\expo-tunnel-https.err
