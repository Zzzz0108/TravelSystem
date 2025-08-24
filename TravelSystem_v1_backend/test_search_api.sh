#!/bin/bash

# 测试搜索API接口
echo "🚀 测试搜索API接口..."

# 设置基础URL
BASE_URL="http://localhost:9090"

echo "🔍 测试目的地搜索接口"

# 1. 测试目的地搜索 (无需认证)
echo ""
echo "1️⃣ 测试目的地搜索 (成都)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search/destination?destination=成都")

echo "搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 目的地搜索成功！"
else
    echo "❌ 目的地搜索失败: $RESPONSE"
fi

# 2. 测试关键词搜索 (无需认证)
echo ""
echo "2️⃣ 测试关键词搜索..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/search?keyword=旅行")

echo "关键词搜索响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 关键词搜索成功！"
else
    echo "❌ 关键词搜索失败: $RESPONSE"
fi

# 3. 测试最新日记 (无需认证)
echo ""
echo "3️⃣ 测试最新日记接口..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/latest?page=0&size=5")

echo "最新日记响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 最新日记获取成功！"
else
    echo "❌ 最新日记获取失败: $RESPONSE"
fi

# 4. 测试热门日记 (无需认证)
echo ""
echo "4️⃣ 测试热门日记接口..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/popular?page=0&size=5")

echo "热门日记响应: $RESPONSE"

if [[ $RESPONSE == *"content"* ]] || [[ $RESPONSE == *"totalElements"* ]]; then
    echo "✅ 热门日记获取成功！"
else
    echo "❌ 热门日记获取失败: $RESPONSE"
fi

# 5. 测试日记详情 (无需认证)
echo ""
echo "5️⃣ 测试日记详情接口..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/1")

echo "日记详情响应: $RESPONSE"

if [[ $RESPONSE == *"id"* ]] || [[ $RESPONSE == *"title"* ]]; then
    echo "✅ 日记详情获取成功！"
else
    echo "❌ 日记详情获取失败: $RESPONSE"
fi

# 6. 测试需要认证的接口 (应该返回401)
echo ""
echo "6️⃣ 测试需要认证的接口 (应该返回401)..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/1/user-rating")

echo "需要认证的接口响应: $RESPONSE"

if [[ $RESPONSE == *"401"* ]] || [[ $RESPONSE == *"Unauthorized"* ]]; then
    echo "✅ 权限控制正常！未认证用户无法访问需要认证的接口"
else
    echo "⚠️ 权限控制可能有问题"
fi

echo ""
echo "🎉 搜索API接口测试完成！"
echo "📖 如果公开接口测试成功，说明权限配置已修复"
echo "🔍 如果仍有问题，请查看后端日志" 