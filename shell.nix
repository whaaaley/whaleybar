{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    deno
    tmux
  ];

  shellHook = ''
    echo "🚀 Starting whaleybar development environment..."
    sh tmux.sh
  '';
}
