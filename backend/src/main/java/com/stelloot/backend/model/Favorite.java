package com.stelloot.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "favorites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

    private String externalGameId;

    private String dealId;

    private String storeId;

    private String steamAppId;

    private String title;

    private String displayTitle;

    @Column(length = 600)
    private String imageUrl;

    private Double salePrice;

    private Double normalPrice;

    private Double savings;

    private Double targetPrice;

    private Boolean catalogOnly;

    private Instant savedAt;
}
