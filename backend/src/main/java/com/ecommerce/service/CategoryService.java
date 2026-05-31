package com.ecommerce.service;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Cacheable("categories")
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllActive().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrue().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    public CategoryResponse getById(Long id) {
        return CategoryResponse.from(findById(id));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse create(CategoryRequest request) {
        String slug = generateSlug(request.getName(), request.getSlug());
        if (categoryRepository.existsBySlug(slug)) {
            throw new BadRequestException("Category slug already exists: " + slug);
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .slug(slug)
                .imageUrl(request.getImageUrl())
                .build();
        if (request.getParentId() != null) {
            category.setParent(findById(request.getParentId()));
        }
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findById(id);
        category.setName(request.getName());
        if (StringUtils.hasText(request.getDescription())) category.setDescription(request.getDescription());
        if (StringUtils.hasText(request.getImageUrl())) category.setImageUrl(request.getImageUrl());
        if (request.getParentId() != null) {
            category.setParent(findById(request.getParentId()));
        }
        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void delete(Long id) {
        Category category = findById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private String generateSlug(String name, String providedSlug) {
        if (StringUtils.hasText(providedSlug)) return providedSlug.toLowerCase().replaceAll("\\s+", "-");
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
