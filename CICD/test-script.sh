#!/bin/bash

# wait for the container to be ready
sleep 5

echo "Running health check on http://localhost:3000"

if curl --fail http://localhost:3000; then
  echo "Server is up and responding!"
  exit 0
else
  echo "Server is not responding!"
  exit 1
fi
