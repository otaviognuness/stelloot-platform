package com.stelloot.backend.service;

import com.stelloot.backend.dto.CheapSharkDealDTO;
import com.stelloot.backend.model.Deal;
import com.stelloot.backend.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;

    private final RestClient restClient = RestClient.create();

    public List<CheapSharkDealDTO> getDeals() {

        return restClient.get()
                .uri("https://www.cheapshark.com/api/1.0/deals?pageSize=50")
                .retrieve()
                .body(new ParameterizedTypeReference<List<CheapSharkDealDTO>>() {});
    }

    public List<Deal> getDealsByGame(Long gameId) {
        return dealRepository.findByGameId(gameId);
    }
}