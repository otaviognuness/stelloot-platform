# Arquitetura

O StelLoot usa um monorepo simples, com uma pasta para cada aplicacao principal.

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
React/Vite web
    -> Spring Boot API
        -> CheapShark API
```

## Responsabilidades por pasta

- `backend`: API REST, banco de dados, regras da aplicacao e integracoes externas.
- `web`: aplicacao web consumindo a API do backend.
- `mobile`: aplicacao mobile Expo, prevista para consumir a mesma API.
- `docs`: documentacao tecnica, modelo de dados, prints e materiais da apresentacao.

## Decisao de arquitetura

O front-end nao deve depender diretamente da CheapShark no longo prazo. O backend deve centralizar as chamadas externas para facilitar cache, tratamento de erro, troca de provedor, autenticacao e regras de negocio.
