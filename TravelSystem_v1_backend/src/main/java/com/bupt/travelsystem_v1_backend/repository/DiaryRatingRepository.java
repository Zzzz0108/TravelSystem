package com.bupt.travelsystem_v1_backend.repository;

import com.bupt.travelsystem_v1_backend.entity.Diary;
import com.bupt.travelsystem_v1_backend.entity.DiaryRating;
import com.bupt.travelsystem_v1_backend.entity.DiaryRatingId;
import com.bupt.travelsystem_v1_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiaryRatingRepository extends JpaRepository<DiaryRating, DiaryRatingId> {
    boolean existsByDiaryAndUser(Diary diary, User user);
    
    @Query("SELECT AVG(r.rating) FROM DiaryRating r WHERE r.diary = :diary")
    Double getAverageRatingByDiary(@Param("diary") Diary diary);
    
    @Query("SELECT COUNT(r) FROM DiaryRating r WHERE r.diary = :diary")
    Long getRatingCountByDiary(@Param("diary") Diary diary);
    
    @Query("SELECT r FROM DiaryRating r WHERE r.user.id = :userId")
    List<DiaryRating> findByUserId(@Param("userId") Long userId);
    
    // 根据日记ID和用户ID查找评分
    @Query("SELECT r FROM DiaryRating r WHERE r.diary.id = :diaryId AND r.user.id = :userId")
    DiaryRating findByDiaryIdAndUserId(@Param("diaryId") Long diaryId, @Param("userId") Long userId);
    
    // 检查用户是否已经评分过某日记
    @Query("SELECT COUNT(r) > 0 FROM DiaryRating r WHERE r.diary.id = :diaryId AND r.user.id = :userId")
    boolean existsByDiaryIdAndUserId(@Param("diaryId") Long diaryId, @Param("userId") Long userId);
} 