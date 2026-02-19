#!/bin/bash
cd /root/.openclaw/workspace/metadata-viewer
exec python3 -m http.server 8080
