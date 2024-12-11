#!/bin/bash

tmux kill-session -t whaleybar 2>/dev/null
tmux new-session -d -s whaleybar

tmux split-window -h
tmux split-window -t whaleybar:0.1 -v

tmux send-keys -t whaleybar:0.0 'cd client' C-m
tmux send-keys -t whaleybar:0.0 'npm run dev' C-m

tmux send-keys -t whaleybar:0.1 'cd server' C-m
tmux send-keys -t whaleybar:0.1 'deno task start' C-m

tmux send-keys -t whaleybar:0.2 'cd client' C-m
tmux send-keys -t whaleybar:0.2 'npm run build' C-m

tmux attach-session -t whaleybar
