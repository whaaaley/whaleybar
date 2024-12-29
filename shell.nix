{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    deno
    supabase-cli
    tmux
  ];

  shellHook = ''
    echo "🚀 Starting whaleybar development environment..."
    exec sh tmux.sh
  '';
}
