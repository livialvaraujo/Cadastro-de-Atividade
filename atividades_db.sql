CREATE DATABASE atividades_db;

USE atividades_db;

CREATE TABLE atividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tipo_especifico VARCHAR(100) NOT NULL,
    horas INT NOT NULL
);

