package com.bupt.travelsystem_v1_backend.config;

import com.bupt.travelsystem_v1_backend.filter.JwtAuthenticationFilter;
import com.bupt.travelsystem_v1_backend.service.impl.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // 认证相关接口 - 公开
                .requestMatchers("/api/auth/**").permitAll()
                
                // 日记相关接口 - 区分公开和需要认证
                .requestMatchers("/api/diaries/search").permitAll()     // 基础搜索接口公开
                .requestMatchers("/api/diaries/search/**").permitAll()  // 所有搜索接口公开
                .requestMatchers("/api/diaries/latest").permitAll()     // 最新日记公开
                .requestMatchers("/api/diaries/popular").permitAll()    // 热门日记公开
                .requestMatchers("/api/diaries/recommended").permitAll() // 推荐日记公开
                .requestMatchers("/api/diaries/{id}").permitAll()       // 查看日记详情公开
                .requestMatchers("/api/diaries/{id}/views").permitAll() // 增加浏览量公开
                .requestMatchers("/api/diaries/{id}/compress").permitAll() // 压缩内容公开
                .requestMatchers("/api/diaries/{id}/decompress").permitAll() // 解压内容公开
                
                // 需要认证的日记操作
                .requestMatchers("/api/diaries").authenticated()        // 创建日记
                .requestMatchers("/api/diaries/{id}").authenticated()   // 更新/删除日记
                .requestMatchers("/api/diaries/{id}/like").authenticated()     // 点赞
                .requestMatchers("/api/diaries/{id}/unlike").authenticated()   // 取消点赞
                .requestMatchers("/api/diaries/{id}/rate").authenticated()     // 评分
                .requestMatchers("/api/diaries/{id}/rating").authenticated()   // 删除评分
                .requestMatchers("/api/diaries/{id}/user-rating").authenticated() // 获取用户评分
                .requestMatchers("/api/diaries/{id}/is-liked").authenticated()   // 检查点赞状态
                .requestMatchers("/api/diaries/{id}/has-rated").authenticated()  // 检查评分状态
                
                // 景点相关接口
                .requestMatchers("/api/spots").permitAll()              // 查看景点公开
                .requestMatchers("/api/spots/{id}").permitAll()         // 查看景点详情公开
                .requestMatchers("/api/spots/search/**").permitAll()    // 搜索景点公开
                .requestMatchers("/api/spots/{id}/rate").authenticated() // 评分景点需要认证
                
                // 路线相关接口
                .requestMatchers("/api/routes/**").permitAll()          // 路线相关公开
                
                // 地图相关接口
                .requestMatchers("/api/maps/**").permitAll()            // 地图相关公开
                
                // 旅行动画相关接口
                .requestMatchers("/api/travel-animations/**").permitAll() // 动画相关公开
                
                // 评论相关接口
                .requestMatchers("/api/comments/**").permitAll()        // 评论相关公开
                
                // 其他静态资源
                .requestMatchers("/static/**", "/public/**", "/resources/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                
                // 其他所有请求需要认证
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(userDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}