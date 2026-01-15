#!/bin/bash

# Nombre de la extensión
XPI="native-pdf-export.xpi"

echo "🚧 Iniciando construcción de $XPI ..."

# 1. Borrar versión previa
if [ -f "$XPI" ]; then
    rm "$XPI"
fi

# 2. Crear el ZIP (XPI)
# -r: Recursivo (carpetas)
# -FS: Sincronizar sistema de archivos (opcional, pero útil)
# -x: Excluir archivos basura
zip -r "$XPI" . -x "*.git*" -x "*.vscode*" -x "*.DS_Store" -x "$XPI" -x "build.sh" -x "*.md"

echo "✅ Empaquetado completado: $XPI"