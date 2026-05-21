# Modelo de dados

Modelo sugerido para evoluir o banco da StelLoot.

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
- game_id
- created_at

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

Um jogo nao deve ser duplicado por loja. A loja e a oferta devem ficar separadas.

```text
Cyberpunk 2077 = game
Steam = store
Cyberpunk 2077 em promocao na Steam = deal
```
