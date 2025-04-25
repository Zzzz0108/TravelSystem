package com.bupt.travelsystem_v1_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Data
@Embeddable
public class DiaryLikeId implements Serializable {
    @Column(name = "diary_id")
    private Long diaryId;

    @Column(name = "user_id")
    private Long userId;
} 