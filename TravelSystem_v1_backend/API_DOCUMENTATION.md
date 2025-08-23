# 旅行系统后端API文档

## 认证模块 (Authentication)

### 基础信息
- 基础路径: `/api/auth`
- 所有请求和响应均使用JSON格式
- 字符编码: UTF-8

### 1. 发送验证码
**接口**: `POST /api/auth/send-code`

**描述**: 向指定邮箱发送6位数字验证码

**请求体**:
```json
{
  "email": "user@example.com"
}
```

**响应**:
```json
{
  "message": "验证码发送成功"
}
```

**错误响应**:
```json
"请等待1分钟后再发送验证码"
"邮件发送失败"
```

**说明**:
- 验证码有效期为5分钟
- 同一邮箱1分钟内只能发送一次验证码
- 验证码使用后立即失效

---

### 2. 用户注册
**接口**: `POST /api/auth/register`

**描述**: 使用邮箱、用户名、密码和验证码注册新用户

**请求体**:
```json
{
  "email": "user@example.com",
  "username": "用户名",
  "password": "密码",
  "code": "123456"
}
```

**响应**:
```json
{
  "id": 1,
  "username": "用户名",
  "email": "user@example.com",
  "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=用户名"
}
```

**错误响应**:
```json
"用户名已存在"
"邮箱已被注册"
"验证码无效或已过期"
```

**说明**:
- 用户名和邮箱都必须是唯一的
- 密码会被加密存储
- 头像使用DiceBear API自动生成

---

### 3. 用户登录
**接口**: `POST /api/auth/login`

**描述**: 支持两种登录方式：密码登录和验证码登录

**请求体**:

**密码登录**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "loginType": "password"
}
```

**验证码登录**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "loginType": "code"
}
```

**响应**:
```json
{
  "user": {
    "id": 1,
    "username": "用户名",
    "email": "user@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=用户名"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**错误响应**:
```json
"用户不存在"
"密码错误"
"验证码无效或已过期"
"不支持的登录类型"
```

**说明**:
- 登录成功后返回JWT令牌
- 令牌需要包含在后续请求的Authorization头中
- 验证码登录后验证码会被标记为已使用

---

### 4. 检查登录状态
**接口**: `GET /api/auth/check`

**描述**: 检查当前用户的登录状态

**请求头**:
```
Authorization: Bearer <JWT_TOKEN>
```

**响应** (已登录):
```json
{
  "id": 1,
  "username": "用户名",
  "email": "user@example.com",
  "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=用户名"
}
```

**响应** (未登录):
```json
null
```

---

## 数据模型

### User (用户)
```json
{
  "id": "Long - 用户唯一标识符",
  "username": "String - 用户名",
  "email": "String - 邮箱地址",
  "avatar": "String - 头像URL",
  "createdAt": "DateTime - 创建时间",
  "updatedAt": "DateTime - 更新时间"
}
```

### VerificationCode (验证码)
```json
{
  "id": "Long - 验证码唯一标识符",
  "email": "String - 邮箱地址",
  "code": "String - 6位验证码",
  "expireTime": "DateTime - 过期时间",
  "createdAt": "DateTime - 创建时间",
  "used": "Boolean - 是否已使用"
}
```

---

## 错误处理

所有接口都使用统一的错误处理方式：
- HTTP状态码: 400 (Bad Request)
- 响应体: 错误消息字符串
- 日志: 所有错误都会记录到后端日志中

---

## 安全说明

1. **密码安全**: 所有密码都使用BCrypt加密存储
2. **JWT令牌**: 使用安全的JWT令牌进行身份验证
3. **验证码**: 验证码有5分钟有效期，使用后立即失效
4. **频率限制**: 同一邮箱1分钟内只能发送一次验证码
5. **HTTPS**: 生产环境建议使用HTTPS

---

## 测试建议

1. 先测试发送验证码接口
2. 使用收到的验证码测试注册接口
3. 测试密码登录和验证码登录
4. 测试登录状态检查接口
5. 验证错误处理是否正常工作 