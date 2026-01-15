# 🥤 Mahadav Soda Shop

A production-ready, full-stack e-commerce and inventory management system for a soda/beverage retail shop in Rajkot, Gujarat, India.

## Features

- 📊 **Real-time Dashboard** - Live sales tracking, profit/loss analytics, best-seller products
- 🛒 **Point of Sale (POS)** - Quick checkout with cart management
- 📦 **Inventory Management** - CRUD operations with stock alerts (Admin only)
- 🔐 **Authentication** - Supabase Auth with role-based access (Admin/Staff)
- ⚡ **Real-time Updates** - Supabase Realtime for instant data sync
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router + Recharts
- **Backend**: Django 5 + Django REST Framework
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions

## Quick Start (10 minutes)

### 1. Setup Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the scripts:
   - First run `supabase/schema.sql` (creates tables, RLS policies, triggers)
   - Then run `supabase/seed.sql` (adds sample products and sales data)
4. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - Database connection string (Settings > Database > Connection string > URI)

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env with your Supabase credentials

# Run server
python manage.py runserver
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# Edit .env with your Supabase credentials

# Run dev server
npm run dev
```

### 4. Create Admin User

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Email: `admin@soda.shop`, Password: `admin123`
4. The trigger will automatically create a profile with admin role

### 5. Test the App

1. Open http://localhost:5173
2. Login with `admin@soda.shop` / `admin123`
3. Explore Dashboard, Sales POS, and Inventory pages
4. Make a sale and watch the dashboard update in real-time!

## Environment Variables

### Backend (.env)
```
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api
```

## Docker Deployment

```bash
# Backend
cd backend
docker-compose up -d

# Frontend (build for production)
cd frontend
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

## API Endpoints

### Auth
- `GET /api/auth/profile/` - Get current user profile
- `GET /api/auth/check-admin/` - Check if user is admin

### Inventory (Admin only for write operations)
- `GET /api/inventory/products/` - List products
- `POST /api/inventory/products/` - Create product
- `PUT /api/inventory/products/{id}/` - Update product
- `DELETE /api/inventory/products/{id}/` - Delete product
- `PATCH /api/inventory/products/{id}/stock/` - Adjust stock
- `GET /api/inventory/low-stock/` - Get low stock alerts

### Sales
- `GET /api/sales/` - List sales
- `POST /api/sales/create/` - Create single sale
- `POST /api/sales/bulk/` - Bulk sale (cart checkout)
- `GET /api/sales/dashboard/` - Dashboard statistics
- `GET /api/sales/best-sellers/` - Top selling products
- `GET /api/sales/daily-trend/` - Daily sales trend
- `GET /api/sales/profit-loss/` - Profit/loss by category

## Deployment to Production

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set environment variables
4. Deploy!

### Frontend (Vercel/Netlify)
1. Run `npm run build`
2. Deploy the `dist` folder
3. Set environment variables

### Database (Supabase)
- Already hosted! Just use your project URL

## Project Structure

```
mahadav-soda-shop/
├── backend/
│   ├── soda_shop/          # Django project settings
│   ├── accounts/           # Auth & user management
│   ├── inventory/          # Products CRUD
│   ├── sales/              # Sales & analytics
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand state management
│   │   └── utils/          # API client, Supabase client
│   ├── package.json
│   └── Dockerfile
├── supabase/
│   ├── schema.sql          # Database schema + RLS
│   └── seed.sql            # Sample data
└── README.md
```

## License

MIT

---

Built with ❤️ for Mahadav Soda Shop, Rajkot, Gujarat 🇮🇳
