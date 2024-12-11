{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    deno
    nodejs_20
    tmux
  ];

  shellHook = ''
    echo "🚀 Starting whaleybar development environment..."
    exec sh tmux.sh
  '';
}
