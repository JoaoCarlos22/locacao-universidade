exports.isColaborador = (req, res, next) => {
    try {
        if (req.session.usuario && req.session.usuario.role === 'colaborador') {
            return next();
        }
        req.session.mensagem = 'Acesso negado. Você não tem permissão para acessar esta página.';
        return res.redirect('/login');
    } catch (error) {
        console.error('Erro no middleware de autorização de colaborador:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}
exports.isAdmin = (req, res, next) => {
    try {
        if (req.session.usuario && req.session.usuario.role === 'admin') {
            return next();
        }
        req.session.mensagem = 'Acesso negado. Você não tem permissão para acessar esta página.';
        return res.redirect('/login');
    } catch (error) {
        console.error('Erro no middleware de autorização de admin:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.isDiretor = (req, res, next) => {
    try {
        if (req.session.usuario && req.session.usuario.role === 'diretor') {
            return next();
        }
        req.session.mensagem = 'Acesso negado. Você não tem permissão para acessar esta página.';
        return res.redirect('/login');
    } catch (error) {
        console.error('Erro no middleware de autorização de diretor:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}

exports.adminOuDiretorRole = (req, res, next) => {
    try {
        if (req.session.usuario && (req.session.usuario.role === 'admin' || req.session.usuario.role === 'diretor')) {
            return next();
        }
        req.session.mensagem = 'Acesso negado. Você não tem permissão para acessar esta página.';
        return res.redirect('/login');
    } catch (error) {
        console.error('Erro no middleware de autorização de admin ou diretor:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro Interno do Servidor',
            message: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}
