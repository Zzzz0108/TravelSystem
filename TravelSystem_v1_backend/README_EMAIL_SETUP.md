# 邮件服务配置说明

## 概述
本项目已更新为支持邮箱+密码和邮箱+验证码两种登录方式，需要配置邮件服务来发送验证码。

## 配置步骤

### 1. 获取QQ邮箱授权码
1. 登录QQ邮箱
2. 进入"设置" -> "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"POP3/SMTP服务"
5. 按照提示获取授权码（不是QQ密码）

### 2. 更新配置文件
在 `src/main/resources/application.properties` 中更新以下配置：

```properties
# 邮件服务配置
spring.mail.host=smtp.qq.com
spring.mail.port=587
spring.mail.username=你的QQ邮箱@qq.com
spring.mail.password=你的授权码（不是QQ密码）
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.default-encoding=UTF-8
```

### 3. 其他邮箱服务商配置

#### Gmail
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=你的Gmail邮箱
spring.mail.password=你的应用专用密码
```

#### 163邮箱
```properties
spring.mail.host=smtp.163.com
spring.mail.port=25
spring.mail.username=你的163邮箱
spring.mail.password=你的授权码
```

#### 126邮箱
```properties
spring.mail.host=smtp.126.com
spring.mail.port=25
spring.mail.username=你的126邮箱
spring.mail.password=你的授权码
```

## 注意事项
1. 不要使用邮箱登录密码，要使用专门的授权码
2. 确保防火墙允许相应的SMTP端口
3. 如果使用QQ邮箱，建议使用587端口（STARTTLS）
4. 测试时可以先设置 `spring.mail.debug=true` 来查看详细的连接信息

## 测试邮件服务
配置完成后，可以通过以下接口测试：
- POST `/api/auth/send-code` - 发送验证码
- 请求体: `{"email": "test@example.com"}`

如果配置正确，应该能收到验证码邮件。 