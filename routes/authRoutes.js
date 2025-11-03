const express = require('express');
const router = express.Router();

router.get('/login', telaLogin);
router.post('/login', login);
router.get('/register', telaRegistro);
router.post('/register', register);
router.get('/logout', logout);

module.exports = router;