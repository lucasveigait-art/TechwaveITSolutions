import express from 'express';
import bcrypt from 'bcryptjs';
import { sql } from '../db/index.js';
import { loginPage } from '../views/authView.js';

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.send(loginPage({ error: null }));
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const rows = await sql`SELECT * FROM users WHERE email = ${(email || '').trim().toLowerCase()}`;
    const user = rows[0];

    if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
      return res.status(401).send(loginPage({ error: 'E-mail ou senha inválidos.' }));
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

export default router;
