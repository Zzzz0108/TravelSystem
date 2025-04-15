package com.tourism.model;

public class Food {
    private Long id; // 美食ID
    private String name; // 美食名称
    private String cuisine; // 菜系
    private String restaurant; // 饭店名称
    private int popularity; // 热度
    private double rating; // 评价

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }
    public String getRestaurant() { return restaurant; }
    public void setRestaurant(String restaurant) { this.restaurant = restaurant; }
    public int getPopularity() { return popularity; }
    public void setPopularity(int popularity) { this.popularity = popularity; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
}