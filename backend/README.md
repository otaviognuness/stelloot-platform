# StelLoot Backend

API da plataforma StelLoot, criada com Spring Boot.

## Responsabilidades

- Centralizar chamadas para APIs externas, como CheapShark.
- Expor endpoints REST para o front-end web e o app mobile.
- Persistir usuarios, jogos, favoritos, ofertas e alertas de preco.
- Preparar a base para autenticacao e integracoes futuras.

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

## Testes

```powershell
cd backend
.\mvnw.cmd test
```
