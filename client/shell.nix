{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
  ];

  shellHook = ''
    echo "🚀 Starting whaleybar client..."
    npm run dev
  '';
}