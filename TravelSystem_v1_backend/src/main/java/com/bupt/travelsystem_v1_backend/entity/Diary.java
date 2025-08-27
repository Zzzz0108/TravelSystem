package com.bupt.travelsystem_v1_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Data
@Entity
@Table(name = "diaries")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Diary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Lob
    @Column(name = "content_compressed", columnDefinition = "LONGBLOB")
    private byte[] contentCompressed;

    @Column(name = "is_compressed", nullable = false)
    private boolean isCompressed = false;

    @Column(length = 255)
    private String destination;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String province;

    @Column(columnDefinition = "TEXT")
    @JsonIgnore
    private String images; // JSON格式存储图片URL列表

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "favoriteSpots", "diaries", "diaryLikes", "comments", "email"})
    private User author;

    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"diary", "user"})
    private List<DiaryLike> diaryLikes = new ArrayList<>();

    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"diary", "author"})
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"diary", "user"})
    private List<DiaryRating> ratings = new ArrayList<>();

    @OneToMany(mappedBy = "diary", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"diary"})
    private List<DiarySpot> spots = new ArrayList<>();

    @Column(nullable = false)
    private Integer views = 0;

    @Column(nullable = false)
    private Integer likes = 0;

    @Column(name = "comments_count")
    private Integer commentsCount = 0;

    @Column(name = "average_rating", nullable = false)
    private Double averageRating = 0.0;

    @Column(name = "rating_count", nullable = false)
    private Integer ratingCount = 0;

    @Column(name = "popularity_score", nullable = false)
    private Double popularityScore = 0.0;

    @Transient
    private Integer userRating;

    @Column(name = "video_url")
    private String videoUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Integer getUserRating() {
        return userRating;
    }

    public void setUserRating(Integer rating) {
        this.userRating = rating;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    // 获取图片URL列表
    public List<String> getImageUrls() {
        if (images == null || images.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(images, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // 设置图片URL列表
    public void setImageUrls(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            this.images = null;
            return;
        }
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            this.images = objectMapper.writeValueAsString(imageUrls);
        } catch (Exception e) {
            this.images = null;
        }
    }
    
    // 获取前端期望的图片格式
    @JsonProperty("images")
    public List<Map<String, String>> getImagesForFrontend() {
        List<String> imageUrls = getImageUrls();
        List<Map<String, String>> result = new ArrayList<>();
        
        for (String url : imageUrls) {
            Map<String, String> image = new HashMap<>();
            image.put("imageUrl", url);
            image.put("url", url);
            result.add(image);
        }
        
        return result;
    }
} 