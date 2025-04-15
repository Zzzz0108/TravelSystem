package com.tourism.model;

import java.util.Objects;

/**
 * 表示地理坐标（经度、纬度）的类
 * 支持距离计算、坐标校验、格式化输出
 */
public class LatLng {
    private static final double EARTH_RADIUS = 6371e3; // 地球半径（米）

    private double latitude;   // 纬度 [-90, 90]
    private double longitude;  // 经度 [-180, 180]

    //=== 构造方法 ===//
    public LatLng(double latitude, double longitude) {
        setLatitude(latitude);
        setLongitude(longitude);
    }

    //=== 核心方法 ===//
    /**
     * 计算与另一坐标的欧几里得距离（简化版，适用于小范围地图）
     */
    public double distanceTo(LatLng other) {
        double latDiff = this.latitude - other.latitude;
        double lngDiff = this.longitude - other.longitude;
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    }

    /**
     * 计算地球表面真实距离（Haversine公式，单位：米）
     */
    public double haversineDistanceTo(LatLng other) {
        double lat1Rad = Math.toRadians(this.latitude);
        double lat2Rad = Math.toRadians(other.latitude);
        double deltaLat = Math.toRadians(other.latitude - this.latitude);
        double deltaLng = Math.toRadians(other.longitude - this.longitude);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

    //=== 校验方法 ===//
    private boolean isValidLatitude(double latitude) {
        return latitude >= -90 && latitude <= 90;
    }

    private boolean isValidLongitude(double longitude) {
        return longitude >= -180 && longitude <= 180;
    }

    //=== Getter/Setter ===//
    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        if (!isValidLatitude(latitude)) {
            throw new IllegalArgumentException("纬度必须在 -90 到 90 之间");
        }
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        if (!isValidLongitude(longitude)) {
            throw new IllegalArgumentException("经度必须在 -180 到 180 之间");
        }
        this.longitude = longitude;
    }

    //=== 工具方法 ===//
    @Override
    public String toString() {
        return String.format("(%.6f, %.6f)", latitude, longitude);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        LatLng other = (LatLng) obj;
        return Double.compare(other.latitude, latitude) == 0 &&
                Double.compare(other.longitude, longitude) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(latitude, longitude);
    }
}