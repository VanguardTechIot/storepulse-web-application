#!/usr/bin/env sh
# Starts the StorePulse local data server (json-server) used by the Web Application.
# Base URL: http://localhost:3000/api/v1
cd "$(dirname "$0")" || exit 1
npx --yes json-server@0.17.4 --watch db.json --routes routes.json --port 3000
