package com.bupt.travelsystem_v1_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "travel_animations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TravelAnimation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "favoriteSpots", "diaries", "diaryLikes", "animations"})
    private User user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AnimationStyle style;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MusicType musicType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AnimationStatus status;

    @Column
    private String videoUrl;

    @OneToMany(mappedBy = "animation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"animation", "hibernateLazyInitializer", "handler"})
    private List<AnimationImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AnimationStyle {
        REALISTIC,    // 写实风格
        CARTOON,      // 卡通风格
        WATERCOLOR    // 水彩风格
    }

    public enum MusicType {
        NONE,        // 无音乐
        PEACEFUL,    // 舒缓音乐
        ENERGETIC,   // 活力音乐
        ROMANTIC,    // 浪漫音乐
        ADVENTURE,   // 冒险音乐
        NATURE,      // 自然音乐
        URBAN,       // 都市音乐
        ETHNIC,      // 民族音乐
        ELECTRONIC,  // 电子音乐
        CLASSICAL,   // 古典音乐
        JAZZ         // 爵士音乐
    }

    public enum TransitionEffect {
        NONE,           // 无转场
        FADE,           // 淡入淡出
        SLIDE_LEFT,     // 左滑
        SLIDE_RIGHT,    // 右滑
        SLIDE_UP,       // 上滑
        SLIDE_DOWN,     // 下滑
        ZOOM_IN,        // 放大
        ZOOM_OUT,       // 缩小
        ROTATE,         // 旋转
        WIPE,           // 擦除
        DISSOLVE,       // 溶解
        MORPH           // 变形
    }

    public enum AnimationStatus {
        PENDING,     // 等待处理
        PROCESSING,  // 处理中
        COMPLETED,   // 已完成
        FAILED       // 处理失败
    }

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransitionEffect transitionEffect = TransitionEffect.FADE;

    @Column
    private String subtitleText;

    @Column
    @Enumerated(EnumType.STRING)
    private SubtitleStyle subtitleStyle = SubtitleStyle.ELEGANT;

    @Column
    private Boolean autoEnhance = true;

    @Column
    private Boolean removeNoise = false;

    @Column
    private Boolean colorCorrection = true;

    @Column
    private Boolean faceBeautify = false;

    public enum SubtitleStyle {
        ELEGANT,     // 优雅
        BOLD,        // 粗体
        HANDWRITING, // 手写
        NEON         // 霓虹
    }
} 