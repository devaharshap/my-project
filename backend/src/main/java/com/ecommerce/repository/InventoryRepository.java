package com.ecommerce.repository;

import com.ecommerce.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = i.reservedQuantity + :qty WHERE i.product.id = :productId AND i.quantity - i.reservedQuantity >= :qty")
    int reserveStock(Long productId, int qty);

    @Modifying
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :qty, i.reservedQuantity = i.reservedQuantity - :qty WHERE i.product.id = :productId")
    void deductStock(Long productId, int qty);

    @Modifying
    @Query("UPDATE Inventory i SET i.reservedQuantity = i.reservedQuantity - :qty WHERE i.product.id = :productId")
    void releaseReservation(Long productId, int qty);
}
