#!/bin/bash
set -e

ln -sfn "$(pwd)/node_modules" ../shared/node_modules
pnpm exec convex deploy --cmd='pnpm build'
