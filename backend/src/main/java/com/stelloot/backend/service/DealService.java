package com.stelloot.backend.service;

import com.stelloot.backend.dto.CheapSharkDealDTO;
import com.stelloot.backend.model.Deal;
import com.stelloot.backend.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DealService {

    private static final Duration CACHE_TTL = Duration.ofMinutes(12);
    private static final String DEFAULT_STORES = "1,25";

    private final DealRepository dealRepository;
    private final RestClient restClient = RestClient.create();

    private List<CheapSharkDealDTO> cachedDeals = List.of();
    private Instant cacheExpiresAt = Instant.EPOCH;

    public List<CheapSharkDealDTO> getDeals() {
        return getDeals(null, DEFAULT_STORES, 60, "DealRating", false);
    }

    public List<CheapSharkDealDTO> getDeals(
            String title,
            String storeID,
            Integer pageSize,
            String sortBy,
            boolean forceRefresh
    ) {
        if (!forceRefresh && title == null && Instant.now().isBefore(cacheExpiresAt) && !cachedDeals.isEmpty()) {
            return cachedDeals;
        }

        try {
            List<CheapSharkDealDTO> deals = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("www.cheapshark.com")
                            .path("/api/1.0/deals")
                            .queryParam("storeID", storeID == null || storeID.isBlank() ? DEFAULT_STORES : storeID)
                            .queryParam("pageSize", pageSize == null ? 60 : pageSize)
                            .queryParam("sortBy", sortBy == null || sortBy.isBlank() ? "DealRating" : sortBy)
                            .queryParam("desc", 1)
                            .queryParam("upperPrice", 60)
                            .queryParam("onSale", 1)
                            .queryParamIfPresent("title", title == null || title.isBlank()
                                    ? java.util.Optional.empty()
                                    : java.util.Optional.of(title))
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<CheapSharkDealDTO>>() {});

            List<CheapSharkDealDTO> safeDeals = deals == null ? List.of() : deals;

            if (title == null || title.isBlank()) {
                cachedDeals = safeDeals;
                cacheExpiresAt = Instant.now().plus(CACHE_TTL);
            }

            return safeDeals;
        } catch (RestClientException exception) {
            if (!cachedDeals.isEmpty()) {
                return cachedDeals;
            }

            throw exception;
        }
    }

    public List<Deal> getDealsByGame(Long gameId) {
        return dealRepository.findByGameId(gameId);
    }
}
