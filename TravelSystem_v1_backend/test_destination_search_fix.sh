#!/bin/bash

# 测试修复后的目的地搜索功能
echo "🚀 测试修复后的目的地搜索功能..."

# 设置基础URL
BASE_URL="http://localhost:9090"

echo "🔍 测试目的地搜索接口"

# 1. 测试按景点名称搜索
echo ""
echo "1️⃣ 测试按景点名称搜索 (大雁塔)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=大雁塔")

echo "景点名称搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 景点名称搜索成功！"
else
    echo "❌ 景点名称搜索失败: $RESPONSE"
fi

# 2. 测试按城市搜索
echo ""
echo "2️⃣ 测试按城市搜索 (成都)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=成都")

echo "城市搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 城市搜索成功！"
else
    echo "❌ 城市搜索失败: $RESPONSE"
fi

# 3. 测试按省份搜索
echo ""
echo "3️⃣ 测试按省份搜索 (四川)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?keyword=四川")

echo "省份搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 省份搜索成功！"
else
    echo "❌ 省份搜索失败: $RESPONSE"
fi

# 4. 测试获取所有日记
echo ""
echo "4️⃣ 测试获取所有日记..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination")

echo "所有日记响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 获取所有日记成功！"
else
    echo "❌ 获取所有日记失败: $RESPONSE"
fi

# 5. 测试获取单个日记详情
echo ""
echo "5️⃣ 测试获取单个日记详情..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/1")

echo "日记详情响应: $RESPONSE"

if [[ $RESPONSE == *"id"* ]] || [[ $RESPONSE == *"title"* ]]; then
    echo "✅ 获取日记详情成功！"
    # 检查是否包含图片信息
    if [[ $RESPONSE == *"imageUrls"* ]]; then
        echo "✅ 日记包含图片信息！"
    else
        echo "⚠️ 日记可能没有图片信息"
    fi
else
    echo "❌ 获取日记详情失败: $RESPONSE"
fi

echo ""
echo "🎉 测试完成！"
echo "📋 如果所有测试都成功，说明目的地搜索和图片显示功能已修复" 