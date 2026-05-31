package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank @Size(max = 100)
    private String name;

    private String description;

    @Size(max = 100)
    private String slug;

    @Size(max = 500)
    private String imageUrl;

    private Long parentId;
}
