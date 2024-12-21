{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    deno
  ];

  shellHook = ''
    echo "🚀 Starting whaleybar server..."
    deno task start
  '';
}