# Arquitetura

O StelLoot usa um monorepo simples, com uma pasta para cada aplicação principal.

```text
stelloot-platform/
|-- backend/
|-- web/
|-- mobile/
|-- docs/
`-- README.md
```

## Fluxo atual

```text
React/Vite web ---------|
                       |-> Spring Boot API -> PostgreSQL
React Native/Expo -----|        |
                                `-> CheapShark API
```

## Responsabilidades por pasta

- `backend`: API REST, banco de dados, regras da aplicação, JWT e integrações externas.
- `web`: aplicação web consumindo a API do backend.
- `mobile`: aplicação Expo consumindo a mesma API e mantendo sessão em Secure Store.
- `docs`: documentação técnica, modelo de dados, prints e materiais da apresentação.

## Decisão de arquitetura

O front-end não depende diretamente da CheapShark. O backend centraliza chamadas externas, autenticação e wishlist para que web e mobile enxerguem os mesmos dados.

## Fluxos implementados

- Ofertas e busca: clientes chamam `/api/deals` e `/api/games/search`.
- Autenticação: login/cadastro retornam JWT, enviado em `Authorization: Bearer ...`.
- Wishlist: itens e preços alvo são persistidos em `/api/wishlist` para o usuário autenticado.
