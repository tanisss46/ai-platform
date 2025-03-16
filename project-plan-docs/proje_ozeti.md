# AI-Platform Projesi Özeti

## Proje Yapısı ve Modüller

Bu dosya, AI-Platform projesinin mevcut durumu ve yapılan son değişiklikler hakkında bilgi içermektedir. Yeni chat'te bu bilgileri Claude ile paylaşabilirsiniz.

### Temel Bileşenler

1. **Frontend**: React ve Redux kullanılarak geliştirilmiş
2. **Backend**: NestJS ile geliştirilmiş, mikroservis mimarisi kullanılıyor
   - storage-service: Dosya yönetimi, klasör işlemleri ve thumbnail oluşturma
   - user-service: Kullanıcı yönetimi
   - ai-orchestration-service: AI modelleri ve işlemleri için
   - llm-assistant-service: LLM asistanları için
   - notification-service: Bildirimler için
   - api-gateway: Tüm servisleri bir araya getiren gateway

### Altyapı

- **Veritabanı**: MongoDB kullanılıyor
- **Depolama**: Minio/S3 uyumlu depolama kullanılıyor
- **Deployment**: VM üzerinde doğrudan çalıştırma (Docker/Kubernetes gerekli değil)

## Çalışma Yöntemimiz ve İlerlemelerimiz

### Çalışma Metodolojisi

1. **VM-Tabanlı Geliştirme**: Docker yerine doğrudan Google Cloud VM üzerinde geliştirme yapıyoruz
2. **Komut İletimi**: VM terminalinde çalıştırılacak komutları kopyala-yapıştır şeklinde iletiyoruz
3. **Türkçe-İngilizce Karma İletişim**: İletişim genellikle Türkçe, kod ve teknik terimler İngilizce
4. **Modüler Geliştirme**: Her bir servis kendi içinde bağımsız olarak geliştiriliyor

### Tamamlanan İlerlemeler

1. **Frontend**:
   - Redux store yapılandırması düzeltildi
   - API entegrasyonları tamamlandı
   - LLM komut sistemi entegre edildi
   - UI/UX iyileştirmeleri yapıldı

2. **Backend**:
   - **Storage-Service**:
     - Klasör yönetimi iyileştirildi (silme, geri yükleme)
     - Thumbnail servisi genişletildi (PDF, ofis dokümanları, video)
     - Geçici dosya temizleme mekanizması eklendi
   
   - **LLM-Assistant-Service**:
     - Komut sistemi iyileştirildi

3. **Altyapı**:
   - MongoDB bağlantı yönetimi optimize edildi

## Son Yapılan Değişiklikler

### Thumbnail Servisi İyileştirmeleri

1. **Desteklenen Dosya Türleri**:
   - PDF dosyaları için pdf-poppler ile thumbnail oluşturma
   - Office dokümanları (Word, Excel, PowerPoint vb.) için LibreOffice ile thumbnail
   - Video dosyaları için FFmpeg ile thumbnail
   - Diğer dosya türleri için dosya uzantısına göre jenerik thumbnail

2. **Bağımlılıklar**:
   - pdf-poppler: PDF işlemleri için
   - ffmpeg: Video işlemleri için
   - libreoffice-headless: Office dokümanları için
   - sharp: Görüntü işleme için

3. **Temporary Dosya Yönetimi**:
   - `/tmp/aicloud-thumbnails` klasöründe geçici dosyalar oluşturuluyor
   - Bir saat'ten eski geçici dosyalar otomatik temizleniyor

### Folder Servisi İyileştirmeleri

1. **Klasör İşlemleri**:
   - Klasör oluşturma, silme, geri yükleme
   - Klasör hiyerarşisi yönetimi
   - Çöp kutusu işlemleri

## VM Kurulumu için Gerekli Adımlar

VM üzerinde aşağıdaki komutları çalıştırarak gerekli bağımlılıkları yükleyin:

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg poppler-utils libreoffice-headless
cd /path/to/backend/storage-service
npm install
```

## Önemli Notlar

1. Proje Docker container'ları yerine doğrudan VM üzerinde çalıştırılıyor.
2. Thumbnail oluşturma için VM üzerinde ffmpeg, poppler-utils ve libreoffice-headless kurulu olmalı.
3. MongoDB bağlantısı için gerekli konfigürasyon app.module.ts dosyasında mevcut.
4. File uploads ve storage için Minio/S3 compatible storage kullanılıyor.
5. VM terminali ile ilgili komutlar lokal ortama yazılıp size iletiliyor, siz komutları VM'de çalıştırıyorsunuz.

## Gelecek Planları

1. Thumbnail servisi için daha fazla dosya türü desteği eklenebilir.
2. Dosya önizleme ve klasör yönetimi için frontend geliştirmeleri yapılacak.
3. AI model entegrasyonları genişletilebilir.
