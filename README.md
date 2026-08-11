# NXPlay - Prova Técnica

Aplicação contendo uma **API REST**, um **servidor WebSocket** e o **front-end em HTML + CSS + JavaScript**.

Fluxo: carrossel de filmes (Recomendados e Todos) → página de sinopse → player HLS → eventos do player enviados ao WebSocket.

---

## Stack

| Camada | Tecnologia |
|---|---|
| API REST | Node.js + Express 5 + CORS |
| WebSocket | Node.js + `ws` 8 |
| Front-end | HTML + CSS + JavaScript |
| Player HLS | [hls.js](https://github.com/video-dev/hls.js) via CDN |

Dependência de desenvolvimento: `concurrently`, apenas para subir os três processos com um comando.

---

## Estrutura do projeto

```
.
├── api/                    Código da API REST
│   ├── server.js           Rotas e inicialização (porta 3000)
│   ├── src/
│   │   └── dataStore.js    Leitura e normalização dos dados
│   └── data/
│       └── movies.json     Dados mockados (JSON local)
│
├── ws/                     Código do WebSocket
│   └── server.js           Recebe e loga os eventos (porta 3001)
│
├── front-end/              Front-end
│   ├── index.html          Página inicial - carrossel
│   ├── sinopse.html        Página de sinopse
│   ├── player.html         Player HLS
│   ├── css/styles.css
│   ├── js/
│   │   ├── config.js       URLs da API e do WebSocket
│   │   ├── api.js          Consumo da API REST
│   │   ├── carousel.js     Monta as faixas da home
│   │   ├── sinopse.js      Monta a página de sinopse
│   │   ├── player.js       Player + captura dos eventos
│   │   └── ws.js           Cliente WebSocket
│   └── assets/
│
└── scripts/
    └── serve-web.js        Servidor estático do front-end (porta 5500)
```

---

## Pré-requisitos

- **Node.js 18 ou superior** (testado na v22)
- npm

---

## Passo a passo para rodar o projeto

### 1. Instalar as dependências

```bash
npm install
```

### 2. Subir os três serviços

```bash
npm start
```

Esse comando sobe API, WebSocket e front-end de uma vez, com os logs identificados por prefixo:

```
[API]        [dataStore] 2 categorias, 82 filmes unicos carregados
[API]        API rodando em http://localhost:3000
[WS]         WebSocket rodando em ws://localhost:3001
[FRONT-END]  Front-end em http://localhost:5500
```

Para rodar os serviços separadamente, em terminais diferentes:

```bash
npm run start:api    # API REST      -> porta 3000
npm run start:ws     # WebSocket     -> porta 3001
npm run start:web    # Front-end     -> porta 5500
```

### 3. Abrir o front-end no navegador

```
http://localhost:5500
```

> O front-end é servido por um servidor estático simples (`scripts/serve-web.js`).

### 4. Percorrer o fluxo

1. **Carrossel**: a home lista os filmes vindos de `GET /movies`, agrupados por categoria.
2. **Sinopse**: clicar num card abre `sinopse.html?id=<id>` com capa, título, sinopse e o botão **Assistir**.
3. **Player**: o botão abre `player.html?id=<id>`, que reproduz o HLS do filme.
4. **Eventos**: conforme você usa o player, os eventos aparecem no terminal do WebSocket:

```
[conexao] cliente conectado (::1)
[evento] play      | movieId=1325 | t=0s
[evento] playing   | movieId=1325 | t=0s
[evento] seek      | movieId=1325 | t=30s
[evento] pause     | movieId=1325 | t=32.37s
```

---

## API REST

Base: `http://localhost:3000`

### `GET /movies`

Retorna os filmes agrupados por categoria, ela alimenta as faixas do carrossel. Cada filme traz os campos obrigatórios `id`, `title`, `description`, `banner`, `cover` e `hls`.

```json
[
  {
    "cat_id": 2215,
    "cat_label": "Recomendados",
    "order": 1,
    "content": [
      {
        "id": 1325,
        "title": "John Wick - De Volta ao Jogo",
        "description": "John Wick é um lendário assassino de aluguel aposentado...",
        "banner": "https://nxplay-images.comets.com.br/.../banner.jpg",
        "cover": "https://nxplay-images.comets.com.br/.../cover.jpg/320x180",
        "hls": "https://vz-5fbb03ca-1d4.b-cdn.net/.../playlist.m3u8",
        "year": 2014,
        "duration": 101,
        "classification": "16",
        "imdb": "7.5"
      }
    ]
  }
]
```

### `GET /movies/:id`

Retorna os dados completos de um filme.


### Dados

Os dados são **mockados** a partir de `api/data/movies.json` - 2 categorias e 82 filmes únicos. A leitura acontece uma única vez, na inicialização.

O `dataStore` normaliza os registros brutos (mapeando `trailer` → `hls`, `video_duration` → `duration`, `imdb_score` → `imdb`) e monta um índice por `id` na estrutura de um `Map`, que também deduplica filmes presentes em mais de uma categoria.

---

## WebSocket

Endereço: `ws://localhost:3001`

O servidor recebe e loga as mensagens de acordo com o pdf "prova_tecnica"

### Formato da mensagem

```json
{
  "event": "<nome-do-evento>",
  "movieId": <id>,
  "timestamp": <tempo-atual-do-player>
}
```

### Eventos

| Evento | Disparado quando |
|---|---|
| `play` | a reprodução é iniciada |
| `playing` | o vídeo começa a exibir quadros |
| `pause` | a reprodução é pausada |
| `seek` | o usuário salta para outro ponto |
| `error` | ocorre um erro no player ou no HLS |
| `finished` | o vídeo chega ao fim |

Mensagens com evento fora dessa lista ou com JSON inválido são ignoradas e registradas como aviso, sem derrubar o servidor.

---

## Front-end

Feito com **HTML, CSS e JavaScript**. A única biblioteca externa é o `hls.js`, carregado por CDN no `player.html`, usado para reproduzir os streams `.m3u8` em navegadores sem suporte nativo a HLS. Onde há suporte nativo (Safari), o player usa o próprio `<video>`.

As URLs dos serviços ficam centralizadas em `front-end/js/config.js`:

```js
const CONFIG = {
  API_BASE: 'http://localhost:3000',
  WS_URL:   'ws://localhost:3001',
};
```

O layout é responsivo: o carrossel rola por swipe no toque e por setas no desktop, e o player limita a altura do vídeo à viewport para os controles continuarem acessíveis no celular em modo paisagem.

---

## Portas utilizadas

| Serviço | Porta |
|---|---|
| API REST | 3000 |
| WebSocket | 3001 |
| Front-end | 5500 |
