const { WebSocketServer } = require('ws');

const PORT = 3001;

// A allow-list dos 6 eventos 
const ALLOWED_EVENTS = ['play', 'playing', 'pause', 'seek', 'error', 'finished'];

// Cria o servidor WebSocket escutando porta 3001
const wss = new WebSocketServer({ port: PORT });
console.log(`WebSocket rodando em ws://localhost:${PORT}`);

// Evento 'connection': dispara uma vez no cliente
wss.on('connection', (socket, req) => {
  console.log(`[conexao] cliente conectado (${req.socket.remoteAddress})`);

  socket.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());     
    } catch (err) {
      console.warn('[aviso] mensagem ignorada: JSON invalido ->', data.toString());

      return;
    }

    const { event, movieId, timestamp } = msg;

    // Valida contra a allow-list
    if (!ALLOWED_EVENTS.includes(event)) {
      console.warn(`[aviso] evento desconhecido ignorado: "${event}"`);

      return;
    }

    // Loga os eventos
    console.log(`[evento] ${String(event).padEnd(9)} | movieId=${movieId} | t=${timestamp}s`);
  });

  // Ciclo de vida da conexão
  socket.on('close', () => console.log('[conexao] cliente desconectado'));
  socket.on('error', (err) => console.error('[erro] socket:', err.message));
});