#!/bin/bash
 
if [[ $VERCEL_ENV == "production"  ]] ; then 
  ln -sfn "$(pwd)/node_modules" ../shared/node_modules
  pnpm build:production
else 
  pnpm build
fi
