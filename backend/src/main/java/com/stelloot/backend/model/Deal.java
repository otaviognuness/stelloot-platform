package com.stelloot.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "deals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double price;

    private Integer discount;

    private String store;

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;
}