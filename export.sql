--
-- File generated with SQLiteStudio v3.2.1 on Wed May 13 19:51:54 2020
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: Camion
CREATE TABLE Camion (idCamion INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Chofer VARCHAR, ChapaChasis VARCHAR, ChapaAcoplado VARCHAR, idTransportista INTEGER REFERENCES Transportista (idTransportista) NOT NULL);

-- Table: Comprador
CREATE TABLE Comprador (idComprador INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, RENSPA VARCHAR NOT NULL, idEstablecimiento INTEGER REFERENCES Establecimiento (idEstablecimiento) NOT NULL, CUITPersona INTEGER REFERENCES Persona (CUIT) NOT NULL, idLocalidad INTEGER REFERENCES Localidad (idLocalidad));

-- Table: Establecimiento
CREATE TABLE Establecimiento (idEstablecimiento INTEGER PRIMARY KEY AUTOINCREMENT, Nombre VARCHAR NOT NULL, Partida VARCHAR, Repagro VARCHAR);

-- Table: Localidad
CREATE TABLE Localidad (idLocalidad INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Nombre VARCHAR NOT NULL, idProvincia INTEGER REFERENCES Provincia (idProvincia) NOT NULL);

-- Table: Persona
CREATE TABLE Persona (CUIT INTEGER PRIMARY KEY AUTOINCREMENT, RazonSocial VARCHAR NOT NULL, Telefono VARCHAR, Email VARCHAR);

-- Table: Productor
CREATE TABLE Productor (idProductor INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, RENSPA VARCHAR NOT NULL, BoletoMarca VARCHAR, BoletoSenial VARCHAR, IngresosBrutos VARCHAR, idEstablecimiento INTEGER REFERENCES Establecimiento (idEstablecimiento) NOT NULL, CUITPersona INTEGER REFERENCES Persona (CUIT) NOT NULL);

-- Table: Provincia
CREATE TABLE Provincia (idProvincia INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, Nombre VARCHAR NOT NULL);

-- Table: Transportista
CREATE TABLE Transportista (idTransportista INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, IngresosBrutos VARCHAR, CUITPersona INTEGER REFERENCES Persona (CUIT) NOT NULL);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
