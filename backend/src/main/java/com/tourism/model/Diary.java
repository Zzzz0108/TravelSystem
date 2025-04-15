package com.tourism.model;

public class Diary {
    private Long id; // 日记ID
    private String title; // 日记标题
    private String content; // 日记内容
    private String author; // 作者
    private int popularity; // 热度
    private double rating; // 评分

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public int getPopularity() { return popularity; }
    public void setPopularity(int popularity) { this.popularity = popularity; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
}

