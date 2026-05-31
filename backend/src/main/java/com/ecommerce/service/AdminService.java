package com.ecommerce.service;

import com.ecommerce.dto.response.DashboardResponse;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final ProductService productService;

    public DashboardResponse getDashboard() {
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();

        long totalUsers = userRepository.count();
        long totalProducts = productRepository.findByActiveTrue(
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumRevenueSince(LocalDateTime.of(2000, 1, 1, 0, 0));

        long ordersToday = orderService.countOrdersSince(startOfToday);
        BigDecimal revenueToday = orderService.sumRevenueSince(startOfToday);
        long activeCustomers = orderRepository.countActiveCustomersSince(startOfMonth);
        long pendingOrders = orderService.countPendingOrders();
        long lowStock = productService.countLowStock(5);

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .ordersToday(ordersToday)
                .revenueToday(revenueToday != null ? revenueToday : BigDecimal.ZERO)
                .activeCustomers(activeCustomers)
                .pendingOrders(pendingOrders)
                .lowStockProducts(lowStock)
                .build();
    }
}
