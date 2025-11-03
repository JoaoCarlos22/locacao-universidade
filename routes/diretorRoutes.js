const express = require('express');
const router = express.Router();

router.use(auth, diretorRole);

router.get('/dashboard', telaDashboard);

// rotas para cadastrar locais
router.post('/local', cadastrarLocal);
router.post('/local/:id', atualizarLocal);
router.post('/local/:id', deletarLocal);

// rotas para aprovar ou reprovar uma reserva
router.post('/aprovar-reserva/:id', aprovarReserva);
router.post('/reprovar-reserva/:id', reprovarReserva);

router.get('/perfil', telaPerfil); // retorna dados do perfil do colaborador
router.post('/perfil/:id', atualizarPerfil);

module.exports = router;