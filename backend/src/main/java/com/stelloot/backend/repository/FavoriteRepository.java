package com.stelloot.backend.repository;

import com.stelloot.backend.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserId(Long userId);

    boolean existsByUserIdAndGameId(Long userId, Long gameId);

    List<Favorite> findByUserEmailIgnoreCaseOrderBySavedAtDesc(String email);

    Optional<Favorite> findByIdAndUserEmailIgnoreCase(Long id, String email);

    Optional<Favorite> findByUserEmailIgnoreCaseAndExternalGameIdIgnoreCase(String email, String externalGameId);
}
