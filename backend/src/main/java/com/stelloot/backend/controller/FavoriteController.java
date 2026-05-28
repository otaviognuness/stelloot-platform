package com.stelloot.backend.controller;

import com.stelloot.backend.dto.TargetPriceRequestDTO;
import com.stelloot.backend.dto.WishlistItemRequestDTO;
import com.stelloot.backend.dto.WishlistItemResponseDTO;
import com.stelloot.backend.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public List<WishlistItemResponseDTO> listWishlist(Authentication authentication) {
        return favoriteService.listWishlist(authentication.getName());
    }

    @PostMapping
    public WishlistItemResponseDTO saveWishlistItem(
            Authentication authentication,
            @Valid @RequestBody WishlistItemRequestDTO request
    ) {
        return favoriteService.saveWishlistItem(authentication.getName(), request);
    }

    @PatchMapping("/{favoriteId}/target-price")
    public WishlistItemResponseDTO updateTargetPrice(
            Authentication authentication,
            @PathVariable Long favoriteId,
            @Valid @RequestBody TargetPriceRequestDTO request
    ) {
        return favoriteService.updateTargetPrice(authentication.getName(), favoriteId, request);
    }

    @DeleteMapping("/{favoriteId}")
    public ResponseEntity<Void> deleteWishlistItem(
            Authentication authentication,
            @PathVariable Long favoriteId
    ) {
        favoriteService.deleteWishlistItem(authentication.getName(), favoriteId);
        return ResponseEntity.noContent().build();
    }
}
