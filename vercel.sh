#!/bin/bash
set -e

ln -sfn "$(pwd)/node_modules" ../shared/node_modules
npx convex deploy --cmd='vite build'
