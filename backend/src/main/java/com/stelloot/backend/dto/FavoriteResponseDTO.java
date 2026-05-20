package com.stelloot.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FavoriteResponseDTO {

    private Long favoriteId;

    private Long gameId;
    private String title;
    private String imageUrl;
}