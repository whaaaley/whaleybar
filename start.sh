#!/bin/sh
session='whaleybar'

tmux new-session -d -s $session -n 'whaleybar'
tmux send-keys -t $session:0 'cd client' C-m
tmux send-keys -t $session:0 'npm run dev' C-m

# Split the window vertically (panes side by side)
tmux split-window -t $session:0 -h
tmux send-keys -t $session:0.1 'cd server' C-m
tmux send-keys -t $session:0.1 'deno task start' C-m

# Select first pane in the window
tmux select-pane -t $session:0.0

tmux attach-session -t $session
