package com.stelloot.backend.service;

import com.stelloot.backend.dto.CheapSharkDealDTO;
import com.stelloot.backend.model.Deal;
import com.stelloot.backend.model.Game;
import com.stelloot.backend.repository.DealRepository;
import com.stelloot.backend.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final DealRepository dealRepository;

    public List<Game> listGames() {
        return gameRepository.findAll();
    }

    public Game createGame(Game game) {
        return gameRepository.save(game);
    }
    public List<Game> searchGames(String title) {
    return gameRepository.findByTitleContainingIgnoreCase(title);
}
public void importDeals(List<CheapSharkDealDTO> deals) {

    for (CheapSharkDealDTO dealDTO : deals) {

        Optional<Game> existingGame =
                gameRepository.findByTitle(dealDTO.getTitle());

        Game game;

        if (existingGame.isPresent()) {

            game = existingGame.get();

        } else {

            game = Game.builder()
                    .title(dealDTO.getTitle())
                    .imageUrl(dealDTO.getThumb())
                    .build();

            gameRepository.save(game);
        }

            if (dealRepository.existsByGameIdAndStore(game.getId(), "CheapShark")) {
        continue;
    }

    Deal deal = Deal.builder()
            .price(Double.parseDouble(dealDTO.getSalePrice()))
            .discount((int) Double.parseDouble(dealDTO.getSavings()))
            .store("CheapShark")
            .game(game)
            .build();

    dealRepository.save(deal);
    }
}
}

