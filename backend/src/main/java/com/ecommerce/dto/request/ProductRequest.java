package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank @Size(max = 255)
    private String name;

    private String description;

    @NotNull @DecimalMin("0.01")
    private BigDecimal price;

    private BigDecimal originalPrice;

    @NotNull
    private Long categoryId;

    @Size(max = 100)
    private String sku;

    @Size(max = 500)
    private String imageUrl;

    private List<String> images;

    private boolean featured = false;

    @Min(0)
    private Integer stockQuantity = 0;
}
