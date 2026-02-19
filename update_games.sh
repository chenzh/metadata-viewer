#!/bin/bash

# 批量更新 HTML 文件，禁止移动端长按复制菜单
GAMES_DIR="/root/.openclaw/workspace/no-wifi-games/games"
UPDATED_COUNT=0

for file in "$GAMES_DIR"/*.html; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Processing: $filename"
        
        # 检查是否已有 user-select
        if ! grep -q "user-select.*none" "$file"; then
            # 在 * 选择器中添加 user-select: none
            sed -i 's/\* { margin: 0; padding: 0; box-sizing: border-box; }/\* { margin: 0; padding: 0; box-sizing: border-box; -webkit-user-select: none; user-select: none; }/g' "$file"
            echo "  -> Added user-select: none"
        else
            echo "  -> user-select: none already exists"
        fi
        
        # 检查是否已有 contextmenu 事件监听
        if ! grep -q "contextmenu.*e => e.preventDefault()" "$file"; then
            # 在第一个 <script> 标签后添加 contextmenu 事件监听
            sed -i '0,/<script>/{s/<script>/<script>\n    \/\/ 禁止长按复制菜单\n    document.addEventListener('\''contextmenu'\'', e => e.preventDefault());/}' "$file"
            echo "  -> Added contextmenu prevent"
            ((UPDATED_COUNT++))
        else
            echo "  -> contextmenu prevent already exists"
        fi
    fi
done

echo ""
echo "=========================================="
echo "Updated files count: $UPDATED_COUNT"
echo "=========================================="