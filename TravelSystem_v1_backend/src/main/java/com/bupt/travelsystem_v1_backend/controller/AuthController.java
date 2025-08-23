package com.bupt.travelsystem_v1_backend.controller;

import com.bupt.travelsystem_v1_backend.dto.LoginRequest;
import com.bupt.travelsystem_v1_backend.dto.RegisterRequest;
import com.bupt.travelsystem_v1_backend.dto.SendCodeRequest;
import com.bupt.travelsystem_v1_backend.dto.UserResponse;
import com.bupt.travelsystem_v1_backend.entity.User;
import com.bupt.travelsystem_v1_backend.service.AuthService;
import com.bupt.travelsystem_v1_backend.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            log.info("注册请求: {}", request.getUsername());
            User user = authService.register(request);
            return ResponseEntity.ok(new UserResponse(user));
        } catch (RuntimeException e) {
            log.error("注册失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            log.info("登录请求: {}", request.getEmail());
            User user = authService.login(request);
            String token = jwtUtil.generateToken(user.getUsername());
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", new UserResponse(user));
            response.put("token", token);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("登录失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody SendCodeRequest request) {
        try {
            log.info("发送验证码请求: {}", request.getEmail());
            authService.sendVerificationCode(request.getEmail());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "验证码发送成功");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("发送验证码失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkLoginStatus() {
        try {
            User user = authService.getCurrentUser();
            if (user == null) {
                return ResponseEntity.ok().body(null);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("avatar", user.getAvatar());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("检查登录状态失败: {}", e.getMessage());
            return ResponseEntity.ok().body(null);
        }
    }
}