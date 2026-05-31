package com.ecommerce.controller;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.enums.OrderStatus;
import com.ecommerce.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final UserService userService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard analytics")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    // Product management
    @PostMapping("/products")
    @Operation(summary = "Create a product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(productService.create(request)));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.update(id, request)));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete (soft) a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    // Category management
    @PostMapping("/categories")
    @Operation(summary = "Create a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(categoryService.create(request)));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.update(id, request)));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    // Order management
    @GetMapping("/orders")
    @Operation(summary = "Get all orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getAllOrders(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(id, status)));
    }

    // User management
    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getAllUsers(search, PageRequest.of(page, size))));
    }

    @PutMapping("/users/{id}/toggle")
    @Operation(summary = "Enable or disable a user")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.toggleUserEnabled(id)));
    }
}
