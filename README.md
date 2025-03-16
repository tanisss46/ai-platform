# AICloud Platform

AICloud, kullanıcıların çeşitli AI modellerini ve araçlarını tek bir platform üzerinden kullanabilecekleri, oluşturdukları içerikleri bulut tabanlı bir depolama sistemiyle yönetebilecekleri ve AI asistan ile iş akışlarını otomatikleştirebilecekleri entegre bir ekosistemdir.

## Proje Yapısı

```
ai-platform/
├── backend/
│   ├── api-gateway/        # API Gateway ve servis yönlendirme
│   ├── user-service/       # Kullanıcı yönetimi ve kimlik doğrulama
│   ├── storage-service/    # Depolama ve dosya yönetimi
│   ├── ai-orchestration/   # AI modelleri orkestrasyon (planlanan)
│   └── llm-assistant/      # LLM asistan (planlanan)
├── frontend/               # React/NextJS ile kullanıcı arayüzü
├── k8s/                    # Kubernetes yapılandırmaları
└── docker-compose.yml      # Geliştirme için Docker Compose
```

## Tamamlanan Özellikler

### Altyapı ve Temel Hizmetler
- ✅ API Gateway yapılandırması
- ✅ Kullanıcı yönetimi ve kimlik doğrulama servisi
- ✅ İki faktörlü kimlik doğrulama (2FA)
- ✅ Depolama servisi (S3/MinIO uyumlu)
- ✅ Dosya ve klasör yönetimi
- ✅ Thumbnail oluşturma servisi
- ✅ Docker konteyner yapılandırmaları
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Kubernetes yapılandırması

### Güvenlik Özellikleri
- ✅ JWT tabanlı token sistemi
- ✅ Rate limiting mekanizması 
- ✅ Güvenli dosya yükleme validasyonu
- ✅ Paylaşım ve izin kontrolü

## Planlanan Özellikler

### Kısa Vadeli (1-2 Hafta)
- Frontend geliştirmesi
  - Dashboard tasarımı
  - Finder benzeri dosya gezgini
  - Kullanıcı profil yönetimi
- Dosya paylaşım özelliklerinin genişletilmesi
- MinIO ve MongoDB için yönetim arayüzleri
- Detaylı kullanım raporları ve analitikler

### Orta Vadeli (3-4 Hafta)
- İlk AI entegrasyonları
  - Stable Diffusion API adaptörü
  - Midjourney API bağlantısı
  - ElevenLabs ses API entegrasyonu
- AI Orchestration hizmeti
  - İş kuyruğu ve zamanlanmış görevler
  - Model parametresi yönetimi
  - Asenkron işlem takibi
- LLM Asistan entegrasyonu
  - Doğal dil komutu ayrıştırma
  - AI araçları için orkestrasyon

### Uzun Vadeli (2-3 Ay)
- Gelişmiş AI model entegrasyonları
  - Video oluşturma (RunwayML, Kling AI)
  - 3D model oluşturma
  - Çok modlu LLM'ler (GPT-4V, Claude Opus)
- Ekip işbirliği özellikleri
  - Proje yönetimi ve iş akışları
  - Gerçek zamanlı işbirliği
  - Yorum ve geribildirim sistemleri
- Marketplace ve SDK
  - 3. parti geliştiriciler için API'ler
  - AI aracı mağazası
  - İş akışı şablonları

## Geliştirme Ortamı Kurulumu

### Gereksinimler
- Docker ve Docker Compose
- Node.js 18+
- Git

### Başlatma

1. Repo'yu klonlayın
```bash
git clone https://github.com/yourusername/ai-platform.git
cd ai-platform
```

2. .env dosyasını oluşturun
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve gerekli değişkenleri ayarlayın
```

3. Docker Compose ile başlatın
```bash
docker-compose up -d
```

4. Tarayıcınızda açın: http://localhost:80

### Kubernetes Kurulumu

```bash
# Namespace oluştur
kubectl apply -f k8s/namespace.yaml

# Gerekli konfigurasyon ve sırlarını ekle (gerçek ortamda güvenli şekilde yapılandırın)
kubectl apply -f k8s/config/

# Servisleri başlat
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/storage-service.yaml
kubectl apply -f k8s/frontend.yaml

# Ingress yapılandırmasını uygula
kubectl apply -f k8s/ingress.yaml
```

## Mimari Detaylar

Bu proje aşağıdaki prensiplere göre tasarlanmıştır:

- **Mikroservis Mimarisi**: Her servis kendi sorumluluk alanına sahiptir
- **API Gateway Örüntüsü**: Tüm dış istekler API Gateway üzerinden yönlendirilir
- **Event-Driven**: Asenkron iletişim için event'ler kullanılır
- **Infrastructure as Code**: Tüm altyapı kodu ile tanımlanır
- **DevOps**: CI/CD pipeline ile sürekli entegrasyon ve dağıtım

## Katkıda Bulunma

1. Repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.
