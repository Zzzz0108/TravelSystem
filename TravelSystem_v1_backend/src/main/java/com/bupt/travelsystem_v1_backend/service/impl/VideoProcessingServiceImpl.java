package com.bupt.travelsystem_v1_backend.service.impl;

import com.bupt.travelsystem_v1_backend.entity.TravelAnimation;
import com.bupt.travelsystem_v1_backend.service.VideoProcessingService;
import org.bytedeco.javacv.OpenCVFrameConverter;
import org.bytedeco.opencv.opencv_core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import java.nio.file.StandardCopyOption;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.bytedeco.opencv.global.opencv_core.*;
import static org.bytedeco.opencv.global.opencv_imgcodecs.*;
import static org.bytedeco.opencv.global.opencv_imgproc.*;
import static org.bytedeco.opencv.global.opencv_videoio.*;
import java.util.Arrays;

@Service
public class VideoProcessingServiceImpl implements VideoProcessingService {
    private static final Logger logger = LoggerFactory.getLogger(VideoProcessingServiceImpl.class);
    private static final OpenCVFrameConverter.ToMat converterToMat = new OpenCVFrameConverter.ToMat();

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Value("${app.video.dir}")
    private String videoDir;

    @Value("${app.music.dir:classpath:static/music}")
    private String musicDir;

    @Value("${app.image.enable-opencv:true}")
    private boolean enableOpenCV;

    @Value("${app.image.use-java-fallback:false}")
    private boolean useJavaFallback;

    @Override
    public String processAnimation(TravelAnimation animation, List<String> imageUrls) {
        try {
            logger.info("开始处理动画，图片数量: {}", imageUrls.size());
            
            // 确保videos目录存在
            Path videosDir = Paths.get(uploadDir, "videos");
            if (!Files.exists(videosDir)) {
                Files.createDirectories(videosDir);
            }
            logger.info("视频目录: {}", videosDir);

            // 创建临时目录
            String tempDir = createTempDirectory();
            logger.info("临时目录: {}", tempDir);
            List<String> processedImages = new ArrayList<>();

            // 处理每张图片
            for (int i = 0; i < imageUrls.size(); i++) {
                String imageUrl = imageUrls.get(i);
                String inputPath = Paths.get(uploadDir, imageUrl).toString();
                String outputPath = Paths.get(tempDir, "processed_" + i + ".jpg").toString();
                
                logger.info("处理图片 {}/{}: {} -> {}", i + 1, imageUrls.size(), inputPath, outputPath);
                
                // 智能图片增强
                enhanceImage(inputPath, outputPath, 
                    animation.getAutoEnhance(), 
                    animation.getRemoveNoise(), 
                    animation.getColorCorrection(), 
                    animation.getFaceBeautify());
                
                // 应用动画风格
                applyStyle(outputPath, outputPath, animation.getStyle());
                processedImages.add(outputPath);
                
                // 验证处理后的图片是否存在
                if (!Files.exists(Paths.get(outputPath))) {
                    logger.error("处理后的图片不存在: {}", outputPath);
                    throw new RuntimeException("图片处理失败: " + outputPath);
                }
                
                // 验证图片文件大小
                long fileSize = Files.size(Paths.get(outputPath));
                logger.info("处理后的图片大小: {} bytes", fileSize);
                if (fileSize == 0) {
                    logger.error("处理后的图片文件为空: {}", outputPath);
                    throw new RuntimeException("图片文件为空: " + outputPath);
                }
            }

            // 生成最终视频路径
            String finalVideoPath = Paths.get(videosDir.toString(), UUID.randomUUID().toString() + ".mp4").toString();
            
            // 验证所有处理后的图片
            logger.info("验证处理后的图片...");
            for (int i = 0; i < processedImages.size(); i++) {
                String imagePath = processedImages.get(i);
                if (Files.exists(Paths.get(imagePath))) {
                    long size = Files.size(Paths.get(imagePath));
                    logger.info("图片 {}: {} ({} bytes)", i + 1, imagePath, size);
                } else {
                    logger.error("图片不存在: {}", imagePath);
                    throw new RuntimeException("处理后的图片不存在: " + imagePath);
                }
            }
            
            logger.info("开始生成视频，输出路径: {}", finalVideoPath);
            
            // 生成视频并添加背景音乐
            if (animation.getMusicType() == TravelAnimation.MusicType.NONE) {
                // 如果没有音乐，直接生成视频
                generateVideo(processedImages, animation.getDuration(), finalVideoPath);
            } else {
                // 如果有音乐，先生成临时视频
                String tempVideoPath = Paths.get(tempDir, "temp_video.mp4").toString();
                generateVideo(processedImages, animation.getDuration(), tempVideoPath);
                // 添加背景音乐
                addBackgroundMusic(tempVideoPath, animation.getMusicType(), finalVideoPath);
                // 删除临时视频
                Files.deleteIfExists(Paths.get(tempVideoPath));
            }

            // 应用转场效果
            if (animation.getTransitionEffect() != TravelAnimation.TransitionEffect.NONE) {
                String tempVideoPath = finalVideoPath;
                finalVideoPath = Paths.get(videosDir.toString(), UUID.randomUUID().toString() + ".mp4").toString();
                applyTransitionEffect(tempVideoPath, animation.getTransitionEffect(), finalVideoPath);
                // 删除临时视频
                Files.deleteIfExists(Paths.get(tempVideoPath));
            }

            // 添加字幕
            if (animation.getSubtitleText() != null && !animation.getSubtitleText().trim().isEmpty()) {
                String tempVideoPath = finalVideoPath;
                finalVideoPath = Paths.get(videosDir.toString(), UUID.randomUUID().toString() + ".mp4").toString();
                addSubtitle(tempVideoPath, animation.getSubtitleText(), animation.getSubtitleStyle(), finalVideoPath);
                // 删除临时视频
                Files.deleteIfExists(Paths.get(tempVideoPath));
            }

            // 清理临时文件
            cleanupTempFiles(tempDir);
            logger.info("临时文件清理完成");

            // 返回相对路径
            String relativePath = "videos/" + Paths.get(finalVideoPath).getFileName().toString();
            logger.info("动画处理完成，返回路径: {}", relativePath);
            return relativePath;
        } catch (Exception e) {
            logger.error("处理动画失败", e);
            throw new RuntimeException("Failed to process animation", e);
        }
    }

    @Override
    public void applyStyle(String inputPath, String outputPath, TravelAnimation.AnimationStyle style) {
        Mat image = null;
        Mat processed = null;
        Mat gray = null;
        Mat edges = null;
        Mat smoothed = null;
        Mat hsv = null;
        Mat scalarMat = null;

        try {
            logger.info("开始处理图片: {}, 风格: {}", inputPath, style);
            
            // 读取图片
            image = imread(inputPath);
            if (image.empty()) {
                throw new RuntimeException("无法读取图片: " + inputPath);
            }
            logger.info("图片尺寸: {}x{}", image.cols(), image.rows());

            processed = new Mat();
            switch (style) {
                case REALISTIC:
                    // 写实风格：轻微增强对比度和饱和度
                    cvtColor(image, processed, COLOR_BGR2HSV);
                    scalarMat = new Mat(processed.size(), processed.type(), new Scalar(1.1, 1.1, 1.0, 0));
                    multiply(processed, scalarMat, processed);
                    cvtColor(processed, processed, COLOR_HSV2BGR);
                    break;
                case CARTOON:
                    // 卡通风格：边缘检测和颜色量化
                    gray = new Mat();
                    cvtColor(image, gray, COLOR_BGR2GRAY);
                    medianBlur(gray, gray, 5);
                    edges = new Mat();
                    adaptiveThreshold(gray, edges, 255,
                            ADAPTIVE_THRESH_MEAN_C,
                            THRESH_BINARY, 9, 2);
                    cvtColor(edges, processed, COLOR_GRAY2BGR);
                    break;
                case WATERCOLOR:
                    // 水彩风格：使用双边滤波和颜色平滑
                    // 1. 双边滤波
                    bilateralFilter(image, processed, 9, 75, 75);
                    
                    // 2. 颜色平滑
                    smoothed = new Mat();
                    GaussianBlur(processed, smoothed, new Size(5, 5), 0);
                    
                    // 3. 增强颜色
                    hsv = new Mat();
                    cvtColor(smoothed, hsv, COLOR_BGR2HSV);
                    scalarMat = new Mat(hsv.size(), hsv.type(), new Scalar(1.0, 1.2, 1.0, 0));
                    multiply(hsv, scalarMat, hsv);
                    cvtColor(hsv, processed, COLOR_HSV2BGR);
                    break;
                default:
                    throw new IllegalArgumentException("不支持的动画风格: " + style);
            }

            // 保存处理后的图片
            boolean success = imwrite(outputPath, processed);
            if (!success) {
                throw new RuntimeException("无法保存处理后的图片: " + outputPath);
            }
            logger.info("图片处理完成: {}", outputPath);
        } catch (Exception e) {
            logger.error("处理图片失败: {}", e.getMessage(), e);
            throw new RuntimeException("处理图片失败: " + e.getMessage(), e);
        } finally {
            // 释放所有Mat资源
            if (image != null) image.release();
            if (processed != null) processed.release();
            if (gray != null) gray.release();
            if (edges != null) edges.release();
            if (smoothed != null) smoothed.release();
            if (hsv != null) hsv.release();
            if (scalarMat != null) scalarMat.release();
        }
    }

    @Override
    public void addBackgroundMusic(String videoPath, TravelAnimation.MusicType musicType, String outputPath) {
        if (musicType == TravelAnimation.MusicType.NONE) {
            // 如果没有音乐，直接复制视频
            try {
                logger.info("无需添加背景音乐，直接复制视频: {} -> {}", videoPath, outputPath);
                Files.copy(Paths.get(videoPath), Paths.get(outputPath));
                return;
            } catch (IOException e) {
                logger.error("复制视频失败", e);
                throw new RuntimeException("Failed to copy video", e);
            }
        }

        // 选择音乐文件
        String musicFile = switch (musicType) {
            case PEACEFUL -> "peaceful.mp3";
            case ENERGETIC -> "energetic.mp3";
            case ROMANTIC -> "romantic.mp3";
            case ADVENTURE -> "adventure.mp3";
            case NATURE -> "nature.mp3";
            case URBAN -> "urban.mp3";
            case ETHNIC -> "ethnic.mp3";
            case ELECTRONIC -> "electronic.mp3";
            case CLASSICAL -> "classical.mp3";
            case JAZZ -> "jazz.mp3";
            case NONE -> null;
            default -> throw new IllegalArgumentException("不支持的音乐类型: " + musicType);
        };

        // 如果没有选择音乐，直接返回
        if (musicFile == null) {
            logger.info("未选择背景音乐，直接复制视频");
            try {
                Files.copy(Paths.get(videoPath), Paths.get(outputPath));
            } catch (IOException e) {
                logger.error("复制视频失败: {}", e.getMessage());
                throw new RuntimeException("复制视频失败: " + e.getMessage(), e);
            }
            return;
        }

        // 使用正确的音乐目录路径
        String musicPath;
        try {
            // 尝试从classpath加载音乐文件
            if (musicDir.startsWith("classpath:")) {
                String classpathPath = musicDir.substring("classpath:".length());
                Resource resource = new ClassPathResource(classpathPath + "/" + musicFile);
                if (resource.exists()) {
                    // 将classpath资源复制到临时文件
                    Path tempMusicFile = Files.createTempFile("music_", ".mp3");
                    Files.copy(resource.getInputStream(), tempMusicFile, StandardCopyOption.REPLACE_EXISTING);
                    musicPath = tempMusicFile.toString();
                    logger.info("从classpath加载音乐文件: {} -> {}", musicFile, musicPath);
                } else {
                    throw new RuntimeException("音乐文件不存在: " + musicFile);
                }
            } else {
                // 使用文件系统路径
                musicPath = Paths.get(musicDir, musicFile).toString();
                if (!Files.exists(Paths.get(musicPath))) {
                    throw new RuntimeException("音乐文件不存在: " + musicPath);
                }
            }
        } catch (Exception e) {
            logger.error("加载音乐文件失败: {}", e.getMessage());
            throw new RuntimeException("加载音乐文件失败: " + e.getMessage(), e);
        }

        // 使用FFmpeg添加背景音乐
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", videoPath,
                "-i", musicPath,
                "-c:v", "copy",
                "-c:a", "aac",
                "-b:a", "192k",
                "-map", "0:v:0",
                "-map", "1:a:0",
                "-shortest",
                outputPath
            );
            
            // 添加日志
            logger.info("开始添加背景音乐");
            logger.info("FFmpeg命令: {}", String.join(" ", pb.command()));

            Process process = pb.start();
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                // 获取错误输出
                String error = new String(process.getErrorStream().readAllBytes());
                logger.error("FFmpeg错误输出: {}", error);
                throw new RuntimeException("FFmpeg process failed with exit code: " + exitCode + "\nError: " + error);
            }

            logger.info("背景音乐添加成功: {}", outputPath);
        } catch (IOException | InterruptedException e) {
            logger.error("添加背景音乐失败", e);
            throw new RuntimeException("Failed to add background music", e);
        }
    }

    private String createTempDirectory() throws IOException {
        Path tempDir = Files.createTempDirectory("animation_");
        return tempDir.toString();
    }

    /**
     * 生成视频的主要方法 - 使用JavaCV
     */
    private void generateVideo(List<String> imagePaths, int totalDuration, String outputPath) {
        try {
            logger.info("开始生成视频，使用图片数量: {}", imagePaths.size());
            
            // 计算每张图片的帧数和时长
            double fps = 1.0; // 1帧/秒，简单可靠
            int totalFrames = totalDuration * (int)fps;
            int framesPerImage = totalFrames / imagePaths.size();
            
            // 确保总帧数正确，处理余数
            int remainingFrames = totalFrames - (framesPerImage * imagePaths.size());
            
            logger.info("视频参数: fps={}, 总帧数={}, 每张图片帧数={}, 剩余帧数={}", 
                       fps, totalFrames, framesPerImage, remainingFrames);
            
            // 使用JavaCV生成视频，传递剩余帧数信息
            generateVideoWithJavaCV(imagePaths, framesPerImage, remainingFrames, fps, outputPath);
            
        } catch (Exception e) {
            logger.error("视频生成失败", e);
            throw new RuntimeException("Failed to generate video", e);
        }
    }

    /**
     * 使用JavaCV生成视频
     */
    private void generateVideoWithJavaCV(List<String> imagePaths, int framesPerImage, int remainingFrames, double fps, String outputPath) {
        org.bytedeco.opencv.opencv_videoio.VideoWriter writer = null;
        try {
            logger.info("使用JavaCV生成视频...");
            
            // 设置视频参数
            Size frameSize = new Size(1920, 1080);
            int fourcc = org.bytedeco.opencv.opencv_videoio.VideoWriter.fourcc((byte)'H', (byte)'2', (byte)'6', (byte)'4'); // H.264编码
            
            logger.info("视频参数: 尺寸={}x{}, 编码=H.264, fps={}", frameSize.width(), frameSize.height(), fps);
            
            // 创建VideoWriter
            writer = new org.bytedeco.opencv.opencv_videoio.VideoWriter(outputPath, fourcc, fps, frameSize);
            if (!writer.isOpened()) {
                throw new RuntimeException("无法创建视频写入器: " + outputPath);
            }
            
            // 逐张图片处理
            for (int i = 0; i < imagePaths.size(); i++) {
                String imagePath = imagePaths.get(i);
                logger.info("处理图片 {}/{}: {}", i + 1, imagePaths.size(), imagePath);
                
                // 读取图片
                Mat frame = imread(imagePath);
                if (frame.empty()) {
                    logger.warn("无法读取图片: {}, 跳过", imagePath);
                    continue;
                }
                
                // 调整图片尺寸到1920x1080
                Mat resized = new Mat();
                resize(frame, resized, frameSize);
                
                // 如果图片不是3通道BGR，转换为BGR
                if (resized.channels() != 3) {
                    Mat bgr = new Mat();
                    cvtColor(resized, bgr, COLOR_GRAY2BGR);
                    resized = bgr;
                }
                
                // 计算当前图片应该写入的帧数
                int currentFrames = framesPerImage;
                // 如果是最后一张图片且有剩余帧数，添加剩余帧数
                if (i == imagePaths.size() - 1 && remainingFrames > 0) {
                    currentFrames += remainingFrames;
                }
                
                // 写入指定帧数
                for (int j = 0; j < currentFrames; j++) {
                    writer.write(resized);
                }
                
                logger.info("图片 {} 处理完成，写入 {} 帧", i + 1, currentFrames);
                
                // 释放资源
                frame.release();
                resized.release();
            }
            
            logger.info("JavaCV视频生成成功: {}", outputPath);
            
        } catch (Exception e) {
            logger.error("JavaCV视频生成失败", e);
            throw new RuntimeException("Failed to generate video with JavaCV", e);
        } finally {
            // 释放VideoWriter
            if (writer != null) {
                writer.release();
            }
        }
    }

    /**
     * 获取视频时长（秒）
     */
    private int getVideoDuration(String videoPath) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                "ffprobe",
                "-v", "quiet",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                videoPath
            );
            
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes()).trim();
            int exitCode = process.waitFor();
            
            if (exitCode == 0 && !output.isEmpty()) {
                // 解析时长（可能是小数，如30.0）
                double duration = Double.parseDouble(output);
                return (int) Math.ceil(duration); // 向上取整
            }
        } catch (Exception e) {
            logger.warn("无法获取视频时长，使用默认值: {}", e.getMessage());
        }
        
        // 如果无法获取时长，返回默认值30秒
        return 30;
    }

    private void cleanupTempFiles(String tempDir) {
        try {
            Files.walk(Paths.get(tempDir))
                .map(Path::toFile)
                .forEach(File::delete);
            Files.delete(Paths.get(tempDir));
        } catch (IOException e) {
            logger.warn("Failed to cleanup temporary files", e);
        }
    }

    /**
     * 备选的Java图片处理方法，当OpenCV失败时使用
     */
    private void processImageWithJava(String inputPath, String outputPath) {
        try {
            logger.info("使用Java备选方案处理图片: {} -> {}", inputPath, outputPath);
            // 直接复制原图，避免OpenCV问题
            Files.copy(Paths.get(inputPath), Paths.get(outputPath));
            logger.info("Java图片处理完成");
        } catch (IOException e) {
            logger.error("Java图片处理失败: {}", e.getMessage());
            throw new RuntimeException("Java图片处理失败: " + e.getMessage(), e);
        }
    }

    @Override
    public void enhanceImage(String inputPath, String outputPath, boolean autoEnhance, boolean removeNoise, boolean colorCorrection, boolean faceBeautify) {
        // 如果OpenCV被禁用或所有增强选项都关闭，直接复制原图
        if (!enableOpenCV || (!autoEnhance && !removeNoise && !colorCorrection && !faceBeautify)) {
            logger.info("OpenCV被禁用或所有增强选项都关闭，使用Java备选方案");
            processImageWithJava(inputPath, outputPath);
            return;
        }

        // 如果配置要求使用Java备选方案
        if (useJavaFallback) {
            logger.info("配置要求使用Java备选方案");
            processImageWithJava(inputPath, outputPath);
            return;
        }

        Mat image = null;
        Mat processed = null;
        Mat gray = null;
        Mat hsv = null;
        Mat scalarMat = null;

        try {
            logger.info("开始智能图片增强: {}", inputPath);
            
            // 检查输入文件是否存在
            if (!Files.exists(Paths.get(inputPath))) {
                throw new RuntimeException("输入图片文件不存在: " + inputPath);
            }
            
            // 读取图片
            image = imread(inputPath);
            if (image == null || image.empty()) {
                throw new RuntimeException("无法读取图片或图片为空: " + inputPath);
            }

            logger.info("图片读取成功，尺寸: {}x{}", image.cols(), image.rows());

            // 创建处理后的Mat对象
            processed = new Mat();
            image.copyTo(processed);

            // 自动增强
            if (autoEnhance) {
                try {
                    logger.info("执行自动增强...");
                    // 创建灰度图Mat对象
                    gray = new Mat();
                    cvtColor(processed, gray, COLOR_BGR2GRAY);
                    
                    // 检查灰度图是否有效
                    if (gray.empty()) {
                        logger.warn("灰度图转换失败，跳过自动增强");
                    } else {
                        // 直方图均衡化
                        equalizeHist(gray, gray);
                        cvtColor(gray, processed, COLOR_GRAY2BGR);
                        logger.info("自动增强完成");
                    }
                } catch (Exception e) {
                    logger.warn("自动增强失败，跳过此步骤: {}", e.getMessage());
                }
            }

            // 降噪处理
            if (removeNoise) {
                try {
                    logger.info("执行降噪处理...");
                    Mat denoised = new Mat();
                    // 使用高斯滤波替代，因为fastNlMeansDenoisingColored可能不可用
                    GaussianBlur(processed, denoised, new Size(3, 3), 0);
                    denoised.copyTo(processed);
                    denoised.release();
                    logger.info("降噪处理完成");
                } catch (Exception e) {
                    logger.warn("降噪处理失败，跳过此步骤: {}", e.getMessage());
                }
            }

            // 色彩校正
            if (colorCorrection) {
                try {
                    logger.info("执行色彩校正...");
                    hsv = new Mat();
                    cvtColor(processed, hsv, COLOR_BGR2HSV);
                    
                    if (!hsv.empty()) {
                        scalarMat = new Mat(hsv.size(), hsv.type(), new Scalar(1.0, 1.1, 1.05, 0));
                        multiply(hsv, scalarMat, hsv);
                        cvtColor(hsv, processed, COLOR_HSV2BGR);
                        logger.info("色彩校正完成");
                    } else {
                        logger.warn("HSV转换失败，跳过色彩校正");
                    }
                } catch (Exception e) {
                    logger.warn("色彩校正失败，跳过此步骤: {}", e.getMessage());
                }
            }

            // 人像美化（简单的皮肤平滑）
            if (faceBeautify) {
                try {
                    logger.info("执行人像美化...");
                    Mat smoothed = new Mat();
                    bilateralFilter(processed, smoothed, 15, 80, 80);
                    addWeighted(processed, 0.7, smoothed, 0.3, 0, processed);
                    smoothed.release();
                    logger.info("人像美化完成");
                } catch (Exception e) {
                    logger.warn("人像美化失败，跳过此步骤: {}", e.getMessage());
                }
            }

            // 保存处理后的图片
            boolean success = imwrite(outputPath, processed);
            if (!success) {
                logger.warn("OpenCV保存失败，尝试直接复制原图");
                // 如果OpenCV保存失败，直接复制原图
                Files.copy(Paths.get(inputPath), Paths.get(outputPath));
            }
            logger.info("图片增强完成: {}", outputPath);
        } catch (Exception e) {
            logger.error("图片增强失败: {}", e.getMessage(), e);
            // 如果所有处理都失败，尝试直接复制原图
            try {
                logger.info("尝试直接复制原图作为备选方案");
                Files.copy(Paths.get(inputPath), Paths.get(outputPath));
                logger.info("原图复制成功: {}", outputPath);
            } catch (IOException copyError) {
                logger.error("原图复制也失败: {}", copyError.getMessage());
                throw new RuntimeException("图片增强失败且无法复制原图: " + e.getMessage(), e);
            }
        } finally {
            // 释放所有Mat资源
            if (image != null) image.release();
            if (processed != null) processed.release();
            if (gray != null) gray.release();
            if (hsv != null) hsv.release();
            if (scalarMat != null) scalarMat.release();
        }
    }

    @Override
    public void applyTransitionEffect(String videoPath, TravelAnimation.TransitionEffect transitionEffect, String outputPath) {
        try {
            logger.info("开始应用转场效果: {} -> {}", transitionEffect, outputPath);
            
            // 获取视频时长
            int videoDuration = getVideoDuration(videoPath);
            logger.info("检测到视频时长: {} 秒", videoDuration);
            
            String filterComplex = "";
            switch (transitionEffect) {
                case FADE:
                    // 动态计算淡出时间：从视频结束前1秒开始淡出
                    int fadeOutStart = Math.max(0, videoDuration - 1);
                    filterComplex = String.format("fade=t=in:st=0:d=1,fade=t=out:st=%d:d=1", fadeOutStart);
                    break;
                case SLIDE_LEFT:
                    filterComplex = "slide=slide=left:duration=1";
                    break;
                case SLIDE_RIGHT:
                    filterComplex = "slide=slide=right:duration=1";
                    break;
                case SLIDE_UP:
                    filterComplex = "slide=slide=up:duration=1";
                    break;
                case SLIDE_DOWN:
                    filterComplex = "slide=slide=down:duration=1";
                    break;
                case ZOOM_IN:
                    filterComplex = "zoompan=z='min(zoom+0.0015,1.5)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'";
                    break;
                case ZOOM_OUT:
                    filterComplex = "zoompan=z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'";
                    break;
                case ROTATE:
                    filterComplex = "rotate=angle='t*0.1':fillcolor=black";
                    break;
                case WIPE:
                    filterComplex = "wipeleft";
                    break;
                case DISSOLVE:
                    filterComplex = "dissolve";
                    break;
                case MORPH:
                    filterComplex = "morpho";
                    break;
                default:
                    // 如果没有特殊效果，直接复制
                    try {
                        Files.copy(Paths.get(videoPath), Paths.get(outputPath));
                    } catch (IOException e) {
                        logger.error("复制视频失败: {}", e.getMessage());
                        throw new RuntimeException("复制视频失败: " + e.getMessage(), e);
                    }
                    return;
            }

            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", videoPath,
                "-vf", filterComplex,
                "-c:a", "copy",
                outputPath
            );

            logger.info("FFmpeg转场命令: {}", String.join(" ", pb.command()));
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                String error = new String(process.getErrorStream().readAllBytes());
                logger.error("FFmpeg转场错误: {}", error);
                throw new RuntimeException("转场效果应用失败");
            }

            logger.info("转场效果应用成功: {}", outputPath);
        } catch (Exception e) {
            logger.error("应用转场效果失败", e);
            throw new RuntimeException("转场效果应用失败: " + e.getMessage(), e);
        }
    }

    @Override
    public void addSubtitle(String videoPath, String subtitleText, TravelAnimation.SubtitleStyle subtitleStyle, String outputPath) {
        try {
            logger.info("开始添加字幕: {} -> {}", subtitleText, outputPath);
            
            // 字幕样式配置
            String subtitleStyleConfig = getSubtitleStyleConfig(subtitleText, subtitleStyle);

            ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg",
                "-i", videoPath,
                "-vf", subtitleStyleConfig,
                "-c:a", "copy",
                outputPath
            );

            logger.info("FFmpeg字幕命令: {}", String.join(" ", pb.command()));
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                String error = new String(process.getErrorStream().readAllBytes());
                logger.error("FFmpeg字幕错误: {}", error);
                throw new RuntimeException("字幕添加失败");
            }

            logger.info("字幕添加成功: {}", outputPath);
        } catch (Exception e) {
            logger.error("添加字幕失败", e);
            throw new RuntimeException("字幕添加失败: " + e.getMessage(), e);
        }
    }

    private String getSubtitleStyleConfig(String subtitleText, TravelAnimation.SubtitleStyle style) {
        switch (style) {
            case ELEGANT:
                return "drawtext=text='" + subtitleText + "':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-th-10:box=1:boxcolor=black@0.5";
            case BOLD:
                return "drawtext=text='" + subtitleText + "':fontcolor=white:fontsize=28:fontweight=bold:x=(w-text_w)/2:y=h-th-10:box=1:boxcolor=red@0.7";
            case HANDWRITING:
                return "drawtext=text='" + subtitleText + "':fontcolor=black:fontsize=26:x=(w-text_w)/2:y=h-th-10:box=1:boxcolor=white@0.8";
            case NEON:
                return "drawtext=text='" + subtitleText + "':fontcolor=cyan:fontsize=24:x=(w-text_w)/2:y=h-th-10:glowcolor=blue:glow=5";
            default:
                return "drawtext=text='" + subtitleText + "':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-th-10";
        }
    }
} 