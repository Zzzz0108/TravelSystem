import api from '@/utils/axios'//引入axios

// 获取所有建筑物
export function getBuildings() {
  return api.get('/api/buildings')
}

// 获取所有设施
export function getFacilities() {
  return api.get('/api/facilities')
}

// 获取所有道路连接
export function getRoadConnections() {
  return api.get('/api/road-connections')
}

// 获取特定道路的路径点
export function getRoadPathPoints(roadId) {
  return api.get(`/api/road-path-points/${roadId}`)
} 