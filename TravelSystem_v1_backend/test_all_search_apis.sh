#!/bin/bash

# 测试所有搜索API接口
echo "🚀 测试所有搜索API接口..."

# 设置基础URL
BASE_URL="http://localhost:9090"

# 测试数据
SEARCH_KEYWORD="旅行"
SEARCH_TITLE="日记"
SEARCH_DESTINATION="成都"

echo "🔍 测试各种搜索接口"

# 1. 测试基础搜索接口 (按关键词搜索)
echo ""
echo "1️⃣ 测试基础搜索接口 (按关键词搜索)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search?keyword=$SEARCH_KEYWORD")

echo "基础搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 基础搜索成功！"
else
    echo "❌ 基础搜索失败: $RESPONSE"
fi

# 2. 测试按标题搜索
echo ""
echo "2️⃣ 测试按标题搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search?title=$SEARCH_TITLE")

echo "按标题搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 按标题搜索成功！"
else
    echo "❌ 按标题搜索失败: $RESPONSE"
fi

# 3. 测试目的地搜索
echo ""
echo "3️⃣ 测试目的地搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?destination=$SEARCH_DESTINATION")

echo "目的地搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 目的地搜索成功！"
else
    echo "❌ 目的地搜索失败: $RESPONSE"
fi

# 4. 测试内容搜索
echo ""
echo "4️⃣ 测试内容搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/content?content=$SEARCH_KEYWORD")

echo "内容搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 内容搜索成功！"
else
    echo "❌ 内容搜索失败: $RESPONSE"
fi

# 5. 测试精确标题搜索
echo ""
echo "5️⃣ 测试精确标题搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/exact?title=$SEARCH_TITLE")

echo "精确标题搜索响应: $RESPONSE"

if [[ $RESPONSE == *"id"* ]] || [[ $RESPONSE == *"title"* ]]; then
    echo "✅ 精确标题搜索成功！"
else
    echo "❌ 精确标题搜索失败: $RESPONSE"
fi

# 6. 测试全文搜索
echo ""
echo "6️⃣ 测试全文搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/fulltext?keyword=$SEARCH_KEYWORD")

echo "全文搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 全文搜索成功！"
else
    echo "❌ 全文搜索失败: $RESPONSE"
fi

# 7. 测试标题前缀搜索
echo ""
echo "7️⃣ 测试标题前缀搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/prefix?prefix=$SEARCH_TITLE")

echo "标题前缀搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 标题前缀搜索成功！"
else
    echo "❌ 标题前缀搜索失败: $RESPONSE"
fi

# 8. 测试标题包含搜索
echo ""
echo "8️⃣ 测试标题包含搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/contains?keyword=$SEARCH_TITLE")

echo "标题包含搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 标题包含搜索成功！"
else
    echo "❌ 标题包含搜索失败: $RESPONSE"
fi

echo ""
echo "🎉 所有搜索API接口测试完成！"
echo "📖 如果所有测试都成功，说明权限配置已修复"
echo "🔍 如果仍有问题，请查看后端日志"
echo ""
echo "📋 搜索接口权限配置总结:"
echo "  - /api/diaries/search - 基础搜索 (公开)"
echo "  - /api/diaries/search/** - 所有搜索变体 (公开)"
echo "  - 按关键词、标题、目的地、内容等搜索都应该是公开的" 