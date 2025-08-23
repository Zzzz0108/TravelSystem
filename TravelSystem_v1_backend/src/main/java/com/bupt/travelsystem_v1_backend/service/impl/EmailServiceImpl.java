package com.bupt.travelsystem_v1_backend.service.impl;

import com.bupt.travelsystem_v1_backend.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.from}")
    private String fromEmail;
    
    @Override
    public void sendVerificationCode(String email, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail); // 从配置文件读取发件人地址
            message.setTo(email);
            message.setSubject("Travel - 验证码");
            message.setText("您的验证码是: " + code + "\n\n验证码有效期为5分钟，请尽快使用。\n\n如果这不是您的操作，请忽略此邮件。");
            
            mailSender.send(message);
            log.info("验证码邮件发送成功: {}", email);
        } catch (Exception e) {
            log.error("发送验证码邮件失败: {}", email, e);
            throw new RuntimeException("邮件发送失败");
        }
    }
} 