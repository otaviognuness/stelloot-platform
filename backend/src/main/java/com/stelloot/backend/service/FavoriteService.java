package com.stelloot.backend.service;

import com.stelloot.backend.dto.TargetPriceRequestDTO;
import com.stelloot.backend.dto.WishlistItemRequestDTO;
import com.stelloot.backend.dto.WishlistItemResponseDTO;
import com.stelloot.backend.model.Favorite;
import com.stelloot.backend.model.User;
import com.stelloot.backend.repository.FavoriteRepository;
import com.stelloot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WishlistItemResponseDTO> listWishlist(String email) {
        return favoriteRepository.findByUserEmailIgnoreCaseOrderBySavedAtDesc(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public WishlistItemResponseDTO saveWishlistItem(String email, WishlistItemRequestDTO request) {
        User user = findUser(email);
        Favorite favorite = favoriteRepository
                .findByUserEmailIgnoreCaseAndExternalGameIdIgnoreCase(email, request.getExternalGameId())
                .orElseGet(() -> Favorite.builder()
                        .user(user)
                        .externalGameId(request.getExternalGameId())
                        .savedAt(Instant.now())
                        .build());

        favorite.setDealId(request.getDealId());
        favorite.setStoreId(request.getStoreId());
        favorite.setSteamAppId(request.getSteamAppId());
        favorite.setTitle(request.getTitle());
        favorite.setDisplayTitle(request.getDisplayTitle());
        favorite.setImageUrl(request.getThumb());
        favorite.setSalePrice(request.getSalePrice());
        favorite.setNormalPrice(request.getNormalPrice());
        favorite.setSavings(request.getSavings());
        favorite.setCatalogOnly(Boolean.TRUE.equals(request.getCatalogOnly()));

        if (request.getTargetPrice() != null) {
            favorite.setTargetPrice(request.getTargetPrice());
        }

        return toResponse(favoriteRepository.save(favorite));
    }

    @Transactional
    public WishlistItemResponseDTO updateTargetPrice(
            String email,
            Long favoriteId,
            TargetPriceRequestDTO request
    ) {
        Favorite favorite = findFavorite(email, favoriteId);
        favorite.setTargetPrice(request.getTargetPrice());
        return toResponse(favoriteRepository.save(favorite));
    }

    @Transactional
    public void deleteWishlistItem(String email, Long favoriteId) {
        favoriteRepository.delete(findFavorite(email, favoriteId));
    }

    private User findUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado"));
    }

    private Favorite findFavorite(String email, Long favoriteId) {
        return favoriteRepository.findByIdAndUserEmailIgnoreCase(favoriteId, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item nao encontrado na wishlist"));
    }

    private WishlistItemResponseDTO toResponse(Favorite favorite) {
        String fallbackTitle = favorite.getGame() == null ? null : favorite.getGame().getTitle();
        String fallbackImage = favorite.getGame() == null ? null : favorite.getGame().getImageUrl();

        return WishlistItemResponseDTO.builder()
                .id(favorite.getId())
                .externalGameId(favorite.getExternalGameId() == null
                        ? "legacy-" + favorite.getId()
                        : favorite.getExternalGameId())
                .dealId(favorite.getDealId())
                .storeId(favorite.getStoreId())
                .steamAppId(favorite.getSteamAppId())
                .title(favorite.getTitle() == null ? fallbackTitle : favorite.getTitle())
                .displayTitle(favorite.getDisplayTitle())
                .thumb(favorite.getImageUrl() == null ? fallbackImage : favorite.getImageUrl())
                .salePrice(favorite.getSalePrice())
                .normalPrice(favorite.getNormalPrice())
                .savings(favorite.getSavings())
                .targetPrice(favorite.getTargetPrice())
                .catalogOnly(Boolean.TRUE.equals(favorite.getCatalogOnly()))
                .savedAt(favorite.getSavedAt())
                .build();
    }
}
