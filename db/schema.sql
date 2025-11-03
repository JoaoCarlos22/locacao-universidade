CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  role ENUM('colaborador','admin','diretor') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE locais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL, -- ex: "Lab 101", "Sala 203", "Auditório Central"
  tipo ENUM('laboratorio','sala_de_aula','auditorio') NOT NULL,
  bloco VARCHAR(255), -- bloco/prédio
  numero VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL, -- ex: 'Datashow', 'Caixa de som', 'Quadro branco'
  quantidade INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE locais_recursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  local_id INT NOT NULL,
  recurso_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(local_id, recurso_id),
  CONSTRAINT fk_locais_recursos_local FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE CASCADE,
  CONSTRAINT fk_locais_recursos_recurso FOREIGN KEY (recurso_id) REFERENCES recursos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitante_id INT NULL, -- permite ON DELETE SET NULL
  local_id INT NULL,      -- permite ON DELETE SET NULL
  motivo TEXT, -- motivo do agendamento
  inicio_per DATETIME NOT NULL,
  fim_per DATETIME NOT NULL,
  status ENUM('aprovado','pendente','rejeitado') NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservas_solicitante FOREIGN KEY (solicitante_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reservas_local FOREIGN KEY (local_id) REFERENCES locais(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recursos_reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reserva_id INT NOT NULL,
  locais_recursos_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_recursos_reservas_reserva FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE CASCADE,
  CONSTRAINT fk_recursos_reservas_locais_recursos FOREIGN KEY (locais_recursos_id) REFERENCES locais_recursos(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_reservas_inicio_per ON reservas(inicio_per);
CREATE INDEX idx_reservas_fim_per ON reservas(fim_per);
CREATE INDEX idx_reservas_status ON reservas(status);
CREATE INDEX idx_reservas_local ON reservas(local_id);
CREATE INDEX idx_reservas_start_status ON reservas(status, inicio_per);