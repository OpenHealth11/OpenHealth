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
  DiyetDB kurulum ve migrasyon scripti
  - Mevcut tablolari kosulsuz silmez.
  - Eski semayi yeni alan adlarina tasimaya calisir.
  - Veritabani tarafinda veri butunlugunu guclendirir.
*/

IF OBJECT_ID(N'dbo.AccountStatuses', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AccountStatuses (
        AccountStatusID INT IDENTITY(1,1) PRIMARY KEY,
        StatusCode NVARCHAR(20) NOT NULL UNIQUE,
        DisplayName NVARCHAR(50) NOT NULL
    );
END
GO

MERGE dbo.AccountStatuses AS target
USING (
    VALUES
        (N'approved', N'Onaylandi'),
        (N'pending', N'Onay Bekliyor'),
        (N'rejected', N'Reddedildi')
) AS source (StatusCode, DisplayName)
ON target.StatusCode = source.StatusCode
WHEN MATCHED THEN
    UPDATE SET DisplayName = source.DisplayName
WHEN NOT MATCHED THEN
    INSERT (StatusCode, DisplayName)
    VALUES (source.StatusCode, source.DisplayName);
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        NormalizedEmail AS LOWER(LTRIM(RTRIM(Email))) PERSISTED,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(20) NOT NULL,
        AccountStatusID INT NOT NULL,
        ResetToken NVARCHAR(128) NULL,
        ResetTokenExpiresAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

UPDATE dbo.Users
SET Role = N'Danisan'
WHERE Role IN (N'Danışan', N'DanÄ±ÅŸan');
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE [type] = 'UQ'
      AND [name] = N'UQ_Users_NormalizedEmail'
)
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT UQ_Users_NormalizedEmail UNIQUE (NormalizedEmail);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_Users_AccountStatuses'
)
BEGIN
    ALTER TABLE dbo.Users
    ADD CONSTRAINT FK_Users_AccountStatuses
        FOREIGN KEY (AccountStatusID) REFERENCES dbo.AccountStatuses(AccountStatusID);
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = N'CK_Users_Role'
)
BEGIN
    ALTER TABLE dbo.Users DROP CONSTRAINT CK_Users_Role;
END
GO

ALTER TABLE dbo.Users
ADD CONSTRAINT CK_Users_Role
CHECK (Role IN (N'Danisan', N'Diyetisyen'));
GO

IF OBJECT_ID(N'dbo.Dietitians', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Dietitians (
        DietitianID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL UNIQUE,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_Dietitians_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Dietitians_Users
            FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.Clients', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Clients (
        ClientID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL UNIQUE,
        DietitianUserID INT NULL,
        Yas INT NULL,
        Boy DECIMAL(5,2) NULL,
        Kilo DECIMAL(5,2) NULL,
        Hedef DECIMAL(5,2) NULL,
        SonGorusme DATE NULL,
        Durum NVARCHAR(20) NOT NULL
            CONSTRAINT DF_Clients_Durum DEFAULT N'Pasif',
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
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_Clients_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Clients_Users
            FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
    );
END
GO

IF COL_LENGTH(N'dbo.Clients', N'DietitianUserID') IS NULL
BEGIN
    ALTER TABLE dbo.Clients ADD DietitianUserID INT NULL;
END
GO

IF COL_LENGTH(N'dbo.Clients', N'DietitianID') IS NOT NULL
BEGIN
    EXEC sp_executesql N'
        UPDATE c
        SET DietitianUserID = d.UserID
        FROM dbo.Clients c
        INNER JOIN dbo.Dietitians d ON d.DietitianID = c.DietitianID
        WHERE c.DietitianID IS NOT NULL
          AND c.DietitianUserID IS NULL;
    ';
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = N'CK_Clients_Durum'
)
BEGIN
    ALTER TABLE dbo.Clients DROP CONSTRAINT CK_Clients_Durum;
END
GO

ALTER TABLE dbo.Clients
ADD CONSTRAINT CK_Clients_Durum
CHECK (Durum IN (N'Aktif', N'Pasif', N'Tamamlandi'));
GO

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_Clients_Dietitians'
)
BEGIN
    ALTER TABLE dbo.Clients DROP CONSTRAINT FK_Clients_Dietitians;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_Clients_DietitianUsers'
)
BEGIN
    ALTER TABLE dbo.Clients
    ADD CONSTRAINT FK_Clients_DietitianUsers
        FOREIGN KEY (DietitianUserID) REFERENCES dbo.Users(UserID);
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_Clients_DietitianID'
      AND object_id = OBJECT_ID(N'dbo.Clients')
)
BEGIN
    DROP INDEX IX_Clients_DietitianID ON dbo.Clients;
END
GO

IF COL_LENGTH(N'dbo.Clients', N'DietitianID') IS NOT NULL
BEGIN
    EXEC sp_executesql N'ALTER TABLE dbo.Clients DROP COLUMN DietitianID;';
END
GO

IF OBJECT_ID(N'dbo.DietitianRequests', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DietitianRequests (
        RequestID INT IDENTITY(1,1) PRIMARY KEY,
        DanisanUserID INT NOT NULL,
        DietitianUserID INT NOT NULL,
        Talep NVARCHAR(255) NOT NULL,
        Tarih DATE NOT NULL
            CONSTRAINT DF_DietitianRequests_Tarih DEFAULT CAST(GETDATE() AS DATE),
        Durum NVARCHAR(20) NOT NULL
            CONSTRAINT DF_DietitianRequests_Durum DEFAULT N'pending',
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_DietitianRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_DietitianRequests_Users
            FOREIGN KEY (DanisanUserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
    );
END
GO

IF COL_LENGTH(N'dbo.DietitianRequests', N'DietitianUserID') IS NULL
BEGIN
    ALTER TABLE dbo.DietitianRequests ADD DietitianUserID INT NULL;
END
GO

IF COL_LENGTH(N'dbo.DietitianRequests', N'DietitianID') IS NOT NULL
BEGIN
    EXEC sp_executesql N'
        UPDATE r
        SET DietitianUserID = d.UserID
        FROM dbo.DietitianRequests r
        INNER JOIN dbo.Dietitians d ON d.DietitianID = r.DietitianID
        WHERE r.DietitianID IS NOT NULL
          AND r.DietitianUserID IS NULL;
    ';
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = N'CK_DietitianRequests_Durum'
)
BEGIN
    ALTER TABLE dbo.DietitianRequests DROP CONSTRAINT CK_DietitianRequests_Durum;
END
GO

ALTER TABLE dbo.DietitianRequests
ADD CONSTRAINT CK_DietitianRequests_Durum
CHECK (Durum IN (N'pending', N'approved', N'rejected'));
GO

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_DietitianRequests_Dietitians'
)
BEGIN
    ALTER TABLE dbo.DietitianRequests DROP CONSTRAINT FK_DietitianRequests_Dietitians;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_DietitianRequests_DietitianUsers'
)
BEGIN
    ALTER TABLE dbo.DietitianRequests
    ADD CONSTRAINT FK_DietitianRequests_DietitianUsers
        FOREIGN KEY (DietitianUserID) REFERENCES dbo.Users(UserID);
END
GO

IF COL_LENGTH(N'dbo.DietitianRequests', N'DietitianUserID') IS NOT NULL
BEGIN
    ALTER TABLE dbo.DietitianRequests
    ALTER COLUMN DietitianUserID INT NOT NULL;
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_DietitianRequests_DietitianID_Durum'
      AND object_id = OBJECT_ID(N'dbo.DietitianRequests')
)
BEGIN
    DROP INDEX IX_DietitianRequests_DietitianID_Durum ON dbo.DietitianRequests;
END
GO

IF COL_LENGTH(N'dbo.DietitianRequests', N'DietitianID') IS NOT NULL
BEGIN
    EXEC sp_executesql N'ALTER TABLE dbo.DietitianRequests DROP COLUMN DietitianID;';
END
GO

IF OBJECT_ID(N'dbo.UserMeasurements', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserMeasurements (
        MeasurementID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL,
        Tarih DATE NOT NULL,
        Kilo DECIMAL(5,2) NULL,
        Boy DECIMAL(5,2) NULL,
        BelCevresi DECIMAL(5,2) NULL,
        KalcaCevresi DECIMAL(5,2) NULL,
        YagOrani DECIMAL(5,2) NULL,
        NotText NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_UserMeasurements_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_UserMeasurements_Users
            FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.BeslenmePlani', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.BeslenmePlani (
        PlanID INT IDENTITY(1,1) PRIMARY KEY,
        DietitianUserID INT NOT NULL,
        ClientUserID INT NOT NULL,
        PlanAdi NVARCHAR(100) NOT NULL,
        BaslangicTarihi DATE NOT NULL,
        BitisTarihi DATE NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_BeslenmePlani_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_BeslenmePlani_DietitianUsers'
)
BEGIN
    ALTER TABLE dbo.BeslenmePlani
    ADD CONSTRAINT FK_BeslenmePlani_DietitianUsers
        FOREIGN KEY (DietitianUserID) REFERENCES dbo.Users(UserID);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_BeslenmePlani_ClientUsers'
)
BEGIN
    ALTER TABLE dbo.BeslenmePlani
    ADD CONSTRAINT FK_BeslenmePlani_ClientUsers
        FOREIGN KEY (ClientUserID) REFERENCES dbo.Users(UserID);
END
GO

IF COL_LENGTH(N'dbo.BeslenmePlani', N'HedefKalori') IS NULL
BEGIN
    ALTER TABLE dbo.BeslenmePlani ADD HedefKalori INT NULL;
END
GO

IF COL_LENGTH(N'dbo.BeslenmePlani', N'SuHedefi') IS NULL
BEGIN
    ALTER TABLE dbo.BeslenmePlani ADD SuHedefi INT NULL;
END
GO

IF COL_LENGTH(N'dbo.BeslenmePlani', N'Durum') IS NULL
BEGIN
    ALTER TABLE dbo.BeslenmePlani ADD Durum NVARCHAR(20) NULL;
END
GO

UPDATE dbo.BeslenmePlani
SET Durum = N'Aktif'
WHERE Durum IS NULL;
GO

IF EXISTS (
    SELECT 1
    FROM sys.default_constraints
    WHERE [name] = N'DF_BeslenmePlani_Durum'
)
BEGIN
    ALTER TABLE dbo.BeslenmePlani DROP CONSTRAINT DF_BeslenmePlani_Durum;
END
GO

ALTER TABLE dbo.BeslenmePlani
ADD CONSTRAINT DF_BeslenmePlani_Durum DEFAULT N'Aktif' FOR Durum;
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE [name] = N'CK_BeslenmePlani_Durum'
)
BEGIN
    ALTER TABLE dbo.BeslenmePlani DROP CONSTRAINT CK_BeslenmePlani_Durum;
END
GO

ALTER TABLE dbo.BeslenmePlani
ADD CONSTRAINT CK_BeslenmePlani_Durum
CHECK (Durum IN (N'Aktif', N'Pasif', N'Tamamlandi', N'Taslak'));
GO

IF OBJECT_ID(N'dbo.PlanOgun', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PlanOgun (
        PlanOgunID INT IDENTITY(1,1) PRIMARY KEY,
        PlanID INT NOT NULL,
        Gun DATE NOT NULL,
        Ogunler NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_PlanOgun_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_PlanOgun_BeslenmePlani
            FOREIGN KEY (PlanID) REFERENCES dbo.BeslenmePlani(PlanID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.PlanMealDetails', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PlanMealDetails (
        PlanMealDetailID BIGINT IDENTITY(1,1) PRIMARY KEY,
        PlanID INT NOT NULL,
        Gun DATE NOT NULL,
        OgunAdi NVARCHAR(50) NOT NULL,
        Saat TIME NULL,
        Icerik NVARCHAR(MAX) NULL,
        Kalori INT NULL,
        SortOrder INT NOT NULL CONSTRAINT DF_PlanMealDetails_SortOrder DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_PlanMealDetails_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_PlanMealDetails_BeslenmePlani
            FOREIGN KEY (PlanID) REFERENCES dbo.BeslenmePlani(PlanID) ON DELETE CASCADE
    );
END
GO

/*
  Asagidaki tablolar projeye sonraki asamalarda eklenecek akislar icin korunuyor.
*/

IF OBJECT_ID(N'dbo.Foods', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Foods (
        FoodID INT IDENTITY(1,1) PRIMARY KEY,
        FoodName NVARCHAR(100) NOT NULL,
        Calories INT NULL,
        Protein DECIMAL(6,2) NULL,
        Fat DECIMAL(6,2) NULL,
        Carbohydrate DECIMAL(6,2) NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Meals', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Meals (
        MealID INT IDENTITY(1,1) PRIMARY KEY,
        ClientID INT NOT NULL,
        MealType NVARCHAR(50) NOT NULL,
        MealTime TIME NULL,
        Notes NVARCHAR(MAX) NULL,
        CONSTRAINT FK_Meals_Clients
            FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.MealFoods', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.MealFoods (
        MealID INT NOT NULL,
        FoodID INT NOT NULL,
        Quantity NVARCHAR(50) NULL,
        CONSTRAINT PK_MealFoods PRIMARY KEY (MealID, FoodID),
        CONSTRAINT FK_MealFoods_Meals
            FOREIGN KEY (MealID) REFERENCES dbo.Meals(MealID) ON DELETE CASCADE,
        CONSTRAINT FK_MealFoods_Foods
            FOREIGN KEY (FoodID) REFERENCES dbo.Foods(FoodID)
    );
END
GO

IF OBJECT_ID(N'dbo.WeightTracking', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WeightTracking (
        WeightID INT IDENTITY(1,1) PRIMARY KEY,
        ClientID INT NOT NULL,
        Weight DECIMAL(5,2) NOT NULL,
        RecordDate DATE NOT NULL
            CONSTRAINT DF_WeightTracking_RecordDate DEFAULT CAST(GETDATE() AS DATE),
        CONSTRAINT FK_WeightTracking_Clients
            FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.DailyTracking', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DailyTracking (
        TrackingID INT IDENTITY(1,1) PRIMARY KEY,
        ClientID INT NOT NULL,
        Notes NVARCHAR(MAX) NULL,
        RecordDate DATE NOT NULL
            CONSTRAINT DF_DailyTracking_RecordDate DEFAULT CAST(GETDATE() AS DATE),
        CONSTRAINT FK_DailyTracking_Clients
            FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID) ON DELETE CASCADE
    );
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'DietitianUserID') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD DietitianUserID INT NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'Ogun') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD Ogun NVARCHAR(50) NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'Kalori') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD Kalori INT NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'Su') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD Su INT NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'HedefKalori') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD HedefKalori INT NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'SuHedefi') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD SuHedefi INT NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'Durum') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD Durum NVARCHAR(30) NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'ClientNote') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD ClientNote NVARCHAR(MAX) NULL;
END
GO

IF COL_LENGTH(N'dbo.DailyTracking', N'DietitianNote') IS NULL
BEGIN
    ALTER TABLE dbo.DailyTracking ADD DietitianNote NVARCHAR(MAX) NULL;
END
GO

UPDATE dbo.DailyTracking
SET Durum = N'Takipte'
WHERE Durum IS NULL;
GO

IF EXISTS (
    SELECT 1
    FROM sys.default_constraints
    WHERE [name] = N'DF_DailyTracking_Durum'
)
BEGIN
    ALTER TABLE dbo.DailyTracking DROP CONSTRAINT DF_DailyTracking_Durum;
END
GO

ALTER TABLE dbo.DailyTracking
ADD CONSTRAINT DF_DailyTracking_Durum DEFAULT N'Takipte' FOR Durum;
GO

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE [name] = N'FK_DailyTracking_DietitianUsers'
)
BEGIN
    ALTER TABLE dbo.DailyTracking DROP CONSTRAINT FK_DailyTracking_DietitianUsers;
END
GO

ALTER TABLE dbo.DailyTracking
ADD CONSTRAINT FK_DailyTracking_DietitianUsers
    FOREIGN KEY (DietitianUserID) REFERENCES dbo.Users(UserID);
GO

IF OBJECT_ID(N'dbo.DailyFoodEntries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DailyFoodEntries (
        FoodEntryID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ClientID INT NOT NULL,
        RecordDate DATE NOT NULL
            CONSTRAINT DF_DailyFoodEntries_RecordDate DEFAULT CAST(GETDATE() AS DATE),
        Ogun NVARCHAR(50) NULL,
        FoodName NVARCHAR(120) NOT NULL,
        Calories INT NOT NULL,
        Quantity NVARCHAR(50) NULL,
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_DailyFoodEntries_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_DailyFoodEntries_Clients
            FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.WaterTracking', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.WaterTracking (
        WaterTrackingID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ClientID INT NOT NULL,
        RecordDate DATE NOT NULL
            CONSTRAINT DF_WaterTracking_RecordDate DEFAULT CAST(GETDATE() AS DATE),
        TargetGlasses INT NOT NULL CONSTRAINT DF_WaterTracking_TargetGlasses DEFAULT 8,
        ConsumedGlasses INT NOT NULL CONSTRAINT DF_WaterTracking_ConsumedGlasses DEFAULT 0,
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_WaterTracking_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_WaterTracking_Clients
            FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.Notifications', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        NotificationID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL,
        Title NVARCHAR(120) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        NotificationType NVARCHAR(50) NOT NULL,
        IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
        RelatedEntityType NVARCHAR(50) NULL,
        RelatedEntityID BIGINT NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME(),
        ReadAt DATETIME2 NULL,
        CONSTRAINT FK_Notifications_Users
            FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.ClientReports', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ClientReports (
        ReportID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ClientID INT NOT NULL,
        ReportStartDate DATE NOT NULL,
        ReportEndDate DATE NOT NULL,
        AverageCalories DECIMAL(8,2) NULL,
        AverageWaterGlasses DECIMAL(8,2) NULL,
        WeightChange DECIMAL(6,2) NULL,
        AdherenceRate DECIMAL(5,2) NULL,
        SummaryText NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_ClientReports_CreatedAt DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ClientReports_Clients
            FOREIGN KEY (ClientID) REFERENCES dbo.Clients(ClientID) ON DELETE CASCADE
    );
END
GO

IF OBJECT_ID(N'dbo.FoodSwapSuggestions', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.FoodSwapSuggestions (
        SuggestionID INT IDENTITY(1,1) PRIMARY KEY,
        SourceFood NVARCHAR(150) NOT NULL,
        Category NVARCHAR(80) NULL,
        CreatedAt DATETIME2 NOT NULL
            CONSTRAINT DF_FoodSwapSuggestions_CreatedAt DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID(N'dbo.FoodSwapAlternatives', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.FoodSwapAlternatives (
        AlternativeID INT IDENTITY(1,1) PRIMARY KEY,
        SuggestionID INT NOT NULL,
        AlternativeFood NVARCHAR(150) NOT NULL,
        SortOrder INT NOT NULL CONSTRAINT DF_FoodSwapAlternatives_SortOrder DEFAULT 0,
        CONSTRAINT FK_FoodSwapAlternatives_Suggestions
            FOREIGN KEY (SuggestionID) REFERENCES dbo.FoodSwapSuggestions(SuggestionID) ON DELETE CASCADE
    );
END
GO

MERGE dbo.FoodSwapSuggestions AS target
USING (
    VALUES
        (N'1 Dilim Tam Bugday Ekmegi', N'Tahil'),
        (N'1 Kase Yogurt', N'Sut Urunu'),
        (N'1 Orta Boy Elma', N'Meyve'),
        (N'1 Haslanmis Yumurta', N'Protein'),
        (N'1 Tatli Kasigi Zeytinyagi', N'Yag'),
        (N'3 Yemek Kasigi Pirinc Pilavi', N'Tahil')
) AS source (SourceFood, Category)
ON target.SourceFood = source.SourceFood
WHEN MATCHED THEN
    UPDATE SET Category = source.Category
WHEN NOT MATCHED THEN
    INSERT (SourceFood, Category)
    VALUES (source.SourceFood, source.Category);
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Dilim Tam Bugday Ekmegi'
      AND a.AlternativeFood = N'2 Yemek Kasigi Bulgur Pilavi'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'2 Yemek Kasigi Bulgur Pilavi', 1
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Dilim Tam Bugday Ekmegi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Dilim Tam Bugday Ekmegi'
      AND a.AlternativeFood = N'2 Yemek Kasigi Makarna'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'2 Yemek Kasigi Makarna', 2
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Dilim Tam Bugday Ekmegi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Dilim Tam Bugday Ekmegi'
      AND a.AlternativeFood = N'1/2 Kase Corba'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1/2 Kase Corba', 3
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Dilim Tam Bugday Ekmegi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Kase Yogurt'
      AND a.AlternativeFood = N'1 Bardak Ayran'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1 Bardak Ayran', 1
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Kase Yogurt';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Kase Yogurt'
      AND a.AlternativeFood = N'1 Su Bardagi Kefir'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1 Su Bardagi Kefir', 2
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Kase Yogurt';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Kase Yogurt'
      AND a.AlternativeFood = N'2 Yemek Kasigi Labne'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'2 Yemek Kasigi Labne', 3
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Kase Yogurt';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Orta Boy Elma'
      AND a.AlternativeFood = N'1 Kucuk Armut'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1 Kucuk Armut', 1
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Orta Boy Elma';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Orta Boy Elma'
      AND a.AlternativeFood = N'1 Orta Boy Portakal'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1 Orta Boy Portakal', 2
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Orta Boy Elma';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Orta Boy Elma'
      AND a.AlternativeFood = N'10-12 Uzum'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'10-12 Uzum', 3
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Orta Boy Elma';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Haslanmis Yumurta'
      AND a.AlternativeFood = N'30 gr Beyaz Peynir'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'30 gr Beyaz Peynir', 1
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Haslanmis Yumurta';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Haslanmis Yumurta'
      AND a.AlternativeFood = N'2 Yemek Kasigi Lor Peyniri'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'2 Yemek Kasigi Lor Peyniri', 2
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Haslanmis Yumurta';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Haslanmis Yumurta'
      AND a.AlternativeFood = N'2 Dilim Hindi Fume'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'2 Dilim Hindi Fume', 3
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Haslanmis Yumurta';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Tatli Kasigi Zeytinyagi'
      AND a.AlternativeFood = N'5 Adet Zeytin'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'5 Adet Zeytin', 1
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Tatli Kasigi Zeytinyagi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Tatli Kasigi Zeytinyagi'
      AND a.AlternativeFood = N'1 Tatli Kasigi Avokado Ezmesi'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1 Tatli Kasigi Avokado Ezmesi', 2
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Tatli Kasigi Zeytinyagi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'1 Tatli Kasigi Zeytinyagi'
      AND a.AlternativeFood = N'6 Adet Badem'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'6 Adet Badem', 3
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'1 Tatli Kasigi Zeytinyagi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'3 Yemek Kasigi Pirinc Pilavi'
      AND a.AlternativeFood = N'3 Yemek Kasigi Bulgur Pilavi'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'3 Yemek Kasigi Bulgur Pilavi', 1
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'3 Yemek Kasigi Pirinc Pilavi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'3 Yemek Kasigi Pirinc Pilavi'
      AND a.AlternativeFood = N'1 Dilim Ekmek'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1 Dilim Ekmek', 2
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'3 Yemek Kasigi Pirinc Pilavi';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM dbo.FoodSwapAlternatives a
    INNER JOIN dbo.FoodSwapSuggestions s ON s.SuggestionID = a.SuggestionID
    WHERE s.SourceFood = N'3 Yemek Kasigi Pirinc Pilavi'
      AND a.AlternativeFood = N'1 Kucuk Haslanmis Patates'
)
BEGIN
    INSERT INTO dbo.FoodSwapAlternatives (SuggestionID, AlternativeFood, SortOrder)
    SELECT SuggestionID, N'1 Kucuk Haslanmis Patates', 3
    FROM dbo.FoodSwapSuggestions
    WHERE SourceFood = N'3 Yemek Kasigi Pirinc Pilavi';
END
GO

IF OBJECT_ID(N'dbo.vw_ClientReportMetrics', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_ClientReportMetrics;
END
GO

CREATE VIEW dbo.vw_ClientReportMetrics
AS
SELECT
    c.ClientID,
    c.UserID AS ClientUserID,
    AVG(CAST(d.Kalori AS DECIMAL(8,2))) AS OrtalamaKalori,
    AVG(CAST(COALESCE(w.ConsumedGlasses, d.Su) AS DECIMAL(8,2))) AS SuOrtalama,
    MAX(wt.Weight) - MIN(wt.Weight) AS KiloDegisim,
    AVG(
        CASE
            WHEN d.HedefKalori IS NULL OR d.HedefKalori = 0 THEN NULL
            WHEN d.Kalori BETWEEN d.HedefKalori * 0.9 AND d.HedefKalori * 1.1 THEN 100.0
            ELSE 0.0
        END
    ) AS UyumOrani
FROM dbo.Clients c
LEFT JOIN dbo.DailyTracking d ON d.ClientID = c.ClientID
LEFT JOIN dbo.WaterTracking w
    ON w.ClientID = c.ClientID
   AND w.RecordDate = d.RecordDate
LEFT JOIN dbo.WeightTracking wt ON wt.ClientID = c.ClientID
GROUP BY c.ClientID, c.UserID;
GO

IF EXISTS (
    SELECT 1
    FROM sys.triggers
    WHERE [name] = N'TRG_Dietitians_UserRole'
)
BEGIN
    DROP TRIGGER dbo.TRG_Dietitians_UserRole;
END
GO

CREATE TRIGGER dbo.TRG_Dietitians_UserRole
ON dbo.Dietitians
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.Users u ON u.UserID = i.UserID
        WHERE u.Role <> N'Diyetisyen'
    )
    BEGIN
        THROW 50001, 'Dietitians tablosuna sadece Diyetisyen rolundeki kullanicilar baglanabilir.', 1;
    END
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.triggers
    WHERE [name] = N'TRG_Clients_RoleAndDietitian'
)
BEGIN
    DROP TRIGGER dbo.TRG_Clients_RoleAndDietitian;
END
GO

CREATE TRIGGER dbo.TRG_Clients_RoleAndDietitian
ON dbo.Clients
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.Users u ON u.UserID = i.UserID
        WHERE u.Role <> N'Danisan'
    )
    BEGIN
        THROW 50002, 'Clients tablosuna sadece Danisan rolundeki kullanicilar baglanabilir.', 1;
    END

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.Users u ON u.UserID = i.DietitianUserID
        WHERE i.DietitianUserID IS NOT NULL
          AND u.Role <> N'Diyetisyen'
    )
    BEGIN
        THROW 50003, 'DietitianUserID alani sadece Diyetisyen rolundeki kullanicilari gosterebilir.', 1;
    END
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.triggers
    WHERE [name] = N'TRG_DietitianRequests_RoleValidation'
)
BEGIN
    DROP TRIGGER dbo.TRG_DietitianRequests_RoleValidation;
END
GO

CREATE TRIGGER dbo.TRG_DietitianRequests_RoleValidation
ON dbo.DietitianRequests
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.Users cu ON cu.UserID = i.DanisanUserID
        INNER JOIN dbo.Users du ON du.UserID = i.DietitianUserID
        WHERE cu.Role <> N'Danisan'
           OR du.Role <> N'Diyetisyen'
    )
    BEGIN
        THROW 50004, 'DietitianRequests kayitlari Danisan -> Diyetisyen eslesmesi olmadan olusturulamaz.', 1;
    END
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.triggers
    WHERE [name] = N'TRG_BeslenmePlani_RoleValidation'
)
BEGIN
    DROP TRIGGER dbo.TRG_BeslenmePlani_RoleValidation;
END
GO

CREATE TRIGGER dbo.TRG_BeslenmePlani_RoleValidation
ON dbo.BeslenmePlani
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.Users du ON du.UserID = i.DietitianUserID
        INNER JOIN dbo.Users cu ON cu.UserID = i.ClientUserID
        WHERE du.Role <> N'Diyetisyen'
           OR cu.Role <> N'Danisan'
    )
    BEGIN
        THROW 50005, 'BeslenmePlani sadece Diyetisyen -> Danisan eslesmesi ile olusturulabilir.', 1;
    END

    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN dbo.Clients c ON c.UserID = i.ClientUserID
        WHERE c.DietitianUserID IS NOT NULL
          AND c.DietitianUserID <> i.DietitianUserID
    )
    BEGIN
        THROW 50006, 'Plan verilen danisan, baska bir diyetisyene bagli gorunuyor.', 1;
    END
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_Users_Role'
      AND object_id = OBJECT_ID(N'dbo.Users')
)
BEGIN
    CREATE INDEX IX_Users_Role ON dbo.Users(Role);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_Users_AccountStatusID'
      AND object_id = OBJECT_ID(N'dbo.Users')
)
BEGIN
    CREATE INDEX IX_Users_AccountStatusID ON dbo.Users(AccountStatusID);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_Clients_DietitianUserID'
      AND object_id = OBJECT_ID(N'dbo.Clients')
)
BEGIN
    CREATE INDEX IX_Clients_DietitianUserID ON dbo.Clients(DietitianUserID);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_DietitianRequests_DietitianUserID_Durum'
      AND object_id = OBJECT_ID(N'dbo.DietitianRequests')
)
BEGIN
    CREATE INDEX IX_DietitianRequests_DietitianUserID_Durum
        ON dbo.DietitianRequests(DietitianUserID, Durum);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'UX_DietitianRequests_Pending'
      AND object_id = OBJECT_ID(N'dbo.DietitianRequests')
)
BEGIN
    CREATE UNIQUE INDEX UX_DietitianRequests_Pending
        ON dbo.DietitianRequests(DanisanUserID, DietitianUserID)
        WHERE Durum = N'pending';
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_UserMeasurements_UserID_Tarih'
      AND object_id = OBJECT_ID(N'dbo.UserMeasurements')
)
BEGIN
    CREATE INDEX IX_UserMeasurements_UserID_Tarih
        ON dbo.UserMeasurements(UserID, Tarih DESC);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_DailyTracking_ClientID_RecordDate'
      AND object_id = OBJECT_ID(N'dbo.DailyTracking')
)
BEGIN
    CREATE INDEX IX_DailyTracking_ClientID_RecordDate
        ON dbo.DailyTracking(ClientID, RecordDate DESC);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_DailyFoodEntries_ClientID_RecordDate'
      AND object_id = OBJECT_ID(N'dbo.DailyFoodEntries')
)
BEGIN
    CREATE INDEX IX_DailyFoodEntries_ClientID_RecordDate
        ON dbo.DailyFoodEntries(ClientID, RecordDate DESC);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'UX_WaterTracking_ClientID_RecordDate'
      AND object_id = OBJECT_ID(N'dbo.WaterTracking')
)
BEGIN
    CREATE UNIQUE INDEX UX_WaterTracking_ClientID_RecordDate
        ON dbo.WaterTracking(ClientID, RecordDate);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_Notifications_UserID_IsRead_CreatedAt'
      AND object_id = OBJECT_ID(N'dbo.Notifications')
)
BEGIN
    CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt
        ON dbo.Notifications(UserID, IsRead, CreatedAt DESC);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'UX_ClientReports_ClientID_Period'
      AND object_id = OBJECT_ID(N'dbo.ClientReports')
)
BEGIN
    CREATE UNIQUE INDEX UX_ClientReports_ClientID_Period
        ON dbo.ClientReports(ClientID, ReportStartDate, ReportEndDate);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_FoodSwapSuggestions_SourceFood'
      AND object_id = OBJECT_ID(N'dbo.FoodSwapSuggestions')
)
BEGIN
    CREATE UNIQUE INDEX IX_FoodSwapSuggestions_SourceFood
        ON dbo.FoodSwapSuggestions(SourceFood);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_FoodSwapAlternatives_SuggestionID_SortOrder'
      AND object_id = OBJECT_ID(N'dbo.FoodSwapAlternatives')
)
BEGIN
    CREATE INDEX IX_FoodSwapAlternatives_SuggestionID_SortOrder
        ON dbo.FoodSwapAlternatives(SuggestionID, SortOrder);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_PlanMealDetails_PlanID_Gun_SortOrder'
      AND object_id = OBJECT_ID(N'dbo.PlanMealDetails')
)
BEGIN
    CREATE INDEX IX_PlanMealDetails_PlanID_Gun_SortOrder
        ON dbo.PlanMealDetails(PlanID, Gun, SortOrder);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_BeslenmePlani_DietitianUserID'
      AND object_id = OBJECT_ID(N'dbo.BeslenmePlani')
)
BEGIN
    CREATE INDEX IX_BeslenmePlani_DietitianUserID
        ON dbo.BeslenmePlani(DietitianUserID);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_BeslenmePlani_ClientUserID'
      AND object_id = OBJECT_ID(N'dbo.BeslenmePlani')
)
BEGIN
    CREATE INDEX IX_BeslenmePlani_ClientUserID
        ON dbo.BeslenmePlani(ClientUserID);
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_PlanOgun_PlanID_Gun'
      AND object_id = OBJECT_ID(N'dbo.PlanOgun')
      AND is_unique = 0
)
BEGIN
    DROP INDEX IX_PlanOgun_PlanID_Gun ON dbo.PlanOgun;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE [name] = N'IX_PlanOgun_PlanID_Gun'
      AND object_id = OBJECT_ID(N'dbo.PlanOgun')
      AND is_unique = 1
)
BEGIN
    CREATE UNIQUE INDEX IX_PlanOgun_PlanID_Gun
        ON dbo.PlanOgun(PlanID, Gun);
END
GO
