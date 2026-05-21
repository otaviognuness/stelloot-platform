package com.stelloot.backend.repository;

import com.stelloot.backend.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Long> {

    List<Deal> findByGameId(Long gameId);

    boolean existsByGameIdAndStore(Long gameId, String store);
}