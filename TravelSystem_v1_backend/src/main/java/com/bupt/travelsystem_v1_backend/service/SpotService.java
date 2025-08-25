package com.bupt.travelsystem_v1_backend.service;

import com.bupt.travelsystem_v1_backend.entity.Spot;
import java.util.List;
import java.util.Optional;

public interface SpotService {
    List<Spot> getAllSpots();
    List<Spot> searchSpots(String keyword, Spot.SpotType type);
    List<Spot> getSpotsByCity(String city);
    List<Spot> getSpotsByType(Spot.SpotType type);
    Optional<Spot> getSpotById(Long id);
    Spot saveSpot(Spot spot);
    void deleteSpot(Long id);
    Spot incrementViews(Long id);
    List<Spot> getUserFavorites();
    boolean toggleFavorite(Long spotId);
    
    // 新增评分相关方法
    Spot rateSpot(Long spotId, Integer rating);
    Double getAverageRating(Long spotId);
    Long getRatingCount(Long spotId);
    
    // 获取推荐景点（综合评分和热度）
    List<Spot> getRecommendedSpots(int limit);
    
    // 获取景点详情（包含 isFavorited 与 userRating）
    Spot getSpotDetail(Long id);
    
    // 获取景点收藏人数
    Integer getFavoriteCount(Long id);
} 