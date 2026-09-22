require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-troque-em-producao',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 horas
}));

app.use((req, res, next) => {
  res.locals.userEmail = req.session.userEmail || null;
  next();
});

app.use(authRoutes);
app.use(requireAuth);

app.use('/clients', clientRoutes);
app.use('/reports', reportRoutes);
app.use('/', dashboardRoutes);

app.use((req, res) => {
  res.status(404).send('Página não encontrada');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(`Erro interno: ${err.message}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Techwave · Relatórios de TI rodando em http://localhost:${PORT}`);
});
