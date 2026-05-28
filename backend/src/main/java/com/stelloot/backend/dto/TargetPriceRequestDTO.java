package com.stelloot.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TargetPriceRequestDTO {

    @NotNull(message = "Informe o preco alvo")
    @Positive(message = "O preco alvo deve ser maior que zero")
    private Double targetPrice;
}
