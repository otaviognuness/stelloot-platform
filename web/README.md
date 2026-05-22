# StelLoot Web

Front-end web da plataforma StelLoot, criado com React + Vite.

## Responsabilidades

- Exibir ofertas de jogos de PC.
- Consumir a API Spring Boot em `backend/`.
- Permitir navegacao entre explorar, ofertas, wishlist, dashboard e detalhes.
- Manter filtros por loja e busca de jogos.
- Fazer login e cadastro pela API com JWT.

## Estrutura principal

```text
web/src/
|-- assets/
|-- components/
|-- config/
|-- hooks/
|-- pages/
|-- services/
|-- utils/
|-- App.jsx
`-- main.jsx
```

## Como rodar

```powershell
cd web
npm install
npm run dev
```

Por padrao, o front usa:

```text
http://localhost:8080/api
```

Para alterar a URL da API, crie `web/.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

## Validacao

```powershell
npm run lint
npm run build
```
