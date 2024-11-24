# whaleybar

## Development Setup

### Prerequisites

1. Install Nix Package Manager:

```bash
# Linux/macOS
sh <(curl -L https://nixos.org/nix/install) --daemon

# After installation, restart your terminal
```

### Getting Started

1. Download or clone this repository
2. Enter the project directory
3. Start the development environment:

```bash
nix-shell
```

This will automatically:

- Install all required dependencies (Node.js, Deno, etc.)
- Start both the client and server in split panes
- Set up your development environment

### Development Servers

The development environment runs two servers side by side:

- **Web Client** (left pane): React frontend running on `npm`
- **Server** (right pane): Deno backend

### Using tmux

When the development environment starts, you'll be in a tmux session. Some basic commands:

- Switch between panes: `Ctrl + b` then arrow keys
- Exit: `Ctrl + b` then `d` (detach) or type `exit` in both panes

### Manual Start

If you need to start the servers separately:

```bash
# Frontend (in web-client directory)
npm run dev

# Backend (in server directory)
deno task start
```

### Troubleshooting

If tmux fails to start:

1. Exit the nix-shell (`exit` or Ctrl+D)
2. Re-enter: `nix-shell`

For any other issues, please open an issue in the repository.
