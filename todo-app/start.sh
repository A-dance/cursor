#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
echo "Starting Next.js app at http://localhost:3000"
npm install
npm run dev
