package com.bupt.travelsystem_v1_backend.service.impl;

import com.bupt.travelsystem_v1_backend.dto.LoginRequest;
import com.bupt.travelsystem_v1_backend.dto.RegisterRequest;
import com.bupt.travelsystem_v1_backend.entity.User;
import com.bupt.travelsystem_v1_backend.entity.VerificationCode;
import com.bupt.travelsystem_v1_backend.repository.UserRepository;
import com.bupt.travelsystem_v1_backend.repository.VerificationCodeRepository;
import com.bupt.travelsystem_v1_backend.service.AuthService;
import com.bupt.travelsystem_v1_backend.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService, UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final Random random = new Random();

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                         VerificationCodeRepository verificationCodeRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.verificationCodeRepository = verificationCodeRepository;
        this.emailService = emailService;
    }

    @Override
    public User register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        // 验证验证码
        VerificationCode validCode = verificationCodeRepository.findValidCode(
            registerRequest.getEmail(), 
            registerRequest.getCode(), 
            LocalDateTime.now()
        ).orElseThrow(() -> new RuntimeException("验证码无效或已过期"));

        // 标记验证码为已使用
        validCode.setUsed(true);
        verificationCodeRepository.save(validCode);

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setAvatar("https://api.dicebear.com/7.x/initials/svg?seed=" + registerRequest.getUsername());

        return userRepository.save(user);
    }

    @Override
    public User login(LoginRequest loginRequest) {
        log.info("尝试登录用户: {}", loginRequest.getEmail());
        
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    log.error("用户不存在: {}", loginRequest.getEmail());
                    return new RuntimeException("用户不存在");
                });

        if ("password".equals(loginRequest.getLoginType())) {
            // 密码登录
            if (loginRequest.getPassword() == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                log.error("密码错误: {}", loginRequest.getEmail());
            throw new RuntimeException("密码错误");
        }
        } else if ("code".equals(loginRequest.getLoginType())) {
            // 验证码登录
            if (loginRequest.getCode() == null) {
                throw new RuntimeException("验证码不能为空");
            }
            
            VerificationCode validCode = verificationCodeRepository.findValidCode(
                loginRequest.getEmail(), 
                loginRequest.getCode(), 
                LocalDateTime.now()
            ).orElseThrow(() -> new RuntimeException("验证码无效或已过期"));
            
            // 标记验证码为已使用
            validCode.setUsed(true);
            verificationCodeRepository.save(validCode);
        } else {
            throw new RuntimeException("不支持的登录类型");
        }

        log.info("用户登录成功: {}", loginRequest.getEmail());
        return user;
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        return userRepository.findByUsername(authentication.getName())
                .orElse(null);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("用户未找到: " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities("USER")
                .build();
    }

    @Override
    public void sendVerificationCode(String email) {
        // 检查是否在1分钟内已经发送过验证码
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        if (verificationCodeRepository.countRecentCodes(email, oneMinuteAgo) > 0) {
            throw new RuntimeException("请等待1分钟后再发送验证码");
        }

        // 生成6位随机验证码
        String code = String.format("%06d", random.nextInt(1000000));
        
        // 创建验证码记录
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setExpireTime(LocalDateTime.now().plusMinutes(5)); // 5分钟有效期
        
        verificationCodeRepository.save(verificationCode);
        
        // 发送邮件
        emailService.sendVerificationCode(email, code);
        
        log.info("验证码发送成功: {}", email);
    }
} 