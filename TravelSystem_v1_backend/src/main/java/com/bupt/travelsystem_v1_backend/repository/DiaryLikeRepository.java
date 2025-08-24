package com.bupt.travelsystem_v1_backend.repository;

import com.bupt.travelsystem_v1_backend.entity.Diary;
import com.bupt.travelsystem_v1_backend.entity.DiaryLike;
import com.bupt.travelsystem_v1_backend.entity.DiaryLikeId;
import com.bupt.travelsystem_v1_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaryLikeRepository extends JpaRepository<DiaryLike, DiaryLikeId> {
    
    // 检查用户是否已经点赞过某日记
    boolean existsByDiaryAndUser(Diary diary, User user);
    
    // 根据日记ID和用户ID查找点赞记录
    @Query("SELECT dl FROM DiaryLike dl WHERE dl.diary.id = :diaryId AND dl.user.id = :userId")
    DiaryLike findByDiaryIdAndUserId(@Param("diaryId") Long diaryId, @Param("userId") Long userId);
    
    // 根据日记ID和用户ID删除点赞记录
    @Query("DELETE FROM DiaryLike dl WHERE dl.diary.id = :diaryId AND dl.user.id = :userId")
    void deleteByDiaryIdAndUserId(@Param("diaryId") Long diaryId, @Param("userId") Long userId);
    
    // 统计日记的点赞数
    @Query("SELECT COUNT(dl) FROM DiaryLike dl WHERE dl.diary.id = :diaryId")
    long countByDiaryId(@Param("diaryId") Long diaryId);
} 