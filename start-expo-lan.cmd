@echo off
cd /d R:\gym
set HOME=R:\gym
set USERPROFILE=R:\gym
set EXPO_HOME=R:\gym\.expo
set EXPO_NO_TELEMETRY=1
set EXPO_OFFLINE=1
set npm_config_cache=R:\gym\.npm-cache
set REACT_NATIVE_PACKAGER_HOSTNAME=10.245.99.95
set EXPO_PACKAGER_PROXY_URL=http://10.245.99.95:8081
set PATH=R:\gym\.tools\node-v20.19.6-win-x64;%PATH%
R:\gym\.tools\node-v20.19.6-win-x64\node.exe .\node_modules\expo\bin\cli start --lan -c
