# StockMaster - Smart Inventory Management System

A robust, secure, and modern Inventory Management System built with **Next.js 15**, **Tailwind CSS**, **PostgreSQL**, and **Prisma**.

![StockMaster Preview](https://via.placeholder.com/800x400?text=StockMaster+Preview)
*(Replace with actual screenshot if available)*

## 🚀 Features

- **Authentication**:
  - 🔐 **Credentials Auth**: Secure Login ID/Password login with BCrypt hashing.
  - 🛡️ **Role-Based Access**: Admin and Staff roles.
  - 🌐 **Session Management**: Protected routes and automatic redirects.
- **Inventory Management**:
  - 📦 **Product Catalog**: Manage products, categories, and SKUs.
  - 🏭 **Multi-Warehouse**: Track stock across multiple locations.
  - 📊 **Stock Operations**: Inbound receipts, outbound deliveries, and transfers.
- **UI/UX**:
  - 🎨 **Modern Design**: Glassmorphism aesthetic with Tailwind CSS & Shadcn UI.
  - 🌓 **Dark Mode**: Fully supported dark/light theme switching.
  - ✨ **Animations**: Smooth page transitions and micro-interactions using Framer Motion.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js v4](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (Local instance)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`).

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env` with your local PostgreSQL credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/stockmaster?schema=public"
```

### 4. Database Setup

Run the following commands to set up the database schema and seed initial data:

```bash
# Run migrations
npx prisma migrate dev

# Seed the database (Admin user, default warehouse, sample products)
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

**Default Admin Credentials:**
- **Login ID**: `AdminUser`
- **Password**: `Admin@123`

## 📦 Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## 📂 Project Structure

```
├── app/                # Next.js App Router pages and API routes
│   ├── api/            # Backend API routes (auth, register, etc.)
│   ├── login/          # Login page
│   ├── register/       # Register page
│   ├── dashboard/      # Main dashboard
│   └── ...
├── components/         # Reusable UI components
├── lib/                # Utility functions (Prisma, Auth)
├── prisma/             # Database schema and seed script
└── public/             # Static assets
```

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
