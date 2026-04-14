START TRANSACTION;

INSERT INTO recursos (nome, quantidade)
SELECT 'Datashow', 12
WHERE NOT EXISTS (SELECT 1 FROM recursos WHERE nome = 'Datashow');

INSERT INTO recursos (nome, quantidade)
SELECT 'Notebook', 20
WHERE NOT EXISTS (SELECT 1 FROM recursos WHERE nome = 'Notebook');

INSERT INTO recursos (nome, quantidade)
SELECT 'Caixa de Som', 8
WHERE NOT EXISTS (SELECT 1 FROM recursos WHERE nome = 'Caixa de Som');

INSERT INTO recursos (nome, quantidade)
SELECT 'Microfone', 16
WHERE NOT EXISTS (SELECT 1 FROM recursos WHERE nome = 'Microfone');

INSERT INTO recursos (nome, quantidade)
SELECT 'Pincel para Quadro', 60
WHERE NOT EXISTS (SELECT 1 FROM recursos WHERE nome = 'Pincel para Quadro');

INSERT INTO recursos (nome, quantidade)
SELECT 'Apagador', 25
WHERE NOT EXISTS (SELECT 1 FROM recursos WHERE nome = 'Apagador');

INSERT INTO recursos (nome, quantidade)
SELECT 'Extensao Eletrica', 30
WHERE NOT EXISTS (SELECT 1 FROM recursos WHERE nome = 'Extensao Eletrica');

COMMIT;
