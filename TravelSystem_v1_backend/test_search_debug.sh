#!/bin/bash

# 调试目的地搜索功能
echo "🔍 调试目的地搜索功能..."

# 设置基础URL
BASE_URL="http://localhost:9090"

echo "=== 测试目的地搜索 ==="

# 1. 测试搜索"成都"
echo ""
echo "1️⃣ 搜索关键词: 成都"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=成都")

echo "响应: $RESPONSE"

# 2. 测试搜索"北京"
echo ""
echo "2️⃣ 搜索关键词: 北京"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=北京")

echo "响应: $RESPONSE"

# 3. 测试搜索"四川"
echo ""
echo "3️⃣ 搜索关键词: 四川"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=四川")

echo "响应: $RESPONSE"

# 4. 测试不传关键词
echo ""
echo "4️⃣ 不传关键词（应该返回所有日记）"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination")

echo "响应: $RESPONSE"

echo ""
echo "🎯 请查看后端控制台日志，看看搜索逻辑是否正确执行"
echo "📋 如果日志显示所有日记都被返回，说明JPQL查询有问题" 