package com.stelloot.backend.controller;

import com.stelloot.backend.model.Game;
import com.stelloot.backend.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping
    public List<Game> listGames() {
        return gameService.listGames();
    }

    @PostMapping
    public Game createGame(@RequestBody Game game) {
        return gameService.createGame(game);
    }
    @GetMapping("/search")
    public List<Game> searchGames(@RequestParam String title) {
        return gameService.searchGames(title);
    }
}