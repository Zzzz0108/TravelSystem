package com.bupt.travelsystem_v1_backend.service;

import com.bupt.travelsystem_v1_backend.entity.TravelAnimation;
import java.util.List;

public interface VideoProcessingService {
    /**
     * 处理动画
     * @param animation 动画配置
     * @param imageUrls 图片URL列表
     * @return 生成的视频URL
     */
    String processAnimation(TravelAnimation animation, List<String> imageUrls);

    /**
     * 应用图片风格
     * @param inputPath 输入图片路径
     * @param outputPath 输出图片路径
     * @param style 动画风格
     */
    void applyStyle(String inputPath, String outputPath, TravelAnimation.AnimationStyle style);

    /**
     * 添加背景音乐
     * @param videoPath 视频路径
     * @param musicType 音乐类型
     * @param outputPath 输出路径
     */
    void addBackgroundMusic(String videoPath, TravelAnimation.MusicType musicType, String outputPath);

    /**
     * 应用转场效果
     * @param videoPath 视频路径
     * @param transitionEffect 转场效果
     * @param outputPath 输出路径
     */
    void applyTransitionEffect(String videoPath, TravelAnimation.TransitionEffect transitionEffect, String outputPath);

    /**
     * 添加字幕
     * @param videoPath 视频路径
     * @param subtitleText 字幕文本
     * @param subtitleStyle 字幕样式
     * @param outputPath 输出路径
     */
    void addSubtitle(String videoPath, String subtitleText, TravelAnimation.SubtitleStyle subtitleStyle, String outputPath);

    /**
     * 智能图片增强
     * @param inputPath 输入图片路径
     * @param outputPath 输出图片路径
     * @param autoEnhance 自动增强
     * @param removeNoise 降噪
     * @param colorCorrection 色彩校正
     * @param faceBeautify 人像美化
     */
    void enhanceImage(String inputPath, String outputPath, boolean autoEnhance, boolean removeNoise, boolean colorCorrection, boolean faceBeautify);
} 