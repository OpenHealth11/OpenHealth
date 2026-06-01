# OpenHealth

React (Vite) arayüzü ve Node.js (Express) API.

## Admin onayı (diyetisyen hesapları)

Diyetisyen olarak **yeni kayıt** olan kullanıcılar **`pending`** durumunda oluşur; giriş yapamazlar (API **403** döner).

### Arayüzden onay

1. `.env` içinde **`ADMIN_API_KEY`** tanımlayın (örnek için `.env.example`’a bakın); sunucuyu yeniden başlatın.
2. Tarayıcıda **`/admin/diyetisyen-onay`** sayfasını açın (geliştirmede genelde `http://localhost:5173/admin/diyetisyen-onay`).
3. Aynı anahtarı sayfadaki alana yazıp **Anahtarı kullan** deyin; liste gelmezse **Listeyi yenile**ye basın.
4. Bekleyen diyetisyenler için **Onayla** veya **Reddet** kullanın.

Bu sayfa isteklerde **`X-Admin-Key`** başlığını gönderir; anahtarı üretimde güçlü tutun ve paylaşmayın.

### JSON dosyası ile manuel onay (MSSQL kullanmıyorsanız)

`server/data/users.json` içinde ilgili kullanıcının **`status`** alanını **`"approved"`** yapın; reddetmek için **`"rejected"`** kullanın.

Danışan kayıtları **`approved`** ile oluşur ve doğrudan giriş yapabilir.

### MSSQL kullanıyorsanız

Hesap durumu **`Users.AccountStatusID`** üzerinden tutulur; arayüz bunu günceller. İsterseniz doğrudan SQL ile de `approved` / `rejected` ataabilirsiniz.

Kayıtta **`CHECK constraint ... Role`** (547) hatası alırsanız eski bir DB şemasında `Users.Role` kısıtı dar tanımlı olabilir; projede **`scripts/fix-users-role-check.sql`** dosyasını DiyetDB üzerinde bir kez çalıştırın. Ardından API’yi yeniden başlatın.

### Docker SQL Server (`docker-compose.yml`)

- Repo **`compose`** varsayılan SA şifresi: **`OpenHealth_Dev_1`** (sonunda `!` yok). `.env` içindeki **`Password=`** buna **veya** konteyneri ilk kuran kişinin verdiği şifreye **aynı** olmalı.
- `.env` içinde **`MSSQL_CONNECTION_STRING`** için **`Server=127.0.0.1,1433`** kullanın; **`Password=`** ile ilk `docker compose up` sırasında geçerli olan **`MSSQL_SA_PASSWORD`** **aynı** olmalı (bkz. `.env.example`).
- **`Login failed for user 'sa'`** alıyorsanız büyük olasılıkla konteyner volume’u **başka bir şifreyle** oluşturulmuştur; `.env`’deki şifre sunucudakiyle uyuşmuyor. Çözüm: doğru eski şifreyi kullanın veya geliştirme ortamında volume’u sıfırlayıp tek şifreyle yeniden kurun: `docker compose down -v`, ardından `docker compose up -d`, sonra **`diyetdb.sql`**’i tekrar çalıştırın (**tüm Docker DB verisi silinir**).
- API ve Vite birlikte: `npm run dev:all` veya iki terminalde `npm run server` + `npm run dev`.
