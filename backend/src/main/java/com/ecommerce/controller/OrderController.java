package com.ecommerce.controller;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully",
                        orderService.placeOrder(userDetails.getUsername(), request)));
    }

    @GetMapping
    @Operation(summary = "Get user's order history")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getUserOrders(userDetails.getUsername(),
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrderById(userDetails.getUsername(), orderId)));
    }

    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.cancelOrder(userDetails.getUsername(), orderId)));
    }
}
