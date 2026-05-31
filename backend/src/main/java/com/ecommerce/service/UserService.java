package com.ecommerce.service;

import com.ecommerce.dto.request.AddressRequest;
import com.ecommerce.dto.request.UpdateProfileRequest;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getCurrentUser(email);
        if (StringUtils.hasText(request.getFirstName())) user.setFirstName(request.getFirstName());
        if (StringUtils.hasText(request.getLastName())) user.setLastName(request.getLastName());
        if (StringUtils.hasText(request.getPhone())) user.setPhone(request.getPhone());

        if (StringUtils.hasText(request.getNewPassword())) {
            if (!StringUtils.hasText(request.getCurrentPassword())) {
                throw new BadRequestException("Current password is required to set a new password");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public Address addAddress(String email, AddressRequest request) {
        User user = getCurrentUser(email);
        if (request.isDefault()) {
            addressRepository.clearDefaultForUser(user.getId());
        }
        Address address = Address.builder()
                .user(user)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(StringUtils.hasText(request.getCountry()) ? request.getCountry() : "US")
                .isDefault(request.isDefault())
                .build();
        return addressRepository.save(address);
    }

    public List<Address> getAddresses(String email) {
        User user = getCurrentUser(email);
        return addressRepository.findByUserId(user.getId());
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = getCurrentUser(email);
        Address address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        addressRepository.delete(address);
    }

    public Page<UserResponse> getAllUsers(String search, Pageable pageable) {
        if (StringUtils.hasText(search)) {
            return userRepository.searchUsers(search, pageable).map(UserResponse::from);
        }
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    @Transactional
    public UserResponse toggleUserEnabled(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setEnabled(!user.isEnabled());
        return UserResponse.from(userRepository.save(user));
    }
}
