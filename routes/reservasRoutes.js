const express = require('express');
const router = express.Router();

// middleware de autenticação que aceita ou admin ou diretor
router.use(auth, adminOuDiretorRole);

router.get('/reserva/:id', detalhesReserva); //retorna json

// rotas de filtro (dia, mes, ano)
router.get('/reservas/dia?', reservasPorDia);
router.get('/reservas/mes?', reservasPorMes);
router.get('/reservas/ano?', reservasPorAno);

// rota de filtro por local
router.get('/reservas/local?', reservasPorLocal);

// rota de filtro por status
router.get('/reservas/status?', reservasPorStatus);

module.exports = router;