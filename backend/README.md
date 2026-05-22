# StelLoot Backend

API da plataforma StelLoot, criada com Spring Boot.

## Responsabilidades

- Centralizar chamadas para APIs externas, como CheapShark.
- Expor endpoints REST para o front-end web e o app mobile.
- Persistir usuarios, jogos, favoritos e ofertas.
- Autenticar usuarios com login, cadastro, BCrypt e JWT.

## Stack

- Java 21
- Spring Boot
- Spring Data JPA
- H2 em memoria para desenvolvimento local
- PostgreSQL para ambiente persistente

## Como rodar

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

Endpoint principal usado pelo front:

```text
GET http://localhost:8080/api/deals
```

Autenticacao:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Para usar PostgreSQL e uma chave JWT local:

```powershell
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/stelloot'
$env:SPRING_DATASOURCE_DRIVER='org.postgresql.Driver'
$env:SPRING_DATASOURCE_USERNAME='postgres'
$env:SPRING_DATASOURCE_PASSWORD='sua_senha'
$env:SPRING_JPA_DATABASE_PLATFORM='org.hibernate.dialect.PostgreSQLDialect'
$env:STELLOOT_JWT_SECRET='troque-por-uma-chave-grande-para-apresentacao'
```

## Testes

```powershell
cd backend
.\mvnw.cmd test
```
