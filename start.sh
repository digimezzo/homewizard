#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill existing processes on ports 3000 and 4200
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4200 | xargs kill -9 2>/dev/null

# Start backend
(cd "$DIR/p1-backend" && node server.js) &

# Start frontend
(cd "$DIR/p1-dashboard" && npx ng serve --proxy-config proxy.conf.json) &

wait
