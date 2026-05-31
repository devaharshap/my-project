package com.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long ordersToday;
    private BigDecimal revenueToday;
    private long activeCustomers;
    private long pendingOrders;
    private long lowStockProducts;
}
