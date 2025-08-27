# 增强版目的地搜索API文档

## 概述

增强版目的地搜索功能支持按景点名称、城市、省份三个字段进行智能搜索，一个接口满足多种搜索需求。

## 数据库变更

### 新增字段
```sql
-- 为diaries表添加city和province列
ALTER TABLE diaries ADD COLUMN city VARCHAR(100) COMMENT '景点所属城市';
ALTER TABLE diaries ADD COLUMN province VARCHAR(100) COMMENT '景点所属省份';

-- 添加索引提高搜索性能
CREATE INDEX idx_diaries_city ON diaries(city);
CREATE INDEX idx_diaries_province ON diaries(province);
```

## API接口

### 1. 创建日记（支持城市和省份）

**接口**: `POST /api/diaries`

**请求类型**: `multipart/form-data`

**请求参数**:
```form-data
title: 日记标题 (必填)
content: 日记内容 (必填)
destination: 景点名称 (可选)
city: 景点所属城市 (可选)
province: 景点所属省份 (可选)
spotId: 景点ID (可选)
spotRating: 景点评分 (可选)
media: 媒体文件数组 (可选)
```

**示例**:
```bash
curl -X POST "http://localhost:9090/api/diaries" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "title=故宫一日游" \
  -F "content=今天参观了故宫..." \
  -F "destination=故宫" \
  -F "city=北京" \
  -F "province=北京" \
  -F "media=@image1.jpg" \
  -F "media=@image2.jpg"
```

### 2. 增强版目的地搜索

**接口**: `GET /api/diaries/search/destination`

**请求参数**:
```query
keyword: 搜索关键词 (可选)
page: 页码，默认0 (可选)
size: 每页大小，默认10 (可选)
```

**搜索逻辑**:
- 如果 `keyword` 为空，返回所有日记
- 如果 `keyword` 有值，在以下三个字段中搜索：
  - `destination` (景点名称)
  - `city` (城市)
  - `province` (省份)

**搜索示例**:

#### 按景点名称搜索
```bash
GET /api/diaries/search/destination?keyword=故宫
```
返回所有 `destination` 为"故宫"的日记

#### 按城市搜索
```bash
GET /api/diaries/search/destination?keyword=成都
```
返回所有 `city` 为"成都"的日记

#### 按省份搜索
```bash
GET /api/diaries/search/destination?keyword=四川
```
返回所有 `province` 为"四川"的日记

#### 返回所有日记
```bash
GET /api/diaries/search/destination
```
返回所有日记（分页）

**响应格式**:
```json
{
  "content": [
    {
      "id": 1,
      "title": "故宫一日游",
      "content": "今天参观了故宫...",
      "destination": "故宫",
      "city": "北京",
      "province": "北京",
      "author": {
        "id": 1,
        "username": "旅行者"
      },
      "images": [
        {
          "imageUrl": "/uploads/diaries/uuid_image1.jpg"
        }
      ],
      "createdAt": "2024-01-01T10:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

## 前端集成建议

### 1. 创建日记表单
```javascript
const createDiary = async (formData) => {
  const data = new FormData();
  data.append('title', formData.title);
  data.append('content', formData.content);
  data.append('destination', formData.destination);
  data.append('city', formData.city);
  data.append('province', formData.province);
  
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

### 2. 目的地搜索
```javascript
const searchByDestination = async (keyword, page = 0, size = 10) => {
  const params = new URLSearchParams();
  if (keyword) {
    params.append('keyword', keyword);
  }
  params.append('page', page);
  params.append('size', size);
  
  const response = await fetch(`/api/diaries/search/destination?${params}`);
  return response.json();
};

// 使用示例
const searchResults = await searchByDestination('成都');  // 搜索成都的日记
const allDiaries = await searchByDestination();          // 获取所有日记
```

## 测试

运行测试脚本验证功能：
```bash
chmod +x test_enhanced_destination_search.sh
./test_enhanced_destination_search.sh
```

## 注意事项

1. **数据库迁移**: 执行SQL脚本添加新字段
2. **索引优化**: 新字段已添加索引，提高搜索性能
3. **向后兼容**: 原有API保持不变，新增字段为可选
4. **搜索性能**: 使用OR查询，建议在数据量大时考虑全文搜索引擎
5. **数据一致性**: 建议前端验证城市和省份的准确性

## 扩展功能

未来可以考虑：
- 添加城市和省份的标准化数据
- 支持模糊搜索和拼音搜索
- 集成地图API，支持地理位置搜索
- 添加搜索建议和自动补全功能 