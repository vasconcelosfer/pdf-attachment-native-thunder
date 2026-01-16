#!/bin/bash

# Configuración base
APP_NAME="native-pdf-export"
DIST_DIR="dist"
MANIFEST="manifest.json"

echo "🚧 Iniciando construcción..."

# 1. Verificar que existe el manifest
if [ ! -f "$MANIFEST" ]; then
    echo "❌ Error: No se encuentra '$MANIFEST'."
    exit 1
fi

# 2. Extraer versión del manifest.json (Usando grep y cut para no depender de jq)
# Busca la línea que dice "version", toma el primer resultado y corta por comillas
VERSION=$(grep '"version"' $MANIFEST | head -n 1 | cut -d '"' -f 4)

if [ -z "$VERSION" ]; then
    echo "❌ Error: No se pudo detectar la versión en el manifest."
    exit 1
fi

echo "ℹ️  Versión detectada: $VERSION"

# 3. Definir nombre del archivo final con versión
XPI_FILE="$DIST_DIR/${APP_NAME}-v${VERSION}.xpi"

# 4. Crear carpeta dist si no existe
if [ ! -d "$DIST_DIR" ]; then
    mkdir -p "$DIST_DIR"
fi

# 5. Limpiar si ya existe ESE archivo específico
if [ -f "$XPI_FILE" ]; then
    rm "$XPI_FILE"
    echo "🧹 Versión anterior ($VERSION) eliminada."
fi

# 6. Crear el paquete XPI
echo "📦 Empaquetando archivo..."

zip -r "$XPI_FILE" . \
    -x "*.git*" \
    -x "*.vscode*" \
    -x ".DS_Store" \
    -x "$DIST_DIR/*" \
    -x "build.sh" \
    -x "*.md" \
    -x "Makefile"

echo "✅ ¡Éxito! Archivo creado: $XPI_FILE"