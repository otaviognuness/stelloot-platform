package com.stelloot.backend.repository;

import com.stelloot.backend.model.Game;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {

    List<Game> findByTitleContainingIgnoreCase(String title);

    boolean existsByTitle(String title);

    Optional<Game> findByTitle(String title);
    
}