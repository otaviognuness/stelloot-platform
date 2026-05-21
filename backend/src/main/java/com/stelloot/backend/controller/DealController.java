package com.stelloot.backend.controller;

import com.stelloot.backend.dto.CheapSharkDealDTO;
import com.stelloot.backend.model.Deal;
import com.stelloot.backend.service.DealService;
import com.stelloot.backend.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;
    private final GameService gameService;

    @GetMapping("/deals")
    public List<CheapSharkDealDTO> getDeals(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String storeID,
            @RequestParam(required = false) Integer pageSize,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "false") boolean forceRefresh
    ) {
        return dealService.getDeals(title, storeID, pageSize, sortBy, forceRefresh);
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
