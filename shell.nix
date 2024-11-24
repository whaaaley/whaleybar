{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js for web-client
    nodejs_20
    # Deno for server
    deno
    # Development tools
    tmux
    tmuxinator
  ];

  shellHook = ''
    echo "🚀 Starting whaleybar development environment..."
    exec tmuxinator
  '';
}
