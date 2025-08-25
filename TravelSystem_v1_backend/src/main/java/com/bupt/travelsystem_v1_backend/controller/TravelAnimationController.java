package com.bupt.travelsystem_v1_backend.controller;

import com.bupt.travelsystem_v1_backend.entity.TravelAnimation;
import com.bupt.travelsystem_v1_backend.entity.User;
import com.bupt.travelsystem_v1_backend.service.TravelAnimationService;
import com.bupt.travelsystem_v1_backend.service.VideoProcessingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/animations")
@RequiredArgsConstructor
public class TravelAnimationController {

    private final TravelAnimationService animationService;
    private final VideoProcessingService videoProcessingService;
    private static final Logger log = LoggerFactory.getLogger(TravelAnimationController.class);
    
    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<?> createAnimation(
            @RequestParam("title") String title,
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam("style") String style,
            @RequestParam("duration") Integer duration,
            @RequestParam("musicType") String musicType,
            @RequestParam(value = "transitionEffect", defaultValue = "FADE") String transitionEffect,
            @RequestParam(value = "subtitleText", required = false) String subtitleText,
            @RequestParam(value = "subtitleStyle", defaultValue = "ELEGANT") String subtitleStyle,
            @RequestParam(value = "autoEnhance", defaultValue = "true") Boolean autoEnhance,
            @RequestParam(value = "removeNoise", defaultValue = "false") Boolean removeNoise,
            @RequestParam(value = "colorCorrection", defaultValue = "true") Boolean colorCorrection,
            @RequestParam(value = "faceBeautify", defaultValue = "false") Boolean faceBeautify) {
        
        try {
            // 从SecurityContext获取当前用户
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("用户未登录");
            }

            String username = authentication.getName();
            log.debug("Creating animation for user: {}", username);
            
            // 创建动画记录
            TravelAnimation animation = animationService.createAnimation(
                username,
                title,
                images,
                TravelAnimation.AnimationStyle.valueOf(style),
                duration,
                TravelAnimation.MusicType.valueOf(musicType),
                TravelAnimation.TransitionEffect.valueOf(transitionEffect),
                subtitleText,
                TravelAnimation.SubtitleStyle.valueOf(subtitleStyle),
                autoEnhance,
                removeNoise,
                colorCorrection,
                faceBeautify
            );

            // 异步处理视频生成
            new Thread(() -> {
                try {
                    // 获取图片URL列表
                    List<String> imageUrls = animation.getImages().stream()
                        .map(img -> img.getImageUrl())
                        .toList();

                    // 处理视频
                    String videoUrl = videoProcessingService.processAnimation(animation, imageUrls);

                    // 更新视频URL
                    animationService.updateVideoUrl(animation.getId(), videoUrl);
                } catch (Exception e) {
                    log.error("视频生成失败", e);
                    // 更新状态为失败
                    animationService.updateAnimationStatus(animation.getId(), TravelAnimation.AnimationStatus.FAILED);
                }
            }).start();

            // 只返回必要的信息
            Map<String, Object> response = new HashMap<>();
            response.put("id", animation.getId());
            response.put("status", animation.getStatus());
            response.put("title", animation.getTitle());
            response.put("createdAt", animation.getCreatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("创建动画失败", e);
            return ResponseEntity.badRequest().body("创建动画失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAnimation(@PathVariable Long id) {
        try {
            TravelAnimation animation = animationService.getAnimation(id);
            // 只返回必要的信息
            Map<String, Object> response = new HashMap<>();
            response.put("id", animation.getId());
            response.put("status", animation.getStatus());
            response.put("title", animation.getTitle());
            response.put("videoUrl", animation.getVideoUrl());
            response.put("createdAt", animation.getCreatedAt());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserAnimations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("用户未登录");
            }

            String username = authentication.getName();
            return ResponseEntity.ok(animationService.getUserAnimations(username, 
                org.springframework.data.domain.PageRequest.of(page, size)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("获取动画列表失败: " + e.getMessage());
        }
    }

    /**
     * 下载视频文件
     */
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadVideo(@RequestParam String videoUrl) {
        try {
            // 使用配置文件中的路径
            String filePath = uploadDir + "/" + videoUrl;
            Path path = Paths.get(filePath);
            Resource resource = new FileSystemResource(path);
            
            if (!resource.exists()) {
                log.warn("视频文件不存在: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            // 生成下载文件名
            String fileName = "旅行动画_" + System.currentTimeMillis() + ".mp4";
            
            log.info("开始下载视频: {} -> {}", filePath, fileName);
            
            // 设置下载头
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CONTENT_TYPE, "video/mp4")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(resource.contentLength()))
                .body(resource);
                
        } catch (Exception e) {
            log.error("下载视频失败: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 