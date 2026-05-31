package com.ecommerce.controller;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.request.UpdateProfileRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and address management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                UserResponse.from(userService.getCurrentUser(userDetails.getUsername()))));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(userDetails.getUsername(), request)));
    }

    @GetMapping("/me/addresses")
    @Operation(summary = "Get user addresses")
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getAddresses(userDetails.getUsername())));
    }

    @PostMapping("/me/addresses")
    @Operation(summary = "Add a new address")
    public ResponseEntity<ApiResponse<Address>> addAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.addAddress(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/me/addresses/{addressId}")
    @Operation(summary = "Delete an address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long addressId) {
        userService.deleteAddress(userDetails.getUsername(), addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }
}
