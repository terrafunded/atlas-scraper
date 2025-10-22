#!/usr/bin/env bash
# 🚀 Script de build para Render

echo "Instalando dependencias..."
npm install

echo "Instalando navegador Chromium..."
npx playwright install chromium

echo "Iniciando servidor..."
npm start
