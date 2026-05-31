package com.ecommerce.dto.response;

import com.ecommerce.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String slug;
    private String imageUrl;
    private Long parentId;
    private String parentName;
    private boolean active;

    public static CategoryResponse from(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .slug(c.getSlug())
                .imageUrl(c.getImageUrl())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getName() : null)
                .active(c.isActive())
                .build();
    }
}
