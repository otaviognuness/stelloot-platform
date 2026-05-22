# StelLoot

Plataforma web e mobile para pesquisar promocoes de jogos, comparar precos, salvar wishlist e criar alertas.

## Estrutura do projeto

```text
stelloot-platform/
|-- backend/
|   `-- Spring Boot
|-- web/
|   `-- React + Vite
|-- mobile/
|   `-- React Native/Expo
|-- docs/
|   `-- Documentacao, diagramas, prints e apresentacao
`-- README.md
```

## Responsabilidades

- `backend`: API REST, banco de dados e integracoes externas.
- `web`: interface web em React.
- `mobile`: aplicativo mobile em React Native/Expo.
- `docs`: materiais de apoio, arquitetura e apresentacao.

## Como rodar localmente

Suba o backend e o front em dois terminais separados.

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

Endpoints de autenticacao JWT:

```text
POST http://localhost:8080/api/auth/register
POST http://localhost:8080/api/auth/login
GET  http://localhost:8080/api/auth/me
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

O front usa `http://localhost:8080/api` por padrao. Para alterar, crie um `.env` dentro de `web/`:

```env
VITE_API_URL=http://localhost:8080/api
```

## Banco de dados

Por padrao, o backend usa H2 em memoria para facilitar testes locais.

Para usar PostgreSQL, configure:

```powershell
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/stelloot'
$env:SPRING_DATASOURCE_DRIVER='org.postgresql.Driver'
$env:SPRING_DATASOURCE_USERNAME='postgres'
$env:SPRING_DATASOURCE_PASSWORD='sua_senha'
$env:SPRING_JPA_DATABASE_PLATFORM='org.hibernate.dialect.PostgreSQLDialect'
```

Para o JWT, use uma chave local por variavel de ambiente:

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
