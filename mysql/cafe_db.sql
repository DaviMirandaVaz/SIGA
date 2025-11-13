CREATE DATABASE cafe_db;

USE cafe_db;

CREATE TABLE usuarios(
id INTEGER PRIMARY KEY NOT NULL AUTO_INCREMENT,
nome VARCHAR(100) NOT NULL,
senha VARCHAR(255) NOT NULL,
perfil VARCHAR(50) NOT NULL
);

INSERT INTO usuarios (nome, senha, perfil) VALUES ('admin', '1234', 'ADMINISTRADOR');

USE cafe_db;

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_produto VARCHAR(255) NOT NULL,
	categoria VARCHAR(100) NOT NULL,
    unidade_medida VARCHAR(50) NOT NULL,
    quantidade INT NOT NULL,
    data_entrada DATE NOT NULL,
    data_validade DATE NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);