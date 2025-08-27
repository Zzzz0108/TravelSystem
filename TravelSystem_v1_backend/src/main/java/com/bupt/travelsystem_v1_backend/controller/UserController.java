package com.bupt.travelsystem_v1_backend.controller;

import com.bupt.travelsystem_v1_backend.dto.UserResponse;
import com.bupt.travelsystem_v1_backend.entity.Diary;
import com.bupt.travelsystem_v1_backend.entity.User;
import com.bupt.travelsystem_v1_backend.service.DiaryService;
import com.bupt.travelsystem_v1_backend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final DiaryService diaryService;

    public UserController(UserService userService, DiaryService diaryService) {
        this.userService = userService;
        this.diaryService = diaryService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserInfo(@PathVariable Long userId) {
        UserResponse userResponse = userService.getUserInfo(userId);
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUserInfo(@PathVariable Long userId, @RequestBody User user) {
        UserResponse updatedUser = userService.updateUserInfo(userId, user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/me/liked-diaries")
    public ResponseEntity<Page<Diary>> getCurrentUserLikedDiaries(
            Pageable pageable,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).build();
            }
            
            String username = authentication.getName();
            Long userId = userService.getUserIdByUsername(username);
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            
            Page<Diary> likedDiaries = diaryService.getLikedDiariesByUser(userId, pageable);
            return ResponseEntity.ok(likedDiaries);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
} 