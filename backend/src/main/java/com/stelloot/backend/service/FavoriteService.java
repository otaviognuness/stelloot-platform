package com.stelloot.backend.service;

import com.stelloot.backend.dto.FavoriteResponseDTO;
import com.stelloot.backend.model.Favorite;
import com.stelloot.backend.model.Game;
import com.stelloot.backend.model.User;
import com.stelloot.backend.repository.FavoriteRepository;
import com.stelloot.backend.repository.GameRepository;
import com.stelloot.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    public Favorite addFavorite(Long userId, Long gameId) {


         if (favoriteRepository.existsByUserIdAndGameId(userId, gameId)) {
                throw new RuntimeException("Game already favorited");
    }

        User user = userRepository.findById(userId)
                .orElseThrow();

        Game game = gameRepository.findById(gameId)
                .orElseThrow();

        Favorite favorite = Favorite.builder()
                .user(user)
                .game(game)
                .build();

        return favoriteRepository.save(favorite);
    }

    public List<FavoriteResponseDTO> listFavoritesByUser(Long userId) {

        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(favorite -> FavoriteResponseDTO.builder()
                .favoriteId(favorite.getId())
                .gameId(favorite.getGame().getId())
                .title(favorite.getGame().getTitle())
                .imageUrl(favorite.getGame().getImageUrl())
                .build())
                .toList();
    }
    public void deleteFavorite(Long favoriteId) {
        favoriteRepository.deleteById(favoriteId);
    }
}