# Blood Donations Management System

A comprehensive web application for managing blood donation records in Alexandria, Egypt.

## Features

### Role-Based Access
- **User (0)**: Read-only access to search and view donor profiles
- **Super User (1)**: Can add donors and record donations
- **Admin (2)**: Full system control including user management and WhatsApp messaging

### Core Features
- 🔍 Advanced donor search with filters
- 📊 Excel export for historical data
- 💬 WhatsApp Business API integration
- 📱 Offline data collection with auto-sync
- 🎨 Modern UI with animations
- 🔐 JWT-based authentication (4-hour session)

## Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Libraries**: bcryptjs, jsonwebtoken, xlsx, dexie

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install