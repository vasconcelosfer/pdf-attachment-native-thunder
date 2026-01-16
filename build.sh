#!/bin/bash

# Configuración
APP_NAME="native-pdf-export"
DIST_DIR="dist"
XPI_FILE="$DIST_DIR/$APP_NAME.xpi"

echo "🚧 Iniciando construcción de $APP_NAME ..."

# 1. Crear carpeta dist si no existe
if [ ! -d "$DIST_DIR" ]; then
    mkdir -p "$DIST_DIR"
    echo "📁 Carpeta '$DIST_DIR' creada."
fi

# 2. Limpiar versión anterior
if [ -f "$XPI_FILE" ]; then
    rm "$XPI_FILE"
    echo "🧹 Versión anterior eliminada."
fi

# 3. Crear el paquete XPI
# -r: Recursivo
# -x: Excluciones (git, vscode, scripts, carpeta dist, etc)
echo "📦 Empaquetando archivos..."

zip -r "$XPI_FILE" . \
    -x "*.git*" \
    -x "*.vscode*" \
    -x ".DS_Store" \
    -x "$DIST_DIR/*" \
    -x "build.sh" \
    -x "*.md" \
    -x "Makefile"

echo "✅ ¡Éxito! Archivo creado en: $XPI_FILE"