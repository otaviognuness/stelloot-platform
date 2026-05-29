# StelLoot Mobile

Aplicativo React Native com Expo para consultar promoções de jogos de PC, buscar no catálogo, autenticar usuários e manter wishlist/preço alvo sincronizados com o site.

## Stack

- Expo SDK 54 e Expo Router
- TypeScript
- TanStack Query para requisições, paginação e cache
- Expo Secure Store para armazenar a sessão JWT
- Expo Image para renderização das capas

## Funcionalidades disponíveis

- Tela Explorar com destaques em promoção
- Ofertas paginadas com carregamento progressivo
- Busca de jogos no catálogo, mesmo sem promoção ativa
- Login e cadastro conectados ao backend Spring Boot
- Wishlist compartilhada com o web após login
- Preço alvo persistido por usuário
- Tela de detalhes com abertura da oferta real
- Temas StelLoot, preto e claro

## Configuração da API

Copie `.env.example` para `.env` e substitua o IP pelo endereço do notebook que está rodando o backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.15:8080/api
```

No celular físico, `localhost` aponta para o próprio celular. Notebook e aparelho devem estar na mesma rede Wi-Fi.

## Executar

```powershell
cd mobile
npm install
npx expo start --lan
```

Abra o QR Code no aplicativo Expo Go. Para testar no navegador:

```powershell
npm run web
```

## Validação

```powershell
npm run lint
npx tsc --noEmit
```
