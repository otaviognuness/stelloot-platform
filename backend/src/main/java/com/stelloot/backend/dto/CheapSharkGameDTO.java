package com.stelloot.backend.dto;

import lombok.Data;

@Data
public class CheapSharkGameDTO {

    private String gameID;
    private String steamAppID;
    private String cheapest;
    private String cheapestDealID;
    private String external;
    private String thumb;
}
