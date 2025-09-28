// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');

const app = express();

// Middleware de seguridad básico
app.use(helmet({
  contentSecurityPolicy: false // simple para este demo
}));

// Parseo de JSON
app.use(express.json());

// Sesiones en memoria (suficiente para la práctica).
app.use(session({
  secret: 'hobby-site-secret-123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// "Base de datos" temporal en memoria del servidor
const allComments = []; // comentario = { id, author, text, createdAt }

// Utilidad simple
function isNonEmptyString(s){ return typeof s === 'string' && s.trim().length > 0; }

// API
app.get('/api/comments', (req, res) => {
  if (!req.session.myComments) req.session.myComments = [];
  res.json({ all: allComments, mine: req.session.myComments });
});

app.post('/api/comments', (req, res) => {
  const { author, text } = req.body || {};
  if (!isNonEmptyString(author) || !isNonEmptyString(text)) {
    return res.status(400).json({ ok:false, message: 'author y text son requeridos.' });
  }
  const comment = {
    id: Date.now().toString(36),
    author: author.trim().slice(0, 50),
    text: text.trim().slice(0, 500),
    createdAt: new Date().toISOString()
  };
  allComments.push(comment);
  if (!req.session.myComments) req.session.myComments = [];
  req.session.myComments.push(comment);
  res.status(201).json({ ok:true, comment });
});

// Fallback a index.html para rutas desconocidas (SPA chiquita)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor listo en http://localhost:${PORT}`));
