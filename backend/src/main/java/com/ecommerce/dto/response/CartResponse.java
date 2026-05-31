package com.ecommerce.dto.response;

import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    private BigDecimal total;
    private int itemCount;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
        private Integer stockAvailable;
    }

    public static CartResponse from(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(CartResponse::mapItem)
                .collect(Collectors.toList());
        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .total(cart.getTotal())
                .itemCount(items.stream().mapToInt(CartItemResponse::getQuantity).sum())
                .build();
    }

    private static CartItemResponse mapItem(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImageUrl(item.getProduct().getImageUrl())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .stockAvailable(item.getProduct().getInventory() != null
                        ? item.getProduct().getInventory().getAvailableQuantity() : 0)
                .build();
    }
}
