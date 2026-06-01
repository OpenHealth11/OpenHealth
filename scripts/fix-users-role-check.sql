-- Mevcut DiyetDB'de Users.Role CHECK kısıtı kodla uyuşmuyorsa (kayıt 547 hatası) bir kez çalıştırın.
-- Örnek: sqlcmd veya SSMS'te DiyetDB seçili iken bu dosyayı çalıştırın.

USE DiyetDB;
GO

DECLARE @cn SYSNAME;
DECLARE @sql NVARCHAR(MAX);

SELECT @cn = cc.name
FROM sys.check_constraints AS cc
WHERE cc.parent_object_id = OBJECT_ID(N'dbo.Users')
  AND OBJECT_DEFINITION(cc.object_id) LIKE N'%Role%';

IF @cn IS NOT NULL
BEGIN
  SET @sql = N'ALTER TABLE dbo.Users DROP CONSTRAINT ' + QUOTENAME(@cn);
  EXEC sp_executesql @sql;
END
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.check_constraints AS cc
  WHERE cc.parent_object_id = OBJECT_ID(N'dbo.Users')
    AND cc.name = N'CK_Users_Role_OpenHealth'
)
BEGIN
  ALTER TABLE dbo.Users ADD CONSTRAINT CK_Users_Role_OpenHealth
    CHECK (Role IN (N'Danisan', N'Danışan', N'Diyetisyen'));
END
GO
