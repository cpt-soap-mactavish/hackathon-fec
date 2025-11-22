# Inventory Management Dashboard

## Project Overview
This repository contains a web application built with Next.js and Tailwind CSS that provides a dashboard for managing inventory operations. It displays real‑time statistics such as total products, stock levels, low‑stock alerts, pending receipts, and pending deliveries. The UI follows a professional card design with icons and gradient typography.

## Features
- Authentication with NextAuth
- Real‑time dashboard statistics fetched from `/api/dashboard/stats`
- Professional operation cards for Receipts and Deliveries with large, gradient numbers
- Recent transactions list with type‑based colour tags
- Export button for data download (placeholder implementation)

## Getting Started
### Prerequisites
- Node.js (v20 or later)
- npm (v10 or later)
- A running PostgreSQL or MongoDB instance (the app currently uses MongoDB for data storage)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Starter-temp

# Install dependencies
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

## API Endpoints
- `GET /api/dashboard/stats` – Returns a JSON object with aggregated statistics and recent transactions.
- Additional CRUD routes exist under `/api/receipts`, `/api/deliveries`, and `/api/transfers`.

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes and push to your fork.
4. Open a pull request describing the changes.

## License
This project is licensed under the MIT License.
