package com.tourism.service;

import com.tourism.model.LatLng;
import com.tourism.model.Place;
import com.tourism.model.Road;

import java.util.*;

public class AStarPathFinder {

    // A*的节点类（记录算法运行中的临时状态）
    private static class Node {
        Long id;           // 节点ID（对应Place或ServiceFacility的ID）
        double gCost;      // 从起点到当前节点的实际代价
        double hCost;      // 到终点的启发式代价
        double fCost;      // 总代价（f = g + h）
        Node parent;       // 父节点（用于回溯路径）

        Node(Long id) {
            this.id = id;
        }

        void updateCosts(double gCost, double hCost) {
            this.gCost = gCost;
            this.hCost = hCost;
            this.fCost = gCost + hCost;
        }
    }

    /**
     * 使用A*算法查找路径
     * @param startId 起点ID
     * @param endId   终点ID
     * @param places  所有景点的Map（ID -> Place）
     * @return 路径ID列表（按顺序从起点到终点）
     */
    public static List<Long> findPath(Long startId, Long endId, Map<Long, Place> places) {
        // 开放列表（按fCost排序的优先队列）
        PriorityQueue<Node> openList = new PriorityQueue<>(Comparator.comparingDouble(node -> node.fCost));
        // 记录所有已生成的节点（避免重复创建）
        Map<Long, Node> allNodes = new HashMap<>();
        // 关闭列表（存储已探索的节点ID）
        Set<Long> closedList = new HashSet<>();

        // 初始化起点
        Node startNode = new Node(startId);
        startNode.updateCosts(0, heuristic(startId, endId, places));
        openList.add(startNode);
        allNodes.put(startId, startNode);

        while (!openList.isEmpty()) {
            Node currentNode = openList.poll();
            closedList.add(currentNode.id);

            // 找到终点，回溯路径
            if (currentNode.id.equals(endId)) {
                return reconstructPath(currentNode);
            }

            // 遍历当前节点的所有邻接道路
            Place currentPlace = places.get(currentNode.id);
            for (Road road : currentPlace.getConnectedRoads()) {
                Long neighborId =(road.getStartId()==currentNode.id) ? road.getEndId() : road.getStartId();
                if (closedList.contains(neighborId)) continue;

                // 计算邻接节点的实际代价（gCost）
                double tentativeGCost = currentNode.gCost + road.getDistance();

                // 如果邻接节点未探索，或找到更优路径
                Node neighborNode = allNodes.getOrDefault(neighborId, new Node(neighborId));
                if (tentativeGCost < neighborNode.gCost || !allNodes.containsKey(neighborId)) {
                    neighborNode.updateCosts(
                            tentativeGCost,
                            heuristic(neighborId, endId, places)
                    );
                    neighborNode.parent = currentNode;
                    if (!openList.contains(neighborNode)) {
                        openList.add(neighborNode);
                    }
                    allNodes.put(neighborId, neighborNode);
                }
            }
        }

        return Collections.emptyList(); // 无路径
    }

    // 启发式函数（欧几里得距离）
    private static double heuristic(Long fromId, Long endId, Map<Long, Place> places) {
        LatLng from = places.get(fromId).getCoordinates();
        LatLng to = places.get(endId).getCoordinates();
        return Math.sqrt(
                Math.pow(from.getLatitude() - to.getLatitude(), 2) +
                        Math.pow(from.getLongitude() - to.getLongitude(), 2)
        );
    }

    // 回溯路径
    private static List<Long> reconstructPath(Node endNode) {
        LinkedList<Long> path = new LinkedList<>();
        Node current = endNode;
        while (current != null) {
            path.addFirst(current.id); // 从终点反向添加到起点
            current = current.parent;
        }
        return path;
    }
}
