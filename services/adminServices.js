const pool = require('../db/connection');
const bcrypt = require('bcrypt');

exports.telaDashboard = async (req, res) => {
    try {
        // objeto filters (status, from, to, q)
        const filters = {
            status: req.query.status || null,
            from: req.query.from || null, // formato 'YYYY-MM-DD'
            to: req.query.to || null,     // formato 'YYYY-MM-DD'
            q: req.query.q ? req.query.q.trim() : null
        };

        // montar query com joins para obter nomes e aplicar filtros
        let sql = `
            SELECT r.*, u.nome AS solicitante_nome, l.nome AS local_nome
            FROM reservas r
            LEFT JOIN users u ON u.id = r.solicitante_id
            LEFT JOIN locais l ON l.id = r.local_id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            sql += ' AND r.status = ?';
            params.push(filters.status);
        }
        if (filters.from) {
            sql += ' AND r.inicio_per >= ?';
            params.push(filters.from + ' 00:00:00');
        }
        if (filters.to) {
            sql += ' AND r.fim_per <= ?';
            params.push(filters.to + ' 23:59:59');
        }
        if (filters.q) {
            if (/^\d+$/.test(filters.q)) {
                sql += ' AND r.id = ?';
                params.push(Number(filters.q));
            } else {
                sql += ' AND (l.nome LIKE ? OR u.nome LIKE ?)';
                params.push('%' + filters.q + '%', '%' + filters.q + '%');
            }
        }

        sql += ' ORDER BY r.inicio_per DESC';

        const [rows] = await pool.query(sql, params);

        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            
            return res.render('admin/dashboard', {
                title: 'Dashboard Administrativo',
                reservas: rows,
                filters,
                mensagem,
                theme: 'admin'
            });
        }
        return res.render('admin/dashboard', {
            title: 'Dashboard Administrativo',
            reservas: rows,
            filters,
            theme: 'admin'
        });
    } catch (error) {
        console.error('Erro ao buscar reservas:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Carregar Dashboard',
            mensagem: 'Erro ao carregar o dashboard. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        })
    }
}

exports.enviarReserva = async (req, res) => {
    try {
        const reservaId = req.params.id;
        // atualizar status da reserva para 'enviado a diretoria'
        await pool.query('UPDATE reservas SET status = ? WHERE id = ?', ['enviado a diretoria', reservaId]);
        req.session.mensagem = 'Reserva enviada à diretoria com sucesso!';
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Erro ao enviar reserva:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Enviar Reserva',
            mensagem: 'Erro ao enviar a reserva. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}

exports.reprovarReserva = async (req, res) => {
    try {
        const reservaId = req.params.id;

        // atualizar status da reserva para 'reprovado'
        await pool.query('UPDATE reservas SET status = ? WHERE id = ?', ['rejeitado', reservaId]);
        req.session.mensagem = 'Reserva reprovada com sucesso!';
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Erro ao reprovar reserva:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Reprovar Reserva',
            mensagem: 'Erro ao reprovar a reserva. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}

exports.telaPerfil = async (req, res) => {
    try {
        const adminId = req.session.usuario.id;
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [adminId]);
        const admin = rows[0];
        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            return res.render('admin/perfil', {
                title: 'Meu Perfil',
                admin,
                theme: 'admin',
                mensagem
            });
        }
        return res.render('admin/perfil', {
            title: 'Meu Perfil',
            admin,
            theme: 'admin'
        });
    } catch (error) {
        console.error("Erro ao renderizar a tela de perfil do Admin!", error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Carregar Perfil',
            message: 'Erro ao carregar o perfil. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}

exports.atualizarPerfil = async (req, res) => {
    try {
        const adminId = req.params.id;
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            req.session.mensagem = 'Por favor, preencha todos os campos obrigatórios.';
            return res.redirect(`/admin/perfil`);
        }

        const hashPassword = await bcrypt.hash(senha, 10);

        // atualiza o perfil
        await pool.query('UPDATE users SET nome = ?, email = ?, password_hash = ? WHERE id = ?', [nome, email, hashPassword, adminId]);
        req.session.mensagem = 'Perfil atualizado com sucesso!';
        res.redirect('/admin/perfil');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Atualizar Perfil',
            message: 'Erro ao atualizar o perfil. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}