/*
  İleride: danışan profilde yaş + kan raporu (sunucuda dosya yolu) özellikleri için.

  Çalıştırma (örnek):
    sqlcmd -S 127.0.0.1,1433 -d DiyetDB -U sa -P "<şifre>" -i sql/ileride_eklenecek_clients.sql

  Idempotent: kolon zaten varsa tekrar eklemez.
  Kod tarafında da GET /api/profile seçimi, PUT profile ve kan endpoint’leri tekrar
  bu kolonları kullanacak şekilde yazılmalıdır (repo geçmişi / diyetdb.sql ile uyumlu).

  Kan dosyası: gerçek PDF/JPEG içeriği veritabanında değil; disk üzerinde saklanır,
  DB’de sadece göreli yol ve dosya adı bilgisi tutulur.
*/

USE DiyetDB;
GO

IF COL_LENGTH('dbo.Clients', 'Yas') IS NULL
  ALTER TABLE dbo.Clients ADD Yas INT NULL;

IF COL_LENGTH('dbo.Clients', 'KanRaporuRelativePath') IS NULL
  ALTER TABLE dbo.Clients ADD KanRaporuRelativePath NVARCHAR(500) NULL;

IF COL_LENGTH('dbo.Clients', 'KanRaporuOriginalName') IS NULL
  ALTER TABLE dbo.Clients ADD KanRaporuOriginalName NVARCHAR(260) NULL;

IF COL_LENGTH('dbo.Clients', 'KanRaporuUploadedAt') IS NULL
  ALTER TABLE dbo.Clients ADD KanRaporuUploadedAt DATETIME2 NULL;

GO
