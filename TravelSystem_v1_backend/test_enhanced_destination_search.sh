#!/bin/bash

# 测试增强版目的地搜索功能
echo "🚀 测试增强版目的地搜索功能..."

# 设置基础URL
BASE_URL="http://localhost:9090"

# 测试数据
SEARCH_DESTINATION="故宫"
SEARCH_CITY="成都"
SEARCH_PROVINCE="四川"

echo "🔍 测试增强版目的地搜索接口"

# 1. 测试按景点名称搜索
echo ""
echo "1️⃣ 测试按景点名称搜索 (故宫)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=$SEARCH_DESTINATION")

echo "景点名称搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 景点名称搜索成功！"
else
    echo "❌ 景点名称搜索失败: $RESPONSE"
fi

# 2. 测试按城市搜索
echo ""
echo "2️⃣ 测试按城市搜索 (成都)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=$SEARCH_CITY")

echo "城市搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 城市搜索成功！"
else
    echo "❌ 城市搜索失败: $RESPONSE"
fi

# 3. 测试按省份搜索
echo ""
echo "3️⃣ 测试按省份搜索 (四川)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=$SEARCH_PROVINCE")

echo "省份搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 省份搜索成功！"
else
    echo "❌ 省份搜索失败: $RESPONSE"
fi

# 4. 测试空关键词搜索（应该返回所有日记）
echo ""
echo "4️⃣ 测试空关键词搜索 (返回所有日记)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination")

echo "空关键词搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 空关键词搜索成功！"
else
    echo "❌ 空关键词搜索失败: $RESPONSE"
fi

echo ""
echo "🎉 增强版目的地搜索功能测试完成！"
echo "📋 功能说明:"
echo "  - 支持按景点名称搜索 (destination字段)"
echo "  - 支持按城市搜索 (city字段)"
echo "  - 支持按省份搜索 (province字段)"
echo "  - 智能匹配，一个接口支持三种搜索方式"
echo "  - 不传关键词时返回所有日记" 