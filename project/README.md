# Public Officials Management Platform

A comprehensive platform for managing public officials, their roles, equipment inventory, and work status tracking.

## Key Features

- Authentication system with role-based permissions
- Official profiles with personal information and professional details
- Role management for different systems (MUISCA, SIAT, Dynamics, etc.)
- Inventory tracking system for assigned equipment
- Automatic event generation based on employment status
- Interactive data tables with filtering and export capabilities
- Dashboard with key metrics visualization

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **State Management**: Zustand
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the `.env.example` file to `.env` and fill in your Supabase credentials
4. Connect to Supabase via the "Connect to Supabase" button in the StackBlitz interface
5. Run the development server:
   ```
   npm run dev
   ```

## Database Schema

The application uses the following tables:
- `users`: Store user information with role permissions
- `officials`: Store public officials information
- `systems`: Store available systems (MUISCA, SIAT, etc.)
- `official_roles`: Many-to-many relationship between officials and systems
- `inventory`: Store inventory items assigned to officials
- `official_events`: Store scheduled events for officials

## Features

1. **User Authentication**
   - Email/password login
   - Role-based permissions (User, Admin, Superuser)

2. **Officials Management**
   - Create, read, update, and delete officials
   - Track personal and professional information
   - Manage employment status

3. **Role Management**
   - Assign systems access to officials
   - Track when roles were granted

4. **Inventory Management**
   - Track items assigned to officials
   - Manage item descriptions, codes, and values

5. **Event Tracking**
   - Automatic generation of follow-up events
   - Track evaluations and performance reviews
   - Status-based event scheduling

## License

This project is licensed under the MIT License.