IF DB_ID(N'DiyetDB') IS NULL
BEGIN
    CREATE DATABASE DiyetDB;
END
GO

USE DiyetDB;
GO

SET ANSI_NULLS ON;
GO

SET QUOTED_IDENTIFIER ON;
GO

/*
  OpenHealth veritabani semasi
  Bu dosya mevcut backend ve frontend akislarina gore duzenlenmistir.
  Sadece SQL Server tarafini hizalar; uygulama koduna dokunmaz.
*/

DROP TABLE IF EXISTS PlanOgun;
DROP TABLE IF EXISTS BeslenmePlani;
DROP TABLE IF EXISTS UserMeasurements;
DROP TABLE IF EXISTS DietitianRequests;
DROP TABLE IF EXISTS DailyTracking;
DROP TABLE IF EXISTS WeightTracking;
DROP TABLE IF EXISTS MealFoods;
DROP TABLE IF EXISTS Meals;
DROP TABLE IF EXISTS Foods;
DROP TABLE IF EXISTS Clients;
DROP TABLE IF EXISTS Dietitians;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS AccountStatuses;
GO

CREATE TABLE AccountStatuses (
    AccountStatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusCode NVARCHAR(20) NOT NULL UNIQUE,
    DisplayName NVARCHAR(50) NOT NULL
);
GO

INSERT INTO AccountStatuses (StatusCode, DisplayName)
VALUES
    (N'approved', N'Onaylandi'),
    (N'pending', N'Onay Bekliyor'),
    (N'rejected', N'Reddedildi');
GO

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    NormalizedEmail AS LOWER(LTRIM(RTRIM(Email))) PERSISTED,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL
        CHECK (Role IN (N'Danisan', N'Diyetisyen')),
    AccountStatusID INT NOT NULL,
    ResetToken NVARCHAR(128) NULL,
    ResetTokenExpiresAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT UQ_Users_NormalizedEmail UNIQUE (NormalizedEmail),
    CONSTRAINT FK_Users_AccountStatuses
        FOREIGN KEY (AccountStatusID) REFERENCES AccountStatuses(AccountStatusID)
);
GO

CREATE TABLE Dietitians (
    DietitianID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Dietitians_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Dietitians_Users
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

CREATE TABLE Clients (
    ClientID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    DietitianID INT NULL,
    Yas INT NULL,
    Boy DECIMAL(5,2) NULL,
    Kilo DECIMAL(5,2) NULL,
    Hedef DECIMAL(5,2) NULL,
    SonGorusme DATE NULL,
    Durum NVARCHAR(20) NOT NULL CONSTRAINT DF_Clients_Durum DEFAULT N'Pasif'
        CHECK (Durum IN (N'Aktif', N'Pasif', N'Tamamlandi')),
    Alerji NVARCHAR(MAX) NULL,
    Hastalik NVARCHAR(MAX) NULL,
    KanGrubu NVARCHAR(20) NULL,
    DogumTarihi DATE NULL,
    Cinsiyet NVARCHAR(30) NULL,
    AktiviteSeviyesi NVARCHAR(50) NULL,
    KronikRahatsizlik NVARCHAR(MAX) NULL,
    KullanilanIlaclar NVARCHAR(MAX) NULL,
    AmeliyatGecmisi NVARCHAR(MAX) NULL,
    SigaraAlkol NVARCHAR(MAX) NULL,
    SaglikNotu NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Clients_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_Clients_Users
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Clients_Dietitians
        FOREIGN KEY (DietitianID) REFERENCES Dietitians(DietitianID)
);
GO

CREATE TABLE DietitianRequests (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,
    DanisanUserID INT NOT NULL,
    DietitianID INT NOT NULL,
    Talep NVARCHAR(255) NOT NULL,
    Tarih DATE NOT NULL CONSTRAINT DF_DietitianRequests_Tarih DEFAULT CAST(GETDATE() AS DATE),
    Durum NVARCHAR(20) NOT NULL CONSTRAINT DF_DietitianRequests_Durum DEFAULT N'pending'
        CHECK (Durum IN (N'pending', N'approved', N'rejected')),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_DietitianRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_DietitianRequests_Users
        FOREIGN KEY (DanisanUserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_DietitianRequests_Dietitians
        FOREIGN KEY (DietitianID) REFERENCES Dietitians(DietitianID)
);
GO

CREATE TABLE UserMeasurements (
    MeasurementID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    Tarih DATE NOT NULL,
    Kilo DECIMAL(5,2) NULL,
    Boy DECIMAL(5,2) NULL,
    BelCevresi DECIMAL(5,2) NULL,
    KalcaCevresi DECIMAL(5,2) NULL,
    YagOrani DECIMAL(5,2) NULL,
    NotText NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_UserMeasurements_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_UserMeasurements_Users
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

CREATE TABLE BeslenmePlani (
    PlanID INT IDENTITY(1,1) PRIMARY KEY,
    DietitianUserID INT NOT NULL,
    ClientUserID INT NOT NULL,
    PlanAdi NVARCHAR(100) NOT NULL,
    BaslangicTarihi DATE NOT NULL,
    BitisTarihi DATE NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_BeslenmePlani_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_BeslenmePlani_DietitianUsers
        FOREIGN KEY (DietitianUserID) REFERENCES Users(UserID),
    CONSTRAINT FK_BeslenmePlani_ClientUsers
        FOREIGN KEY (ClientUserID) REFERENCES Users(UserID)
);
GO

CREATE TABLE PlanOgun (
    PlanOgunID INT IDENTITY(1,1) PRIMARY KEY,
    PlanID INT NOT NULL,
    Gun DATE NOT NULL,
    Ogunler NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_PlanOgun_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_PlanOgun_BeslenmePlani
        FOREIGN KEY (PlanID) REFERENCES BeslenmePlani(PlanID) ON DELETE CASCADE
);
GO

/*
  Asagidaki tablolar mevcut repoda aktif API ile kullanilmiyor,
  ancak onceki veritabani tasarimiyla uyumluluk icin tutuluyor.
*/

CREATE TABLE Foods (
    FoodID INT IDENTITY(1,1) PRIMARY KEY,
    FoodName NVARCHAR(100) NOT NULL,
    Calories INT NULL,
    Protein DECIMAL(6,2) NULL,
    Fat DECIMAL(6,2) NULL,
    Carbohydrate DECIMAL(6,2) NULL
);
GO

CREATE TABLE Meals (
    MealID INT IDENTITY(1,1) PRIMARY KEY,
    ClientID INT NOT NULL,
    MealType NVARCHAR(50) NOT NULL,
    MealTime TIME NULL,
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Meals_Clients
        FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
GO

CREATE TABLE MealFoods (
    MealID INT NOT NULL,
    FoodID INT NOT NULL,
    Quantity NVARCHAR(50) NULL,
    CONSTRAINT PK_MealFoods PRIMARY KEY (MealID, FoodID),
    CONSTRAINT FK_MealFoods_Meals
        FOREIGN KEY (MealID) REFERENCES Meals(MealID) ON DELETE CASCADE,
    CONSTRAINT FK_MealFoods_Foods
        FOREIGN KEY (FoodID) REFERENCES Foods(FoodID)
);
GO

CREATE TABLE WeightTracking (
    WeightID INT IDENTITY(1,1) PRIMARY KEY,
    ClientID INT NOT NULL,
    Weight DECIMAL(5,2) NOT NULL,
    RecordDate DATE NOT NULL CONSTRAINT DF_WeightTracking_RecordDate DEFAULT CAST(GETDATE() AS DATE),
    CONSTRAINT FK_WeightTracking_Clients
        FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
GO

CREATE TABLE DailyTracking (
    TrackingID INT IDENTITY(1,1) PRIMARY KEY,
    ClientID INT NOT NULL,
    Notes NVARCHAR(MAX) NULL,
    RecordDate DATE NOT NULL CONSTRAINT DF_DailyTracking_RecordDate DEFAULT CAST(GETDATE() AS DATE),
    CONSTRAINT FK_DailyTracking_Clients
        FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Users_Role ON Users(Role);
CREATE INDEX IX_Users_AccountStatusID ON Users(AccountStatusID);
CREATE INDEX IX_Clients_DietitianID ON Clients(DietitianID);
CREATE INDEX IX_DietitianRequests_DietitianID_Durum ON DietitianRequests(DietitianID, Durum);
CREATE INDEX IX_UserMeasurements_UserID_Tarih ON UserMeasurements(UserID, Tarih DESC);
CREATE INDEX IX_BeslenmePlani_DietitianUserID ON BeslenmePlani(DietitianUserID);
CREATE INDEX IX_BeslenmePlani_ClientUserID ON BeslenmePlani(ClientUserID);
CREATE INDEX IX_PlanOgun_PlanID_Gun ON PlanOgun(PlanID, Gun);
GO
