const express = require('express');
const router = express.Router();

router.use(auth, colaboradorRole);

router.get('/reservar', telaReservar); // retorna todas as reservas do usuário e formulário de reserva
router.post('/reservar', reservar);

router.get('/perfil', telaPerfil); // retorna dados do perfil do colaborador
router.post('/perfil', atualizarPerfil);

module.exports = router;