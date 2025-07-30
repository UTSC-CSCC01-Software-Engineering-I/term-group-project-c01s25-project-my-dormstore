#!/bin/bash

# wait for the container to be ready
sleep 5

echo "Running health check on http://localhost:5001"

if curl --fail http://localhost:5001; then
  echo "Server is up and responding!"
  exit 0
else
  echo "Server is not responding!"
  exit 1
fi
