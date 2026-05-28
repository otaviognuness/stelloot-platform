# Modelo de dados

Modelo para evoluir o banco da StelLoot. A primeira versão persiste usuários e itens de wishlist no PostgreSQL/H2 por meio do backend Spring Boot.

## Entidades principais

```text
users
- id
- name
- email
- password_hash
- provider
- created_at
- updated_at

games
- id
- title
- slug
- normalized_title
- cover_url
- release_date
- steam_app_id
- rawg_id
- created_at
- updated_at

stores
- id
- name
- slug
- cheapshark_store_id
- logo_url
- active

deals
- id
- game_id
- store_id
- external_deal_id
- sale_price
- normal_price
- currency
- discount_percent
- redirect_url
- last_seen_at
- is_active

wishlist_items
- id
- user_id
- external_game_id
- deal_id
- store_id
- steam_app_id
- title
- image_url
- sale_price
- normal_price
- savings
- target_price
- catalog_only
- saved_at

price_alerts
- id
- user_id
- game_id
- store_id
- target_price
- currency
- active
- created_at

price_history
- id
- game_id
- store_id
- price
- currency
- discount_percent
- captured_at
```

## Regra central

Um jogo não deve ser duplicado por loja. A loja e a oferta devem ficar separadas na evolução do catálogo. Na wishlist atual, um snapshot da melhor oferta é salvo para permitir sincronização imediata entre web e mobile.

```text
Cyberpunk 2077 = game
Steam = store
Cyberpunk 2077 em promoção na Steam = deal
```
