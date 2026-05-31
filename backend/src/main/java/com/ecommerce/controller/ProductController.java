package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog endpoints")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products with filtering")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (categoryId != null || minPrice != null || maxPrice != null || search != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    productService.filterProducts(categoryId, minPrice, maxPrice, search, pageable)));
        }
        return ResponseEntity.ok(ApiResponse.success(productService.getProducts(pageable)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by keyword")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.searchProducts(q, PageRequest.of(page, size))));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id)));
    }
}
