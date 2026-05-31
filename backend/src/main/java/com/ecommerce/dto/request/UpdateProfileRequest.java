package com.ecommerce.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 20)
    private String phone;

    private String currentPassword;

    @Size(min = 8, max = 100)
    private String newPassword;
}
