const express = require('express');
const { auth } = require('../middlewares/authMiddleware');
const { isDiretor } = require('../middlewares/roleMiddleware');
const { telaDashboard, aprovarReserva, reprovarReserva, telaCadastroLocal, cadastrarLocal, atualizarLocal, deletarLocal, telaPerfil, atualizarPerfil } = require('../services/diretorServices');
const router = express.Router();

router.use(auth, isDiretor);

router.get('/dashboard', telaDashboard);

// rotas para aprovar ou reprovar uma reserva
router.post('/aprovar-reserva/:id', aprovarReserva);
router.post('/reprovar-reserva/:id', reprovarReserva);

// rotas para cadastrar locais
router.get('/local', telaCadastroLocal);
router.post('/local', cadastrarLocal);
router.post('/local/:id', atualizarLocal);
router.post('/local/:id', deletarLocal);
 
router.get('/perfil', telaPerfil);
router.post('/perfil/:id', atualizarPerfil); 

module.exports = router;