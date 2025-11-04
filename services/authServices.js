const pool = require('../db/connection');
const bcrypt = require('bcrypt');

exports.telaLogin = async (req, res) => {
    try {
        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            res.render('login', {
                title: 'Login',
                mensagem
            });
        } else {
            res.render('login', {
                title: 'Login'
            });
        }
    } catch (error) {
        console.error('Erro ao renderizar a tela de login:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Renderizar Login',
            message: 'Ocorreu um erro ao tentar carregar a página de login. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        })
    }
}

exports.telaRegistro = async (req, res) => {
    try {
        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            res.render('register', { 
                title: 'Registro',
                mensagem
            });
        } else {
            res.render('register', {
                title: 'Registro'
            });
        }
    } catch (error) {
        console.error('Erro ao renderizar a tela de registro:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Renderizar Registro',
            message: 'Ocorreu um erro ao tentar carregar a página de registro. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.login = async (req, res) => {
    try {
        // Validação dos campos obrigatórios
        const { email, password } = req.body;
        if (!email && !password) {
            req.session.mensagem = 'Por favor, preencha todos os campos obrigatórios.';
            return res.redirect('/login');
        }

        // Verificação das credenciais do usuário
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            req.session.mensagem = 'Credenciais inválidas. Por favor, tente novamente.';
            return res.redirect('/login');
        }

        // Verificação da senha
        const senhaCorreta = await bcrypt.compare(password, rows[0].password_hash);
        if (!senhaCorreta) {
            req.session.mensagem = 'Credenciais inválidas. Por favor, tente novamente.';
            return res.redirect('/login');
        }
        // Configuração da sessão do usuário
        req.session.usuario = {
            id: rows[0].id,
            nome: rows[0].nome,
            email: rows[0].email,
            role: rows[0].role
        };

        // Redirecionamento baseado na função do usuário
        if (rows[0].role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else if (rows[0].role === 'diretor') {
            return res.redirect('/diretor/dashboard');
        } else {
            return res.redirect('/colaborador/home');
        }
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Realizar Login',
            message: 'Ocorreu um erro ao tentar realizar o login. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.register = async (req, res) => {
    try {
        // Validação dos campos obrigatórios
        const { name, email, password, confirmPassword, role } = req.body;
        if (!name || !email || !password || !role) {
            req.session.mensagem = 'Por favor, preencha todos os campos obrigatórios.';
            return res.redirect('/register');
        }
        // Verificação se o email já está registrado
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            req.session.mensagem = 'Este email já está registrado. Por favor, utilize outro email.';
            return res.redirect('/register');
        }

        // Verificação se as senhas coincidem
        if (password !== confirmPassword) {
            req.session.mensagem = 'As senhas não coincidem. Por favor, tente novamente.';
            return res.redirect('/register');
        }

        // Hash da senha
        const hashPassword = await bcrypt.hash(password, 10);
        // Inserção do novo usuário no banco de dados
        await pool.query('INSERT INTO users (nome, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, hashPassword, role]);

        req.session.mensagem = 'Registro realizado com sucesso! Agora você pode fazer login.';
        return res.redirect('/login');
    } catch (error) {
        console.error('Erro ao realizar registro:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Realizar Registro',
            message: 'Ocorreu um erro ao tentar realizar o registro. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Erro ao destruir a sessão:', err);
                return res.status(500).render('paginaErro', {
                    title: 'Erro ao Realizar Logout',
                    message: 'Ocorreu um erro ao tentar realizar o logout. Por favor, tente novamente mais tarde.',
                    erro: error,
                    status: 500
                });
            }
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Erro ao realizar logout:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Realizar Logout',
            message: 'Ocorreu um erro ao tentar realizar o logout. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}