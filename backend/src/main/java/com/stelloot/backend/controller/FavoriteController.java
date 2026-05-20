package com.stelloot.backend.controller;

import com.stelloot.backend.dto.FavoriteResponseDTO;
import com.stelloot.backend.model.Favorite;
import com.stelloot.backend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    public Favorite addFavorite(
            @RequestParam Long userId,
            @RequestParam Long gameId
    ) {
        return favoriteService.addFavorite(userId, gameId);
    }

    @GetMapping("/{userId}")
    public List<FavoriteResponseDTO> listFavoritesByUser(@PathVariable Long userId) {
    return favoriteService.listFavoritesByUser(userId);
}
    @DeleteMapping("/{favoriteId}")
    public void deleteFavorite(@PathVariable Long favoriteId) {
        favoriteService.deleteFavorite(favoriteId);
    }
}