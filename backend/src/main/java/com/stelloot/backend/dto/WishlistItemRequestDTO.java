package com.stelloot.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class WishlistItemRequestDTO {

    @NotBlank(message = "O jogo e obrigatorio")
    private String externalGameId;

    private String dealId;
    private String storeId;
    private String steamAppId;

    @NotBlank(message = "O titulo e obrigatorio")
    private String title;

    private String displayTitle;
    private String thumb;

    @PositiveOrZero(message = "O preco atual deve ser valido")
    private Double salePrice;

    @PositiveOrZero(message = "O preco original deve ser valido")
    private Double normalPrice;

    @PositiveOrZero(message = "O desconto deve ser valido")
    private Double savings;

    @Positive(message = "O preco alvo deve ser maior que zero")
    private Double targetPrice;

    private Boolean catalogOnly;
}
