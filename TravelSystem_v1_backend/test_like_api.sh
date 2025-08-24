#!/bin/bash

# 测试点赞API的脚本
echo "🚀 开始测试点赞API..."

# 设置基础URL和测试数据
BASE_URL="http://localhost:9090"
DIARY_ID="1"  # 替换为实际的日记ID
TOKEN="your-jwt-token-here"  # 替换为实际的JWT token

echo "📝 测试日记ID: $DIARY_ID"
echo "🔑 Token: $TOKEN"

# 1. 检查点赞状态
echo ""
echo "1️⃣ 检查点赞状态..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/$DIARY_ID/is-liked" \
  -H "Authorization: Bearer $TOKEN")

echo "点赞状态: $RESPONSE"

# 2. 点赞日记
echo ""
echo "2️⃣ 点赞日记..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/diaries/$DIARY_ID/like" \
  -H "Authorization: Bearer $TOKEN")

echo "点赞响应: $RESPONSE"

if [[ $RESPONSE == "" ]]; then
    echo "✅ 点赞成功！"
else
    echo "❌ 点赞失败: $RESPONSE"
fi

# 3. 再次检查点赞状态
echo ""
echo "3️⃣ 再次检查点赞状态..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/$DIARY_ID/is-liked" \
  -H "Authorization: Bearer $TOKEN")

echo "点赞状态: $RESPONSE"

# 4. 取消点赞
echo ""
echo "4️⃣ 取消点赞..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/diaries/$DIARY_ID/unlike" \
  -H "Authorization: Bearer $TOKEN")

echo "取消点赞响应: $RESPONSE"

if [[ $RESPONSE == "" ]]; then
    echo "✅ 取消点赞成功！"
else
    echo "❌ 取消点赞失败: $RESPONSE"
fi

# 5. 最终检查点赞状态
echo ""
echo "5️⃣ 最终检查点赞状态..."
RESPONSE=$(curl -s -X GET "$BASE_URL/api/diaries/$DIARY_ID/is-liked" \
  -H "Authorization: Bearer $TOKEN")

echo "最终点赞状态: $RESPONSE"

echo ""
echo "🎉 点赞功能测试完成！"
echo "📖 参考文档: 查看后端日志获取详细信息" 