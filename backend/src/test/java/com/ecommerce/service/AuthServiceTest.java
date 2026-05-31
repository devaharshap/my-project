package com.ecommerce.service;

import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.entity.enums.RoleName;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.repository.RoleRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder().id(1L).name(RoleName.CUSTOMER).build();
    }

    @Test
    void register_createsUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com"); request.setPassword("Password@123");
        request.setFirstName("Test"); request.setLastName("User");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.CUSTOMER)).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u = User.builder().id(1L).email(u.getEmail()).password(u.getPassword())
                    .firstName(u.getFirstName()).lastName(u.getLastName())
                    .roles(Set.of(customerRole)).build();
            return u;
        });
        when(jwtTokenProvider.generateToken(any())).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh-token");

        AuthResponse result = authService.register(request);

        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throwsOnDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email already in use");
    }
}
