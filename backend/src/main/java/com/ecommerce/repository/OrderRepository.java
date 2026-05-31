package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :since")
    long countOrdersSince(LocalDateTime since);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status NOT IN ('CANCELLED', 'REFUNDED') AND o.createdAt >= :since")
    BigDecimal sumRevenueSince(LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.createdAt >= :since")
    long countActiveCustomersSince(LocalDateTime since);
}
