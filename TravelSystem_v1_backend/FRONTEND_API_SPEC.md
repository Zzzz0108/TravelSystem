# 前端API规范 - 日记创建

## 创建日记接口

**接口**: `POST /api/diaries`
**Content-Type**: `multipart/form-data`

## 请求参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 日记标题 |
| `content` | String | ✅ | 日记内容 |
| `destination` | String | ❌ | 景点名称，如：故宫、宽窄巷子 |
| `city` | String | ❌ | 城市名称，如：北京、成都 |
| `province` | String | ❌ | 省份名称，如：北京、四川 |
| `spotId` | Long | ❌ | **景点ID，用于关联景点系统** |
| `spotRating` | Integer | ❌ | **景点评分，1-5分** |
| `media` | File[] | ❌ | 图片文件数组 |

## 前端数据结构

```json
{
  "title": "故宫一日游",
  "content": "今天参观了故宫，非常震撼...",
  "destination": "故宫",
  "city": "北京",
  "province": "北京",
  "spotId": 123,           // 景点ID - 用于关联景点系统
  "spotRating": 5,         // 景点评分 - 1-5分
  "media": []              // 图片文件数组
}
```

## 景点关联机制

### **重要说明**
- `spotId` 是**必填字段**，用于将日记关联到景点系统
- `spotRating` 是**可选字段**，用于给景点评分
- 如果不提供 `spotId`，日记将无法关联到景点系统

### **景点关联流程**
1. 前端提供 `spotId` 和 `spotRating`
2. 后端自动创建日记-景点关联 (DiarySpot)
3. 后端保存景点评分 (SpotRating)
4. 日记与景点系统完全关联

### **景点数据来源**
- 景点信息存储在 `spots` 表中
- 景点ID通过景点管理接口获取
- 前端需要先获取景点列表，让用户选择景点

## 使用示例

### **JavaScript示例**
```javascript
const createDiary = async (formData) => {
  const data = new FormData();
  data.append('title', formData.title);
  data.append('content', formData.content);
  data.append('destination', formData.destination);
  data.append('city', formData.city);
  data.append('province', formData.province);
  data.append('spotId', formData.spotId);        // 景点ID
  data.append('spotRating', formData.spotRating); // 景点评分
  
  // 添加图片文件
  if (formData.images) {
    formData.images.forEach(image => {
      data.append('media', image);
    });
  }
  
  const response = await fetch('/api/diaries', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: data
  });
  
  return response.json();
};
```

### **获取景点列表**
```javascript
// 获取景点列表供用户选择
const getSpots = async () => {
  const response = await fetch('/api/spots');
  return response.json();
};

// 获取城市景点
const getSpotsByCity = async (city) => {
  const response = await fetch(`/api/spots/city/${city}`);
  return response.json();
};
```

## 注意事项

1. **景点ID必须存在**：`spotId` 必须是数据库中存在的景点ID
2. **评分范围**：`spotRating` 必须是 1-5 的整数
3. **关联完整性**：提供 `spotId` 后，日记会自动关联到景点系统
4. **向后兼容**：`destination`、`city`、`province` 字段仍然保留，用于显示和搜索

## 搜索功能

创建日记后，可以通过以下方式搜索：
- 按景点名称：`/api/diaries/search/destination?keyword=故宫`
- 按城市：`/api/diaries/search/destination?keyword=北京`
- 按省份：`/api/diaries/search/destination?keyword=四川`
- 按景点ID：通过 `spots` 关联查询 