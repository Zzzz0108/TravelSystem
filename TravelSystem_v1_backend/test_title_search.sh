#!/bin/bash

# 测试标题搜索接口
echo "🚀 测试标题搜索接口..."

# 设置基础URL
BASE_URL="http://localhost:9090"

# 测试数据
SEARCH_TITLE="gogogo"

echo "🔍 测试标题搜索接口"

# 1. 测试新添加的标题搜索接口
echo ""
echo "1️⃣ 测试 /api/diaries/search/title 接口..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/title?title=$SEARCH_TITLE")

echo "标题搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 标题搜索接口成功！"
elif [[ $RESPONSE == *"403"* ]] || [[ $RESPONSE == *"Forbidden"* ]]; then
    echo "❌ 标题搜索接口仍然返回403，权限配置可能有问题"
else
    echo "⚠️ 标题搜索接口响应异常: $RESPONSE"
fi

# 2. 测试基础搜索接口 (按标题参数)
echo ""
echo "2️⃣ 测试 /api/diaries/search?title=xxx 接口..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search?title=$SEARCH_TITLE")

echo "基础搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 基础搜索接口成功！"
else
    echo "❌ 基础搜索接口失败: $RESPONSE"
fi

# 3. 测试精确标题搜索接口
echo ""
echo "3️⃣ 测试 /api/diaries/search/exact?title=xxx 接口..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/exact?title=$SEARCH_TITLE")

echo "精确标题搜索响应: $RESPONSE"

if [[ $RESPONSE == *"id"* ]] || [[ $RESPONSE == *"title"* ]]; then
    echo "✅ 精确标题搜索接口成功！"
else
    echo "❌ 精确标题搜索接口失败: $RESPONSE"
fi

# 4. 测试标题包含搜索接口
echo ""
echo "4️⃣ 测试 /api/diaries/search/contains?keyword=xxx 接口..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/contains?keyword=$SEARCH_TITLE")

echo "标题包含搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 标题包含搜索接口成功！"
else
    echo "❌ 标题包含搜索接口失败: $RESPONSE"
fi

echo ""
echo "🎉 标题搜索接口测试完成！"
echo "📖 如果新添加的 /api/diaries/search/title 接口测试成功，说明问题已解决"
echo "🔍 如果仍有问题，请检查后端日志和权限配置"
echo ""
echo "📋 可用的标题搜索接口:"
echo "  - /api/diaries/search/title?title=xxx (新添加)"
echo "  - /api/diaries/search?title=xxx (基础搜索)"
echo "  - /api/diaries/search/exact?title=xxx (精确搜索)"
echo "  - /api/diaries/search/contains?keyword=xxx (包含搜索)" 