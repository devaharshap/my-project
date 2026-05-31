package com.ecommerce.dto.request;

import com.ecommerce.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {
    @NotNull
    private Long addressId;

    @NotNull
    private PaymentMethod paymentMethod;

    private String notes;
}
