const express = require('express');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { auth } = require('../middlewares/authMiddleware');
const { telaDashboard, reprovarReserva, enviarReserva } = require('../services/adminServices');
const router = express.Router();

router.use(auth, isAdmin);

router.get('/dashboard', telaDashboard);

 // rotas para enviar uma reserva para diretoria ou reprovar
router.post('/enviar-reserva/:id', enviarReserva);
router.post('/reprovar-reserva/:id', reprovarReserva);
/*
router.get('/perfil', telaPerfil); // retorna dados do perfil do colaborador
router.post('/perfil', atualizarPerfil); */

module.exports = router;