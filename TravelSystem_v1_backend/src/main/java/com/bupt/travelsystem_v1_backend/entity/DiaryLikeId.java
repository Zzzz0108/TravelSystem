package com.bupt.travelsystem_v1_backend.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Data
@NoArgsConstructor
public class DiaryLikeId implements Serializable {
    private Long diaryId;
    private Long userId;

    public DiaryLikeId(Long diaryId, Long userId) {
        this.diaryId = diaryId;
        this.userId = userId;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DiaryLikeId that = (DiaryLikeId) o;
        return Objects.equals(diaryId, that.diaryId) && Objects.equals(userId, that.userId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(diaryId, userId);
    }
} 