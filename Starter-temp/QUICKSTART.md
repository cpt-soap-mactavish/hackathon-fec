# 🚀 Quick Start - StockMaster

## For Your Teammates

Share this with your team for a quick setup!

---

## ⚡ 5-Minute Setup

### 1️⃣ Install PostgreSQL
- Download: https://www.postgresql.org/download/
- Create database: `stockmaster`

### 2️⃣ Clone & Install
```bash
git clone <repo-url>
cd <project-folder>
npm install
```

### 3️⃣ Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/stockmaster?schema=public"
```

### 4️⃣ Setup Database
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5️⃣ Run the App
```bash
npm run dev
```

**Login**: http://localhost:3000
- **Username**: `AdminUser`
- **Password**: `Admin@123`

---

## 🔧 Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npx prisma studio` | View database in browser |
| `npx prisma db seed` | Reset seed data |
| `npx prisma migrate dev` | Run new migrations |

---

## 📁 What's Included

✅ Authentication (Login/Register)  
✅ OTP Password Reset  
✅ Dashboard with Stats  
✅ PostgreSQL Database  
✅ Seeded Admin User & Sample Data  

---

## 🆘 Common Issues

**Database connection error?**
→ Check PostgreSQL is running & credentials in `.env`

**Migration fails?**
→ Delete `prisma/migrations` folder, run `npx prisma migrate dev --name init`

**Can't login?**
→ Run `npx prisma db seed` to create admin user

---

## 📚 Full Guide
See [TEAM_SETUP.md](./TEAM_SETUP.md) for detailed instructions.
