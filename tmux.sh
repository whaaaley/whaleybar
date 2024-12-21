#!/bin/bash

tmux kill-session -t whaleybar 2>/dev/null
tmux new-session -d -s whaleybar

tmux split-window -h
tmux split-window -t whaleybar:0.1 -v
tmux split-window -t whaleybar:0.1 -v

tmux send-keys -t whaleybar:0.0 'cd client' C-m 'nix-shell' C-m
tmux send-keys -t whaleybar:0.3 'cd client' C-m 'npm run build-watch' C-m

tmux send-keys -t whaleybar:0.1 'cd server' C-m 'nix-shell' C-m
# tmux send-keys -t whaleybar:0.2 'cd server' C-m 'nix-shell && deno test --watch' C-m

# tmux send-keys -t whaleybar:0.4 'nix-shell --pure -p deno' C-m 'deno run -A scripts/build-meta.ts' C-m

tmux attach-session -t whaleybar
