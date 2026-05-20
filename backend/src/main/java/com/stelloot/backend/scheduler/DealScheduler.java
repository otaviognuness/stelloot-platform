package com.stelloot.backend.scheduler;

import com.stelloot.backend.dto.CheapSharkDealDTO;
import com.stelloot.backend.service.DealService;
import com.stelloot.backend.service.GameService;

import lombok.RequiredArgsConstructor;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DealScheduler {

    private final DealService dealService;
    private final GameService gameService;

    @Scheduled(fixedRate = 21600000)
    public void updateDeals() {

        System.out.println("Updating deals...");

        List<CheapSharkDealDTO> deals =
                dealService.getDeals();

        gameService.importDeals(deals);

        System.out.println("Deals updated!");
    }
}