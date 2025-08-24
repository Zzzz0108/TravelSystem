package com.bupt.travelsystem_v1_backend.service;
 
public interface EmailService {
    void sendVerificationCode(String email, String code);
} 