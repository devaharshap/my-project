package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private InventoryRepository inventoryRepository;

    @InjectMocks
    private ProductService productService;

    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        category = Category.builder().id(1L).name("Electronics").slug("electronics").build();
        product = Product.builder()
                .id(1L).name("Test Product").price(new BigDecimal("29.99"))
                .category(category).active(true)
                .inventory(Inventory.builder().quantity(10).reservedQuantity(0).build())
                .build();
    }

    @Test
    void getById_returnsProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        ProductResponse result = productService.getById(1L);
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Test Product");
        assertThat(result.getPrice()).isEqualByComparingTo("29.99");
    }

    @Test
    void getById_throwsWhenNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_savesProductAndInventory() {
        ProductRequest request = new ProductRequest();
        request.setName("New Product");
        request.setPrice(new BigDecimal("49.99"));
        request.setCategoryId(1L);
        request.setStockQuantity(50);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any())).thenReturn(product);
        when(inventoryRepository.save(any())).thenReturn(Inventory.builder().quantity(50).build());

        productService.create(request);

        verify(productRepository).save(any(Product.class));
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void create_throwsOnDuplicateSku() {
        ProductRequest request = new ProductRequest();
        request.setName("Product"); request.setPrice(BigDecimal.TEN);
        request.setCategoryId(1L); request.setSku("EXISTING-SKU");

        when(productRepository.existsBySku("EXISTING-SKU")).thenReturn(true);

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("SKU already exists");
    }

    @Test
    void delete_softDeletesProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenReturn(product);

        productService.delete(1L);

        assertThat(product.isActive()).isFalse();
        verify(productRepository).save(product);
    }
}
