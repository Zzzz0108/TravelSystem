package com.tourism.model;

import java.util.List;

public class Place {
    private Long id; // 景点ID
    private String name; // 景点名称
    private String category; // 景点类别（如学校、商场等）
    private int popularity; // 热度
    private double rating;// 评分
    private List<Road> connectedRoads; // 相连的道路列表
    private LatLng coordinates;


    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getPopularity() { return popularity; }
    public void setPopularity(int popularity) { this.popularity = popularity; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public List<Road> getConnectedRoads() { return connectedRoads; }
    public void setConnectedRoads(List<Road> connectedRoads) { this.connectedRoads = connectedRoads; }

    public LatLng getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(LatLng coordinates) {
        this.coordinates = coordinates;
    }
}
