#!/bin/bash
echo "Définition des permissions d'exécution sur les scripts..."
chmod +x /docker-entrypoint-initdb.d/*.sh
ls -la /docker-entrypoint-initdb.d/
