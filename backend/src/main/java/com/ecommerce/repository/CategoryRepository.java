package com.ecommerce.repository;

import com.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNullAndActiveTrue();
    List<Category> findByParentIdAndActiveTrue(Long parentId);
    Optional<Category> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT c FROM Category c WHERE c.active = true ORDER BY c.name")
    List<Category> findAllActive();
}
