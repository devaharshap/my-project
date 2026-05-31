package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressRequest {
    @NotBlank @Size(max = 255)
    private String street;

    @NotBlank @Size(max = 100)
    private String city;

    @NotBlank @Size(max = 100)
    private String state;

    @NotBlank @Size(max = 20)
    private String zipCode;

    @Size(max = 100)
    private String country = "US";

    private boolean isDefault = false;
}
