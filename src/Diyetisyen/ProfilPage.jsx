import {
  FiUser,
  FiAward,
  FiBriefcase,
  FiBookOpen,
  FiStar,
  FiSave,
  FiUpload,
} from "react-icons/fi";

import "./Diyetisyen.css";

function ProfilPage({ profile, onProfileChange, onSaveProfile }) {
  return (
    <div className="dy-profile-page">
      <div className="dy-profile-grid">
        <div className="dy-profile-left">
          <div className="dy-profile-card">
            <div className="dy-profile-avatar">
              <FiUser />
            </div>

            <h2>{profile.fullName}</h2>
            <p className="dy-profile-role">Diyetisyen Hesabı</p>

            <div className="dy-profile-stats">
              <div>
                <span>UZMANLIK</span>
                <strong>{profile.uzmanlik}</strong>
              </div>

              <div>
                <span>DENEYİM</span>
                <strong>{profile.deneyim} yıl</strong>
              </div>

              <div>
                <span>DANIŞAN</span>
                <strong>{profile.danisan}</strong>
              </div>
            </div>
          </div>

          <div className="dy-summary-card">
            <h3>Mesleki Özet</h3>

            <div className="dy-summary-list">
              <div className="dy-summary-item">
                <div className="dy-summary-icon">
                  <FiAward />
                </div>
                <div>
                  <span>Uzmanlık Alanı</span>
                  <strong>{profile.uzmanlik}</strong>
                </div>
              </div>

              <div className="dy-summary-item">
                <div className="dy-summary-icon">
                  <FiBriefcase />
                </div>
                <div>
                  <span>Çalışma Yeri</span>
                  <strong>{profile.klinik}</strong>
                </div>
              </div>

              <div className="dy-summary-item">
                <div className="dy-summary-icon">
                  <FiBookOpen />
                </div>
                <div>
                  <span>Eğitim</span>
                  <strong>{profile.okul}</strong>
                </div>
              </div>

              <div className="dy-summary-item">
                <div className="dy-summary-icon">
                  <FiStar />
                </div>
                <div>
                  <span>Puan</span>
                  <strong>{profile.puan}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form className="dy-profile-form" onSubmit={onSaveProfile}>
          <div className="dy-form-header">
            <h2>Profil Bilgileri</h2>
            <p>Diyetisyen hesabınızı buradan düzenleyebilirsiniz.</p>
          </div>

          <div className="dy-form-group">
            <label>AD SOYAD</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName || ""}
              onChange={onProfileChange}
            />
          </div>

          <div className="dy-form-row">
            <div className="dy-form-group">
              <label>UZMANLIK</label>
              <input
                type="text"
                name="uzmanlik"
                value={profile.uzmanlik || ""}
                onChange={onProfileChange}
              />
            </div>

            <div className="dy-form-group">
              <label>DENEYİM</label>
              <input
                type="number"
                name="deneyim"
                value={profile.deneyim || ""}
                onChange={onProfileChange}
              />
            </div>
          </div>

          <div className="dy-form-row">
            <div className="dy-form-group">
              <label>DANIŞAN SAYISI</label>
              <input
                type="number"
                name="danisan"
                value={profile.danisan || ""}
                onChange={onProfileChange}
              />
            </div>

            <div className="dy-form-group">
              <label>PUAN</label>
              <input
                type="text"
                name="puan"
                value={profile.puan || ""}
                onChange={onProfileChange}
              />
            </div>
          </div>

          <div className="dy-form-group">
            <label>MEZUN OLUNAN OKUL</label>
            <input
              type="text"
              name="okul"
              value={profile.okul || ""}
              onChange={onProfileChange}
            />
          </div>

          <div className="dy-form-group">
            <label>ÇALIŞMA YERİ</label>
            <input
              type="text"
              name="klinik"
              value={profile.klinik || ""}
              onChange={onProfileChange}
            />
          </div>

          <div className="dy-form-row">
            <div className="dy-form-group">
              <label>TELEFON</label>
              <input
                type="text"
                name="telefon"
                value={profile.telefon || ""}
                onChange={onProfileChange}
              />
            </div>

            <div className="dy-form-group">
              <label>E-POSTA</label>
              <input
                type="email"
                name="email"
                value={profile.email || ""}
                onChange={onProfileChange}
              />
            </div>
          </div>

          <div className="dy-form-group">
            <label>ŞEHİR</label>
            <input
              type="text"
              name="sehir"
              value={profile.sehir || ""}
              onChange={onProfileChange}
            />
          </div>

          <div className="dy-form-group">
            <label>HAKKIMDA</label>
            <textarea
              rows="5"
              name="hakkimda"
              value={profile.hakkimda || ""}
              onChange={onProfileChange}
            />
          </div>

          <div className="dy-form-group">
            <label>SERTİFİKA YÜKLE</label>

            <label className="dy-upload-box">
              <FiUpload />
              <span>PDF / Görsel dosya seç</span>

              <input
                type="file"
                hidden
                name="sertifika"
                onChange={onProfileChange}
              />
            </label>
          </div>

          <button type="submit" className="dy-save-btn">
            <FiSave />
            Bilgileri Güncelle
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilPage;