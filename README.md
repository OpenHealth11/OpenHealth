# OpenHealth

React (Vite) arayüzü ve Node.js (Express) API.

## Admin onayı

Diyetisyen olarak **yeni kayıt** olan kullanıcılar `server/data/users.json` içinde **`status: "pending"`** ile oluşturulur; giriş yapamazlar, API uygun bir **403** mesajı döner.

**Manuel onay:** `server/data/users.json` dosyasını açıp ilgili kullanıcının `status` alanını **`"approved"`** yapmanız yeterlidir (JSON’u geçerli tutun). Reddetmek için `"rejected"` kullanabilirsiniz.

Danışan kayıtları **`status: "approved"`** ile oluşur ve doğrudan giriş yapabilir.

Gerçek bir üründe bu adım bir **admin paneli** veya arka uç iş akışı ile otomatik yönetilir; bu repoda kasıtlı olarak sadece dosya üzerinden simüle edilir.
