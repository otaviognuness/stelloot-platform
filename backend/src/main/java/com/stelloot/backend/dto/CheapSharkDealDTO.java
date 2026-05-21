package com.stelloot.backend.dto;

import lombok.Data;

@Data
public class CheapSharkDealDTO {

    private String gameID;
    private String dealID;
    private String storeID;
    private String steamAppID;
    private String title;
    private String salePrice;
    private String normalPrice;
    private String savings;
    private String dealRating;
    private String steamRatingText;
    private String thumb;
}
