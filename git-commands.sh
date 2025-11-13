#!/bin/bash
# ================================
# MELANOX - Comandos Git para GitHub
# ================================

# PASO 1: Inicializar repositorio (solo si no lo has hecho)
git init

# PASO 2: Agregar todos los archivos (respetando .gitignore)
git add .

# PASO 3: Hacer el primer commit
git commit -m "Initial commit: MELANOX - Sistema de detección de melanoma"

# PASO 4: Conectar con GitHub (reemplaza con tu URL)
# Opción A - HTTPS:
git remote add origin https://github.com/TU_USUARIO/melanox.git

# Opción B - SSH (recomendado):
# git remote add origin git@github.com:TU_USUARIO/melanox.git

# PASO 5: Subir al repositorio
git branch -M main
git push -u origin main

# ================================
# COMANDOS ÚTILES POSTERIORES
# ================================

# Ver estado de archivos
# git status

# Ver archivos ignorados
# git status --ignored

# Agregar archivos específicos
# git add archivo.js

# Hacer commit con mensaje
# git commit -m "Descripción del cambio"

# Subir cambios
# git push

# Ver historial
# git log --oneline

# Crear nueva rama
# git checkout -b nombre-rama

# ================================
# ANTES DE SUBIR, VERIFICA:
# ================================
# ✅ No subir node_modules/
# ✅ No subir venv/ o .venv/
# ✅ No subir archivos .env
# ✅ No subir modelos .h5, .pkl (muy pesados)
# ✅ No subir datasets de imágenes
# ✅ Incluir README.md
# ✅ Incluir .gitignore
# ✅ Incluir package.json
