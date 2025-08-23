package com.bupt.travelsystem_v1_backend.repository;

import com.bupt.travelsystem_v1_backend.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    
    @Query("SELECT vc FROM VerificationCode vc WHERE vc.email = :email AND vc.code = :code AND vc.expireTime > :now AND vc.used = false ORDER BY vc.createdAt DESC")
    Optional<VerificationCode> findValidCode(@Param("email") String email, @Param("code") String code, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(vc) FROM VerificationCode vc WHERE vc.email = :email AND vc.createdAt > :since")
    long countRecentCodes(@Param("email") String email, @Param("since") LocalDateTime since);
} 