package com.ecommerce.service;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final UserService userService;

    public CartResponse getCart(String email) {
        User user = userService.getCurrentUser(email);
        Cart cart = getOrCreateCart(user);
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse addItem(String email, CartItemRequest request) {
        User user = userService.getCurrentUser(email);
        Product product = productService.findById(request.getProductId());

        if (product.getInventory() == null || product.getInventory().getAvailableQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock for: " + product.getName());
        }

        Cart cart = getOrCreateCart(user);
        Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (product.getInventory().getAvailableQuantity() < newQty) {
                throw new BadRequestException("Not enough stock available");
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();
            cart.getItems().add(item);
            cartItemRepository.save(item);
        }

        return CartResponse.from(cartRepository.findByUserIdWithItems(user.getId()).orElseThrow());
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, Integer quantity) {
        User user = userService.getCurrentUser(email);
        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            if (item.getProduct().getInventory().getAvailableQuantity() < quantity) {
                throw new BadRequestException("Insufficient stock");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return CartResponse.from(cartRepository.findByUserIdWithItems(user.getId()).orElseThrow());
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        return updateItem(email, itemId, 0);
    }

    @Transactional
    public void clearCart(String email) {
        User user = userService.getCurrentUser(email);
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });
    }
}
