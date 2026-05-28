package com.stelloot.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class WishlistItemResponseDTO {

    private Long id;
    private String externalGameId;
    private String dealId;
    private String storeId;
    private String steamAppId;
    private String title;
    private String displayTitle;
    private String thumb;
    private Double salePrice;
    private Double normalPrice;
    private Double savings;
    private Double targetPrice;
    private Boolean catalogOnly;
    private Instant savedAt;
}
