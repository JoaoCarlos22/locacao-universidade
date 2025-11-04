const express = require('express');
const router = express.Router();

const { isColaborador } = require('../middlewares/roleMiddleware');
const { auth } = require('../middlewares/authMiddleware');
const { home, reservar, telaPerfil, atualizarPerfil } = require('../services/colaboradorServices');

router.use(auth, isColaborador);

router.get('/home', home); // retorna todas as reservas do usuário e formulário de reserva
router.post('/reservar', reservar);

router.get('/perfil', telaPerfil);
router.post('/perfil/:id', atualizarPerfil); 

module.exports = router;