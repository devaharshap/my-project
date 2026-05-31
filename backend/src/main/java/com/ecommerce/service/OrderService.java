package com.ecommerce.service;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.entity.*;
import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.entity.enums.PaymentStatus;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.08");
    private static final BigDecimal SHIPPING_COST = new BigDecimal("5.99");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("50.00");

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryRepository inventoryRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final CartRepository cartRepository;
    private final UserService userService;

    @Transactional
    public OrderResponse placeOrder(String email, OrderRequest request) {
        User user = userService.getCurrentUser(email);
        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Address address = addressRepository.findByIdAndUserId(request.getAddressId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", request.getAddressId()));

        BigDecimal subtotal = cart.getTotal();
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0
                ? BigDecimal.ZERO : SHIPPING_COST;
        BigDecimal total = subtotal.add(tax).add(shipping);

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .address(address)
                .subtotal(subtotal)
                .tax(tax)
                .shippingCost(shipping)
                .totalAmount(total)
                .notes(request.getNotes())
                .build();

        List<OrderItem> items = cart.getItems().stream().map(cartItem -> {
            int reserved = inventoryRepository.reserveStock(cartItem.getProduct().getId(), cartItem.getQuantity());
            if (reserved == 0) {
                throw new BadRequestException("Insufficient stock for: " + cartItem.getProduct().getName());
            }
            return OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .productName(cartItem.getProduct().getName())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .total(cartItem.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
        }).collect(Collectors.toList());

        order.setItems(items);
        Order saved = orderRepository.save(order);

        Payment payment = Payment.builder()
                .order(saved)
                .amount(total)
                .method(request.getPaymentMethod())
                .status(PaymentStatus.COMPLETED)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .build();
        paymentRepository.save(payment);

        items.forEach(item ->
            inventoryRepository.deductStock(item.getProduct().getId(), item.getQuantity())
        );

        saved.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(saved);
        cartService.clearCart(email);

        return OrderResponse.from(orderRepository.findById(saved.getId()).orElseThrow());
    }

    public PageResponse<OrderResponse> getUserOrders(String email, Pageable pageable) {
        User user = userService.getCurrentUser(email);
        return PageResponse.of(orderRepository.findByUserId(user.getId(), pageable).map(OrderResponse::from));
    }

    public OrderResponse getOrderById(String email, Long orderId) {
        User user = userService.getCurrentUser(email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancelOrder(String email, Long orderId) {
        User user = userService.getCurrentUser(email);
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel order in status: " + order.getStatus());
        }

        order.getItems().forEach(item ->
            inventoryRepository.releaseReservation(item.getProduct().getId(), item.getQuantity())
        );
        order.setStatus(OrderStatus.CANCELLED);
        if (order.getPayment() != null) {
            order.getPayment().setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(order.getPayment());
        }
        return OrderResponse.from(orderRepository.save(order));
    }

    public PageResponse<OrderResponse> getAllOrders(Pageable pageable) {
        return PageResponse.of(orderRepository.findAll(pageable).map(OrderResponse::from));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        order.setStatus(status);
        return OrderResponse.from(orderRepository.save(order));
    }

    public long countPendingOrders() {
        return orderRepository.findByStatus(OrderStatus.PENDING, Pageable.unpaged()).getTotalElements();
    }

    public long countOrdersSince(LocalDateTime since) {
        return orderRepository.countOrdersSince(since);
    }

    public BigDecimal sumRevenueSince(LocalDateTime since) {
        return orderRepository.sumRevenueSince(since);
    }
}
