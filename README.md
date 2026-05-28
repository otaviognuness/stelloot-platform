# StelLoot

Plataforma web e mobile para pesquisar promoções de jogos, comparar preços, salvar wishlist e criar alertas.

## Estrutura do projeto

```text
stelloot-platform/
|-- backend/
|   `-- Spring Boot
|-- web/
|   `-- React + Vite
|-- mobile/
|   `-- React Native + Expo Router
|-- docs/
|   `-- Documentação, diagramas, prints e apresentação
`-- README.md
```

## Responsabilidades

- `backend`: API REST, banco de dados e integrações externas.
- `web`: interface web em React.
- `mobile`: aplicativo mobile em React Native/Expo.
- `docs`: materiais de apoio, arquitetura e apresentação.

## Como rodar localmente

Suba o backend e o front em dois terminais separados.

### Apresentação com um clique

Para apresentar o site em computadores e celulares conectados à mesma rede Wi-Fi, dê dois cliques em:

```text
iniciar-apresentacao.bat
```

O arquivo detecta o IP local do notebook, inicia o backend e o site web em duas janelas e abre o navegador com o link que pode ser compartilhado na sala. Nesse modo, o backend usa o banco H2 em memória para reduzir configuração: logins e itens salvos valem durante a execução atual.

Se o Firewall do Windows solicitar acesso para Java ou Node, permita em rede privada. Para encerrar a apresentação, feche as janelas `StelLoot Backend - NAO FECHE` e `StelLoot Site - NAO FECHE`.

### Backend

Requisito:

- JDK 21

Windows:

```powershell
cd backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21.0.11'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd spring-boot:run
```

API local:

```text
http://localhost:8080/api
```

Endpoint de ofertas:

```text
GET http://localhost:8080/api/deals
```

Endpoints de autenticação JWT:

```text
POST http://localhost:8080/api/auth/register
POST http://localhost:8080/api/auth/login
GET  http://localhost:8080/api/auth/me
```

Endpoints de wishlist autenticada:

```text
GET    http://localhost:8080/api/wishlist
POST   http://localhost:8080/api/wishlist
PATCH  http://localhost:8080/api/wishlist/{id}/target-price
DELETE http://localhost:8080/api/wishlist/{id}
```

### Web

```powershell
cd web
npm install
npm run dev
```

Front local:

```text
http://localhost:5173
```

O front usa `http://localhost:8080/api` por padrão. Para alterar, crie um `.env` dentro de `web/`:

```env
VITE_API_URL=http://localhost:8080/api
```

### Mobile

Para rodar em um celular com Expo Go, configure em `mobile/.env` o IP local do notebook:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:8080/api
```

Depois execute:

```powershell
cd mobile
npm install
npx expo start --lan
```

O celular e o notebook precisam estar conectados à mesma rede.

## Banco de dados

Por padrão, o backend usa H2 em memória para facilitar testes locais.

Para usar PostgreSQL, configure:

```powershell
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/stelloot'
$env:SPRING_DATASOURCE_DRIVER='org.postgresql.Driver'
$env:SPRING_DATASOURCE_USERNAME='postgres'
$env:SPRING_DATASOURCE_PASSWORD='sua_senha'
$env:SPRING_JPA_DATABASE_PLATFORM='org.hibernate.dialect.PostgreSQLDialect'
```

Para o JWT, use uma chave local por variável de ambiente:

```powershell
$env:STELLOOT_JWT_SECRET='troque-por-uma-chave-grande-para-apresentacao'
```

## Validacao

Backend:

```powershell
cd backend
.\mvnw.cmd test
```

Web:

```powershell
cd web
npm run lint
npm run build
```

Mobile:

```powershell
cd mobile
npm run lint
npx tsc --noEmit
```
