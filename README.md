# Splitwise Clone

A modern, full-stack expense sharing application built with Next.js 15, Prisma, and Tailwind CSS. This application allows users to manage groups, track shared expenses, and simplify debts among friends.

## 🚀 Features

- **User Authentication**: Secure login and registration.
- **Dashboard**: Overview of total expenditure, amount lent, and amount borrowed.
- **Group Management**: Create groups, add members, and manage group settings.
- **Expense Tracking**:
  - Add expenses with multiple split options (Equal, Exact, Percentage, Shares).
  - Support for personal expenses.
  - visualize expense breakdown.
- **Debt Simplification**: Algorithm to minimize the number of transactions required to settle up.
- **Settlements**: Record payments and settle debts between users.
- **Activity Log**: Track changes and updates within groups.
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (v5)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd splitwise
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add the following variables:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/splitwise?schema=public"
    AUTH_SECRET="your-auth-secret"
    ```

4.  **Database Setup**
    Push the Prisma schema to your database:

    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npm run lint`: Runs ESLint.
- **`npm run db:reset`**: **Caution!** resets the database by truncating all tables. Useful for development.

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (Expenses, Groups, Dashboard, etc.).
- `src/actions`: Server actions for data mutation and fetching.
- `src/lib`: Utility functions and configuration (Auth, Utils).
- `prisma`: Database schema and reset scripts.

## 📸 Screenshots

_(Add screenshots of your dashboard, group view, and add expense modal here)_

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
