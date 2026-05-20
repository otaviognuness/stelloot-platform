package com.stelloot.backend.controller;

import com.stelloot.backend.dto.CheapSharkDealDTO;
import com.stelloot.backend.model.Deal;
import com.stelloot.backend.service.DealService;
import com.stelloot.backend.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;
    private final GameService gameService;

    @GetMapping("/deals")
    public List<CheapSharkDealDTO> getDeals() {
        return dealService.getDeals();
    }

    @PostMapping("/games/import")
    public String importGames() {

        List<CheapSharkDealDTO> deals = dealService.getDeals();

        gameService.importDeals(deals);

        return "Games imported successfully";
    }

    @GetMapping("/games/{gameId}/deals")
    public List<Deal> getDealsByGame(@PathVariable Long gameId) {
        return dealService.getDealsByGame(gameId);
    }
}