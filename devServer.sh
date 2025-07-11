#!/usr/bin/env bash
nix-shell -p python3Minimal --run "python -m http.server 8080"
# python -m http.server 8080
