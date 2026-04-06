USE DiyetDB;
GO

-- Eski tablolar varsa sil
DROP TABLE IF EXISTS MealFoods;
DROP TABLE IF EXISTS Meals;
DROP TABLE IF EXISTS Foods;
DROP TABLE IF EXISTS WeightTracking;
DROP TABLE IF EXISTS DailyTracking;
DROP TABLE IF EXISTS Clients;
DROP TABLE IF EXISTS Dietitians;
DROP TABLE IF EXISTS Users;
GO

-- 1. Kullanıcılar
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL
        CHECK (Role IN (N'Danışan', N'Diyetisyen')),
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- 2. Diyetisyenler
CREATE TABLE Dietitians (
    DietitianID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
GO

-- 3. Danışanlar
CREATE TABLE Clients (
    ClientID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL UNIQUE,
    DietitianID INT NULL,
    Height DECIMAL(5,2) NULL,
    StartWeight DECIMAL(5,2) NULL,
    TargetWeight DECIMAL(5,2) NULL,
    Diseases NVARCHAR(MAX) NULL,
    Allergies NVARCHAR(MAX) NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (DietitianID) REFERENCES Dietitians(DietitianID)
);
GO

-- 4. Kilo Takibi
CREATE TABLE WeightTracking (
    WeightID INT PRIMARY KEY IDENTITY(1,1),
    ClientID INT NOT NULL,
    Weight DECIMAL(5,2) NOT NULL,
    RecordDate DATE DEFAULT GETDATE(),
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
GO

-- 5. Günlük Takip
CREATE TABLE DailyTracking (
    TrackingID INT PRIMARY KEY IDENTITY(1,1),
    ClientID INT NOT NULL,
    Notes NVARCHAR(MAX) NULL,
    RecordDate DATE DEFAULT GETDATE(),
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
GO

-- 6. Öğünler
CREATE TABLE Meals (
    MealID INT PRIMARY KEY IDENTITY(1,1),
    ClientID INT NOT NULL,
    MealType NVARCHAR(50) NOT NULL,   -- Kahvaltı, Öğle, Akşam, Ara Öğün
    MealTime TIME NULL,
    Notes NVARCHAR(MAX) NULL,
    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE
);
GO

-- 7. Besinler
CREATE TABLE Foods (
    FoodID INT PRIMARY KEY IDENTITY(1,1),
    FoodName NVARCHAR(100) NOT NULL,
    Calories INT NULL,
    Protein DECIMAL(5,2) NULL,
    Fat DECIMAL(5,2) NULL,
    Carbohydrate DECIMAL(5,2) NULL
);
GO

-- 8. Öğün-Besin ilişkisi
CREATE TABLE MealFoods (
    MealID INT NOT NULL,
    FoodID INT NOT NULL,
    Quantity NVARCHAR(50) NULL,
    PRIMARY KEY (MealID, FoodID),
    FOREIGN KEY (MealID) REFERENCES Meals(MealID) ON DELETE CASCADE,
    FOREIGN KEY (FoodID) REFERENCES Foods(FoodID)
);
GO

-- 9. Beslenme Planı
CREATE TABLE BeslenmePlani (
    PlanID INT PRIMARY KEY IDENTITY(1,1),
    ClientID INT NOT NULL,
    DietitianID INT NOT NULL,

    PlanAdi NVARCHAR(100) NULL,
    BaslangicTarihi DATE NOT NULL,
    BitisTarihi DATE NULL,

    OlusturmaTarihi DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (ClientID) REFERENCES Clients(ClientID) ON DELETE CASCADE,
    FOREIGN KEY (DietitianID) REFERENCES Dietitians(DietitianID)
);
GO

-- 10. Plan Öğün Tablosu
CREATE TABLE PlanOgun (
    PlanOgunID INT PRIMARY KEY IDENTITY(1,1),
    PlanID INT NOT NULL,
    Gun DATE NOT NULL,
    Ogunler NVARCHAR(MAX) NOT NULL,
    FOREIGN KEY (PlanID) REFERENCES BeslenmePlani(PlanID) ON DELETE CASCADE
);
GO
