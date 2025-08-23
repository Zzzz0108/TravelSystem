package com.bupt.travelsystem_v1_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "邮箱不能为空")
    private String email;

    private String password; // 密码登录时使用

    private String code; // 验证码登录时使用

    @NotBlank(message = "登录类型不能为空")
    private String loginType; // "password" 或 "code"

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLoginType() {
        return loginType;
    }

    public void setLoginType(String loginType) {
        this.loginType = loginType;
    }
}
