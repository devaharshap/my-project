package com.ecommerce.dto.response;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String notes;
    private List<OrderItemResponse> items;
    private AddressResponse address;
    private PaymentResponse payment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal price;
        private BigDecimal total;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressResponse {
        private Long id;
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PaymentResponse {
        private Long id;
        private String status;
        private String method;
        private BigDecimal amount;
        private String transactionId;
    }

    public static OrderResponse from(Order order) {
        OrderResponse.AddressResponse addr = null;
        if (order.getAddress() != null) {
            var a = order.getAddress();
            addr = AddressResponse.builder()
                    .id(a.getId()).street(a.getStreet()).city(a.getCity())
                    .state(a.getState()).zipCode(a.getZipCode()).country(a.getCountry())
                    .build();
        }
        OrderResponse.PaymentResponse pay = null;
        if (order.getPayment() != null) {
            var p = order.getPayment();
            pay = PaymentResponse.builder()
                    .id(p.getId()).status(p.getStatus().name())
                    .method(p.getMethod().name()).amount(p.getAmount())
                    .transactionId(p.getTransactionId())
                    .build();
        }
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> OrderItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct() != null ? i.getProduct().getId() : null)
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .total(i.getTotal())
                        .build())
                .collect(Collectors.toList());
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shippingCost(order.getShippingCost())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .items(items)
                .address(addr)
                .payment(pay)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
