#!/usr/bin/env sh
# Local JSON API for StorePulse (json-server). Serves http://localhost:3000/api/v1
npx json-server --watch server/db.json --routes server/routes.json --port 3000
