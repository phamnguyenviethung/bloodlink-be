# 🩸 BloodLink Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/MikroORM-FF6B6B?style=for-the-badge&logo=mikro-orm&logoColor=white" alt="MikroORM" />
</p>

## 📖 Mô tả dự án

**BloodLink** là một hệ thống quản lý ngân hàng máu thông minh, kết nối người hiến máu, bệnh viện và các trung tâm y tế nhằm tối ưu hóa quy trình hiến máu và cấp phát máu cứu người. Hệ thống được xây dựng trên nền tảng NestJS với TypeScript, sử dụng PostgreSQL làm cơ sở dữ liệu và MikroORM để quản lý dữ liệu.

### 🎯 Tính năng chính

- **Quản lý tài khoản**: Hỗ trợ đa vai trò (Admin, Staff, Hospital, User)
- **Quản lý thông tin máu**: Theo dõi nhóm máu, thành phần máu, kho máu
- **Quản lý hiến máu**: Đăng ký, theo dõi lịch sử hiến máu
- **Yêu cầu cấp cứu**: Xử lý các yêu cầu máu khẩn cấp từ bệnh viện
- **Quản lý kho máu**: Theo dõi tồn kho, hạn sử dụng
- **Hệ thống blog**: Chia sẻ thông tin, kiến thức về hiến máu
- **Gửi email tự động**: Thông báo, nhắc nhở người dùng
- **Quản lý địa điểm**: Các điểm hiến máu, bệnh viện

### 👨‍💻 Đội ngũ phát triển

- **Phạm Nguyễn Việt Hưng** (Team Leader & Backend Developer)
- **Phúc Hòa** (Backend Developer)

## 🏗️ Kiến trúc hệ thống

### 🧩 Modules chính

#### 1. **Account Module** (`src/modules/account/`)

- Quản lý tài khoản người dùng với 4 vai trò:
  - **Admin**: Quản trị viên hệ thống
  - **Staff**: Nhân viên trung tâm hiến máu
  - **Hospital**: Tài khoản bệnh viện
  - **User**: Người hiến máu
- Controllers: `AdminController`, `StaffController`, `HospitalController`, `CustomerController`

#### 2. **Auth Module** (`src/modules/auth/`)

- Xác thực và phân quyền sử dụng Clerk
- Strategies: `ClerkStrategy`, `ClerkAdminStrategy`, `AuthenticatedStrategy`
- Hỗ trợ JWT tokens và Webhook

#### 3. **Blood Info Module** (`src/modules/blood-info/`)

- Quản lý thông tin về máu:
  - Nhóm máu (ABO, Rh)
  - Thành phần máu (Whole Blood, Plasma, Platelets, Red Cells)
  - Thông tin chi tiết về từng loại máu

#### 4. **Donation Module** (`src/modules/donation/`)

- Quản lý quy trình hiến máu:
  - Đăng ký hiến máu
  - Lịch sử hiến máu
  - Theo dõi tình trạng sức khỏe
  - Thống kê hiến máu

#### 5. **Emergency Request Module** (`src/modules/emergency-request/`)

- Xử lý yêu cầu máu cấp cứu:
  - Tạo yêu cầu cấp cứu từ bệnh viện
  - Phân bổ máu tự động
  - Theo dõi trạng thái yêu cầu
  - Thông báo khẩn cấp

#### 6. **Inventory Module** (`src/modules/inventory/`)

- Quản lý kho máu:
  - Theo dõi tồn kho theo nhóm máu
  - Quản lý hạn sử dụng
  - Cảnh báo thiếu hụt
  - Báo cáo kho

#### 7. **Blog Module** (`src/modules/blog/`)

- Hệ thống blog để chia sẻ thông tin:
  - Bài viết về hiến máu
  - Tin tức y tế
  - Câu chuyện hiến máu
  - Kiến thức sức khỏe

#### 8. **Email Module** (`src/modules/email/`)

- Gửi email tự động:
  - Xác nhận đăng ký
  - Nhắc nhở hiến máu
  - Thông báo cấp cứu
  - Newsletter

#### 9. **Location Module** (`src/modules/location/`)

- Quản lý địa điểm:
  - Trung tâm hiến máu
  - Bệnh viện
  - Điểm hiến máu lưu động

### 🗄️ Database Entities

- **Account**: Thông tin tài khoản người dùng
- **Blood**: Thông tin nhóm máu và thành phần
- **Campaign**: Chiến dịch hiến máu
- **EmergencyRequest**: Yêu cầu máu cấp cứu
- **Inventory**: Kho máu
- **Blog**: Bài viết blog

### 🔧 Công nghệ sử dụng

- **Framework**: NestJS v10
- **Language**: TypeScript v5.8
- **Database**: PostgreSQL
- **ORM**: MikroORM v6
- **Authentication**: Clerk
- **Queue**: BullMQ
- **Email**: Nodemailer
- **Payment**: PayOS
- **Documentation**: Swagger
- **Logging**: Winston
- **Validation**: Zod + Joi
- **Template Engine**: Pug

## 🚀 Cài đặt và Chạy dự án

### 📋 Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL >= 13
- PNPM (khuyến nghị) hoặc NPM

### ⚙️ Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd bloodlink-be
```

2. **Cài đặt dependencies**

3. **Cài đặt dependencies**

```bash
pnpm install
```

3. **Cấu hình môi trường**

Tạo file `.env` từ `.env.example` và cấu hình các biến môi trường:

```bash
# Server Configuration
NODE_ENV=development
PORT=5678

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bloodlink_db

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_CUSTOM_JWT_SECRET=your_jwt_secret
CLERK_WEBHOOK_SIGNING_SECRET=your_webhook_secret

# Clerk Admin
CLERK_ADMIN_SECRET_KEY=your_admin_secret_key
CLERK_ADMIN_PUBLISHABLE_KEY=your_admin_publishable_key
CLERK_ADMIN_CUSTOM_JWT_SECRET=your_admin_jwt_secret
CLERK_ADMIN_WEBHOOK_SIGNING_SECRET=your_admin_webhook_secret

# Redis (for Queue)
REDIS_URL=redis://localhost:6379

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# PayOS Payment
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Other
NGROK_URL=your_ngrok_url_for_development
```

4. **Thiết lập Database**

```bash
# Chạy migrations
pnpm run db:up

# Seed dữ liệu mẫu (tùy chọn)
pnpm run db:seed
```

### 🏃‍♂️ Chạy ứng dụng

```bash
# Development mode với auto-reload
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

Server sẽ chạy tại: `http://localhost:5678`

### 📚 API Documentation

Sau khi khởi động server, bạn có thể truy cập Swagger documentation tại:

- **Development**: `http://localhost:5678/api/docs`
- **Production**: `https://your-domain.com/api/docs`

### 🔧 Scripts hữu ích

```bash
# Phát triển
pnpm run start:dev          # Chạy với watch mode
pnpm run format             # Format code với Prettier
pnpm run lint               # Lint code với ESLint

# Database
pnpm run db:create          # Tạo migration mới
pnpm run db:up              # Chạy migrations
pnpm run db:seed            # Seed dữ liệu

# Testing
pnpm run test               # Unit tests
pnpm run test:e2e           # End-to-end tests
pnpm run test:cov           # Test coverage

# Build
pnpm run build              # Build cho production
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 📁 Cấu trúc thư mục

```
src/
├── configs/                 # Cấu hình hệ thống
│   ├── apiDocs.config.ts   # Cấu hình Swagger
│   └── winston.config.ts    # Cấu hình logging
├── database/               # Database layer
│   ├── entities/           # Database entities
│   ├── migrations/         # Database migrations
│   └── seeders/           # Data seeders
├── generated/             # Generated files
├── i18n/                  # Internationalization
├── modules/               # Business modules
│   ├── account/           # Quản lý tài khoản
│   ├── auth/             # Xác thực & phân quyền
│   ├── blog/             # Hệ thống blog
│   ├── blood-info/       # Thông tin máu
│   ├── donation/         # Quản lý hiến máu
│   ├── email/            # Gửi email
│   ├── emergency-request/ # Yêu cầu cấp cứu
│   ├── inventory/        # Quản lý kho
│   └── location/         # Quản lý địa điểm
├── share/                # Shared utilities
│   ├── decorators/       # Custom decorators
│   ├── dtos/            # Data transfer objects
│   ├── filters/         # Exception filters
│   ├── guards/          # Route guards
│   ├── interceptors/    # Request/Response interceptors
│   ├── pipes/           # Validation pipes
│   └── providers/       # Custom providers
└── templates/           # Email templates
```

## 🔄 Workflow phát triển

### Git Flow

- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature branches
- `hotfix/*`: Hotfix branches

### Commit Convention

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Examples:
- feat(auth): add JWT refresh token
- fix(inventory): resolve blood unit calculation
- docs(readme): update installation guide
```

### Code Review Process

1. Tạo Pull Request từ feature branch
2. Code review bởi team members
3. Merge sau khi approve
4. Deploy tự động (CI/CD)

## 🌐 Deployment

### Environment Variables cho Production

Đảm bảo cấu hình đầy đủ các biến môi trường production trong file `.env.production`

### Docker Deployment

```bash
# Build image
docker build -t bloodlink-api .

# Run container
docker run -p 5678:5678 --env-file .env.production bloodlink-api
```

### Health Check

- API Health: `GET /health`
- Database Health: `GET /health/db`

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

Dự án này thuộc bản quyền của đội ngũ phát triển BloodLink.

## 📞 Liên hệ

- **Phạm Nguyễn Việt Hưng** - Team Leader & Backend Developer
- **Phúc Hòa** - Backend Developer

---

<p align="center">
  <b>🩸 BloodLink - Kết nối sự sống, lan tỏa yêu thương 🩸</b>
</p>
