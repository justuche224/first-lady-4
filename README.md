**A Next.js healthcare management system built with modern web technologies.**

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- PostgreSQL database

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/justuche224/first-lady-4.git
cd first-lady-4
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
BETTER_AUTH_SECRET=your-random-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAILER_EMAIL=your-email@example.com
MAILER_PASSWORD=your-email-password-or-app-password
```

**Environment Variables Explained:**

- `DATABASE_URL`: PostgreSQL connection string for your database
- `BETTER_AUTH_SECRET`: A random secret key for Better Auth (generate using `openssl rand -base64 32` or any secure random string generator)
- `BETTER_AUTH_URL`: The base URL for Better Auth (usually your app URL)
- `NEXT_PUBLIC_APP_URL`: The public URL of your application
- `MAILER_EMAIL`: Email address for Nodemailer (sender email)
- `MAILER_PASSWORD`: Password or app-specific password for the email account

### 4. Database Setup

Run database migrations to set up the schema:

```bash
bun run db:push
```

Or if you prefer to generate and run migrations:

```bash
bun run db:generate
bun run db:migrate
```

### 5. Start the Development Server

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `bun run dev` - Start the development server
- `bun run build` - Build the application for production
- `bun run start` - Start the production server
- `bun run lint` - Run ESLint
- `bun run db:push` - Push schema changes to the database
- `bun run db:studio` - Open Drizzle Studio (database GUI)
- `bun run db:generate` - Generate migration files
- `bun run db:migrate` - Run database migrations

## Tech Stack

- **Framework**: Next.js 16
- **Runtime**: Bun
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **UI**: Radix UI, Tailwind CSS, shadcn/ui
- **Email**: Nodemailer
- **Forms**: React Hook Form with Zod validation

## Project Structure

- `/db` - Database schema and migrations
- `/app` - Next.js app directory
- `/components` - React components
- `/lib` - Utility functions and configurations

## Database Schema

The application includes the following main entities:

- Users (with roles: admin, doctor, receptionist)
- Patients
- Doctors
- Departments
- Appointments
- Medical Records
- Prescriptions
