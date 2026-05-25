package com.stelloot.backend.service;

import com.stelloot.backend.dto.CheapSharkDealDTO;
import com.stelloot.backend.dto.CheapSharkGameDTO;
import com.stelloot.backend.model.Deal;
import com.stelloot.backend.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DealService {

    private static final Duration CACHE_TTL = Duration.ofMinutes(12);
    private static final int DEFAULT_PAGE_SIZE = 60;
    private static final int DEFAULT_MAX_PAGES = 10;

    private final DealRepository dealRepository;
    private final RestClient restClient = RestClient.create();

    private List<CheapSharkDealDTO> cachedDeals = List.of();
    private Instant cacheExpiresAt = Instant.EPOCH;

    public List<CheapSharkDealDTO> getDeals() {
        return getDeals(null, null, DEFAULT_PAGE_SIZE, 0, "DealRating", false, true, DEFAULT_MAX_PAGES, true);
    }

    public List<CheapSharkDealDTO> getDeals(
            String title,
            String storeID,
            Integer pageSize,
            Integer pageNumber,
            String sortBy,
            boolean forceRefresh,
            boolean allPages,
            Integer maxPages,
            Boolean onSale
    ) {
        int safePageNumber = pageNumber == null ? 0 : Math.max(pageNumber, 0);

        if (!forceRefresh && safePageNumber == 0 && isBlank(title) && isBlank(storeID) && Instant.now().isBefore(cacheExpiresAt) && !cachedDeals.isEmpty()) {
            return cachedDeals;
        }

        try {
            int safePageSize = pageSize == null ? DEFAULT_PAGE_SIZE : Math.min(Math.max(pageSize, 1), DEFAULT_PAGE_SIZE);
            List<CheapSharkDealDTO> safeDeals = allPages
                    ? fetchAllDealPages(title, storeID, safePageSize, sortBy, maxPages, onSale)
                    : fetchDealPage(title, storeID, safePageSize, sortBy, safePageNumber, onSale).deals();

            if (safePageNumber == 0 && isBlank(title) && isBlank(storeID)) {
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

    public List<CheapSharkGameDTO> searchGames(String title, Integer limit) {
        if (isBlank(title)) {
            return List.of();
        }

        List<CheapSharkGameDTO> games = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("www.cheapshark.com")
                        .path("/api/1.0/games")
                        .queryParam("title", title)
                        .queryParam("limit", limit == null ? 60 : Math.min(Math.max(limit, 1), 60))
                        .queryParam("exact", 0)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<List<CheapSharkGameDTO>>() {});

        return games == null ? List.of() : games;
    }

    private List<CheapSharkDealDTO> fetchAllDealPages(
            String title,
            String storeID,
            int pageSize,
            String sortBy,
            Integer maxPages,
            Boolean onSale
    ) {
        DealPage firstPage = fetchDealPage(title, storeID, pageSize, sortBy, 0, onSale);
        List<CheapSharkDealDTO> deals = new ArrayList<>(firstPage.deals());

        int lastPage = firstPage.lastPageIndex() == null ? 0 : firstPage.lastPageIndex();
        int pageLimit = maxPages == null ? DEFAULT_MAX_PAGES : maxPages;
        if (pageLimit <= 0) {
            pageLimit = lastPage + 1;
        }
        int pageCount = Math.min(lastPage + 1, pageLimit);

        for (int pageNumber = 1; pageNumber < pageCount; pageNumber++) {
            deals.addAll(fetchDealPage(title, storeID, pageSize, sortBy, pageNumber, onSale).deals());
        }

        return deals;
    }

    private DealPage fetchDealPage(
            String title,
            String storeID,
            int pageSize,
            String sortBy,
            int pageNumber,
            Boolean onSale
    ) {
        ResponseEntity<List<CheapSharkDealDTO>> response = restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .scheme("https")
                            .host("www.cheapshark.com")
                            .path("/api/1.0/deals")
                            .queryParam("pageSize", pageSize)
                            .queryParam("pageNumber", pageNumber)
                            .queryParam("sortBy", isBlank(sortBy) ? "DealRating" : sortBy)
                            .queryParam("desc", 1)
                            .queryParam("upperPrice", 60)
                            .queryParam("onSale", Boolean.FALSE.equals(onSale) ? 0 : 1);

                    if (!isBlank(storeID)) {
                        builder.queryParam("storeID", storeID);
                    }

                    if (!isBlank(title)) {
                        builder.queryParam("title", title);
                    }

                    return builder.build();
                })
                .retrieve()
                .toEntity(new ParameterizedTypeReference<List<CheapSharkDealDTO>>() {});

        List<CheapSharkDealDTO> deals = Objects.requireNonNullElse(response.getBody(), List.of());
        Integer lastPageIndex = Optional.ofNullable(response.getHeaders().getFirst("X-Total-Page-Count"))
                .map(this::parsePageCount)
                .orElse(0);

        return new DealPage(deals, lastPageIndex);
    }

    private Integer parsePageCount(String value) {
        try {
            return Math.max(0, Integer.parseInt(value));
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record DealPage(List<CheapSharkDealDTO> deals, Integer lastPageIndex) {
    }
}
