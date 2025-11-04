const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const diretorRoutes = require('./routes/diretorRoutes');
require('dotenv').config();

const PORT = process.env.PORT;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.use(express.static('public'));
app.use('/', authRoutes);
app.use('/colaborador', colaboradorRoutes);
app.use('/admin', adminRoutes);
app.use('/diretor', diretorRoutes); 

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}/login`);
});