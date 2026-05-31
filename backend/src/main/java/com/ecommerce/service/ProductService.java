package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    public PageResponse<ProductResponse> getProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByActiveTrue(pageable);
        return PageResponse.of(page.map(ProductResponse::from));
    }

    public PageResponse<ProductResponse> filterProducts(Long categoryId, BigDecimal minPrice,
                                                         BigDecimal maxPrice, String search,
                                                         Pageable pageable) {
        Page<Product> page = productRepository.filterProducts(categoryId, minPrice, maxPrice,
                StringUtils.hasText(search) ? search : null, pageable);
        return PageResponse.of(page.map(ProductResponse::from));
    }

    public PageResponse<ProductResponse> searchProducts(String query, Pageable pageable) {
        return PageResponse.of(productRepository.searchProducts(query, pageable).map(ProductResponse::from));
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findTop8ByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc()
                .stream().map(ProductResponse::from).toList();
    }

    public ProductResponse getById(Long id) {
        return ProductResponse.from(findById(id));
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (StringUtils.hasText(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("SKU already exists: " + request.getSku());
        }
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .sku(request.getSku())
                .imageUrl(request.getImageUrl())
                .images(request.getImages() != null ? request.getImages() : List.of())
                .category(category)
                .featured(request.isFeatured())
                .build();
        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .build();
        inventoryRepository.save(inventory);
        product.setInventory(inventory);

        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findById(id);
        product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        if (StringUtils.hasText(request.getImageUrl())) product.setImageUrl(request.getImageUrl());
        if (request.getImages() != null) product.setImages(request.getImages());
        product.setFeatured(request.isFeatured());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        product.setCategory(category);

        if (request.getStockQuantity() != null && product.getInventory() != null) {
            product.getInventory().setQuantity(request.getStockQuantity());
            inventoryRepository.save(product.getInventory());
        }
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    public long countLowStock(int threshold) {
        return inventoryRepository.findAll().stream()
                .filter(inv -> inv.getAvailableQuantity() <= threshold)
                .count();
    }
}
