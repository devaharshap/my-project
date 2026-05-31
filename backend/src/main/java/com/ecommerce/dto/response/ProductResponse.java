package com.ecommerce.dto.response;

import com.ecommerce.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String sku;
    private String imageUrl;
    private List<String> images;
    private BigDecimal rating;
    private Integer reviewCount;
    private boolean featured;
    private boolean active;
    private Long categoryId;
    private String categoryName;
    private Integer stockQuantity;
    private LocalDateTime createdAt;

    public static ProductResponse from(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .sku(p.getSku())
                .imageUrl(p.getImageUrl())
                .images(p.getImages())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .featured(p.isFeatured())
                .active(p.isActive())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .stockQuantity(p.getInventory() != null ? p.getInventory().getAvailableQuantity() : 0)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
