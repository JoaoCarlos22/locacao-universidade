const pool = require('../db/connection');

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
            
            return res.render('diretor/dashboard', {
                title: 'Painel Administrativo',
                reservas: rows,
                filters,
                mensagem,
                theme: 'diretor'
            });
        }
        return res.render('diretor/dashboard', {
            title: 'Painel Administrativo',
            reservas: rows,
            filters,
            theme: 'diretor'
        });
    } catch (error) {
        console.error('Erro ao renderizar o dashboard do diretor!', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Carregar Dashboard',
            mensagem: 'Erro ao carregar o dashboard. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}

exports.aprovarReserva = async (req, res) => {
    try {
        const reservaId = req.params.id;
        // atualizar status da reserva para 'enviado a diretoria'
        await pool.query('UPDATE reservas SET status = ? WHERE id = ?', ['aprovado', reservaId]);
        req.session.mensagem = 'Reserva aprovada com sucesso!';
        res.redirect('/diretor/dashboard');
    } catch (error) {
        console.error('Erro ao aprovar a reserva!', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Aprovar Reserva',
            mensagem: 'Erro ao aprovar a reserva. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        })
    }
}

exports.reprovarReserva = async (req, res) => {
    try {
        const reservaId = req.params.id;

        // atualizar status da reserva para 'reprovado'
        await pool.query('UPDATE reservas SET status = ? WHERE id = ?', ['rejeitado', reservaId]);
        req.session.mensagem = 'Reserva reprovada com sucesso!';
        res.redirect('/diretor/dashboard');
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

exports.telaCadastroLocal = async (req, res) => {
    try {
        // buscar locais e recursos para popular a tela
        const [locais] = await pool.query('SELECT * FROM locais ORDER BY nome ASC');
        const [recursos] = await pool.query('SELECT id, nome FROM recursos ORDER BY nome ASC');

        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            return res.render('diretor/locais', {
                title: 'Locais',
                locais,
                recursos,
                theme: 'diretor',
                mensagem
            });
        }
        return res.render('diretor/locais', {
            title: 'Locais',
            locais,
            recursos,
            theme: 'diretor'
        });
    } catch (error) {
        console.error('Erro ao carregar tela de cadastro de local:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Carregar Cadastro de Local',
            mensagem: 'Erro ao carregar a tela de cadastro de local. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}

exports.cadastrarLocal = async (req, res) => {
    try {
        const { nome, tipo, bloco, numero, observacoes } = req.body;
        const equipamentos = req.body.equipamentos || [];

        if (!nome || !tipo || !bloco || !numero) {
            req.session.mensagem = 'Por favor, preencha todos os campos obrigatórios.';
            return res.redirect('/diretor/local');
        }

        // cadastra o local
        await pool.query('INSERT INTO locais (nome, tipo, bloco, numero, observacoes) VALUES (?, ?, ?, ?, ?)', [nome, tipo, bloco, numero, observacoes]);

        // cadastra os equipamentos associados
        const [local] = await pool.query('SELECT id FROM locais WHERE nome = ? AND bloco = ? AND numero = ? ORDER BY id DESC LIMIT 1', [nome, bloco, numero]);
        const localId = local[0].id;

        for (const equipamento of equipamentos) {
            await pool.query('INSERT INTO locais_recursos (local_id, recurso_id, quantidade) VALUES (?, ?, ?)', [localId, equipamento.id, equipamento.quantidade]);
        }

        req.session.mensagem = 'Local cadastrado com sucesso!';
        res.redirect('/diretor/local');
    } catch (error) {
        console.error('Erro ao cadastrar local:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Cadastrar Local',
            mensagem: 'Erro ao cadastrar o local. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}

exports.atualizarLocal = async (req, res) => {
    try {
        const localId = req.params.id;
        const { nome, tipo, bloco, numero, observacoes } = req.body;

        if (!nome || !tipo || !bloco || !numero) {
            req.session.mensagem = 'Por favor, preencha todos os campos obrigatórios.';
            return res.redirect(`/diretor/local/${localId}/editar`);
        }

        // atualiza o local
        await pool.query('UPDATE locais SET nome = ?, tipo = ?, bloco = ?, numero = ?, observacoes = ? WHERE id = ?', [nome, tipo, bloco, numero, observacoes, localId]);
        req.session.mensagem = 'Local atualizado com sucesso!';
        res.redirect('/diretor/local');
    } catch (error) {
        console.error('Erro ao atualizar local:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Atualizar Local',
            mensagem: 'Erro ao atualizar o local. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}

exports.deletarLocal = async (req, res) => {
    try {
        const localId = req.params.id;
        await pool.query('DELETE FROM locais WHERE id = ?', [localId]);
        req.session.mensagem = 'Local deletado com sucesso!';
        res.redirect('/diretor/local');
    } catch (error) {
        console.error('Erro ao deletar local:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Deletar Local',
            mensagem: 'Erro ao deletar o local. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500,
            theme: 'erro'
        });
    }
}
