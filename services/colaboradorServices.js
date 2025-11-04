const pool = require('../db/connection');

exports.home = async (req, res) => {
    try {
        // id do colaborador logado (campo salvo na sessão)
        const colaboradorId = req.session.usuario.id;

        // buscar reservas do usuário
        const reservasSql = `
            SELECT r.id, r.motivo, r.inicio_per, r.fim_per, r.status, l.nome AS local_nome
            FROM reservas r
            LEFT JOIN locais l ON l.id = r.local_id
            WHERE r.solicitante_id = ?
            ORDER BY r.inicio_per DESC
        `;
        const [reservas] = await pool.query(reservasSql, [colaboradorId]);

        // buscar lista de locais para popular o select
        const [locais] = await pool.query('SELECT id, nome, bloco FROM locais ORDER BY nome');

        // buscar recursos e mapeamento locais_recursos (quantidades disponíveis)
        const [recursos] = await pool.query('SELECT id, nome FROM recursos ORDER BY nome');
        const [locaisRecursos] = await pool.query('SELECT id, local_id, recurso_id, quantidade FROM locais_recursos');

        if (req.session.mensagem) {
            const mensagem = req.session.mensagem;
            req.session.mensagem = null;
            return res.render('colaborador/home', {
                title: 'Home',
                reservas,
                locais,
                recursos,
                locaisRecursos,
                mensagem
            });
        } else {
            return res.render('colaborador/home', {
                title: 'Home',
                reservas,
                locais,
                recursos,
                locaisRecursos
            });
        }
    } catch (error) {
        console.error('Erro ao renderizar a tela Home do colaborador!', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Carregar Página',
            message: 'Erro ao carregar a página de reservas. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        })
    }
}

exports.reservar = async (req, res) => {
    // Lógica para criar uma nova reserva (implemente validações e inserções)
    try {
        const colaboradorId = req.session.usuario.id;
        const { local_id, motivo, inicio_per, fim_per } = req.body;
        const equipamentos = req.body.equipamentos || []; // array de objetos { recurso_id, quantidade }

        if (!local_id || !motivo || !inicio_per || !fim_per) {
            req.session.mensagem = 'Informe o local, motivo, início e fim da reserva.';
            return res.redirect('/colaborador/home');
        }

        const parseDate = (dateStr) => {
            if (typeof dateStr !== 'string') return null;
            return dateStr.replace('T', ' ');
        };
        
        inicioPer_parse = parseDate(inicio_per);
        fimPer_parse = parseDate(fim_per);

        if (new Date(inicioPer_parse) >= new Date(fimPer_parse)) {
            req.session.mensagem = 'O período de início deve ser anterior ao período de fim.';
            return res.redirect('/colaborador/home');
        }

        const [rowsLocal] = await pool.query('SELECT id FROM locais WHERE id = ?', [local_id]);
        if (rowsLocal.length === 0) {
            req.session.mensagem = 'Local selecionado não existe.';
            return res.redirect('/colaborador/home');
        }

        // verifica conflitos de reserva para o local no período solicitado
        const [conflitos] = await pool.query(
            `SELECT COUNT(*) AS c FROM reservas WHERE local_id = ? AND inicio_per < ? AND fim_per > ? AND status IN ('pendente','aprovado')`,
            [local_id, fim_per, inicio_per]
        );

        if (conflitos[0].c > 0) {
            req.session.mensagem = 'O local já está reservado no período selecionado.';
            return res.redirect('/colaborador/home');
        }

        // verifica a disponibilidade dos equipamentos
        const equipamentosMap = (equipamentos && !Array.isArray(equipamentos)) ? equipamentos : {};
        const equipamentosList = Object.entries(equipamentosMap)
            .map(([lrId, qty]) => ({ lrId: Number(lrId), qty: Number(qty) }))
            .filter(e => e.qty > 0);

        for (const eq of equipamentosList) {
            // verifica existência do locais_recursos e pertence ao local
            const [lrRows] = await pool.query(
                'SELECT id, local_id, recurso_id, quantidade FROM locais_recursos WHERE id = ?',
                [eq.lrId]
            );
            if (lrRows.length === 0) {
                req.session.mensagem = `Equipamento inválido (id ${eq.lrId}).`;
                return res.redirect('/colaborador/home');
            }
            const lr = lrRows[0];
            if (String(lr.local_id) !== String(local_id)) {
                req.session.mensagem = `Equipamento (id ${eq.lrId}) não pertence ao local selecionado.`;
                return res.redirect('/colaborador/home');
            }

            // soma já reservada para este locais_recursos_id em reservas conflitantes
            const [sumRows] = await pool.query(
                `SELECT COALESCE(SUM(rr.quantidade),0) AS total_reservado
                 FROM recursos_reservas rr
                 JOIN reservas r ON rr.reserva_id = r.id
                 WHERE rr.locais_recursos_id = ?
                   AND r.inicio_per < ?
                   AND r.fim_per > ?
                   AND r.status IN ('pendente','aprovado')`,
                [eq.lrId, fim_per, inicio_per]
            );
            const reservedQty = sumRows[0].total_reservado || 0;
            const available = lr.quantidade - reservedQty;
            if (eq.qty > available) {
                req.session.mensagem = `Quantidade solicitada para "${lr.recurso_id}" excede a disponibilidade (disponível: ${available}).`;
                return res.redirect('/colaborador/home');
            }
        }

        // se tudo estiver ok, prosseguir com a criação da reserva
        const [result] = await pool.query(
            `INSERT INTO reservas (local_id, solicitante_id, motivo, inicio_per, fim_per, status)
             VALUES (?, ?, ?, ?, ?, 'pendente')`,
            [local_id, colaboradorId,  motivo, inicio_per, fim_per]
        );

        const reservaId = result.insertId;

        // inserir equipamentos na reserva
        for (const equipamento of equipamentosList) {
            const { lrId, qty } = equipamento;
            await pool.query(
                `INSERT INTO recursos_reservas (reserva_id, locais_recursos_id, quantidade)
                 VALUES (?, ?, ?)`,
                [reservaId, lrId, qty]
            );
        }

        req.session.mensagem = 'Reserva criada com sucesso.';
        res.redirect('/colaborador/home');
    } catch (error) {
        console.error('Erro ao criar reserva:', error);
        res.status(500).render('paginaErro', {
            title: 'Erro ao Criar Reserva',
            message: 'Erro ao criar a reserva. Por favor, tente novamente mais tarde.',
            erro: error,
            status: 500
        });
    }
}