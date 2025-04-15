package com.tourism.model;

public class Road {
    private Long id; // 道路ID
    private long startId; // 起点,记录起点和终点的Place的ID号
    private long endID; // 终点
    private double distance; // 距离
    private double congestion; // 拥挤度（0-1之间）

    // Getter和Setter方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public long getStartId() { return startId; }
    public void setStartId(long start) { this.startId = start; }
    public long getEndId() { return endID; }
    public void setEndId(long end) { this.endID = end; }
    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }
    public double getCongestion() { return congestion; }
    public void setCongestion(double congestion) { this.congestion = congestion; }
}
