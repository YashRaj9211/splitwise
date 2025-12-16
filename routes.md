# Application Routes

The following routes have been implemented in the Next.js App Router structure.

## Protected Routes

These routes live under `src/app/(protected)/` and share the main sidebar/navbar layout.

| Route                  | File Path                                      | Description                                                                        |
| :--------------------- | :--------------------------------------------- | :--------------------------------------------------------------------------------- |
| **`/dashboard`**       | `src/app/(protected)/dashboard/page.tsx`       | **Dashboard**: Overview of user balances (You owe / Owed) and recent activity.     |
| **`/expenses`**        | `src/app/(protected)/expenses/page.tsx`        | **All Expenses**: List of all expenses involving the user.                         |
| **`/expenses/create`** | `src/app/(protected)/expenses/create/page.tsx` | **Create Expense**: Form to add a new personal or split expense.                   |
| **`/groups`**          | `src/app/(protected)/groups/page.tsx`          | **Groups List**: Gallery of groups the user belongs to.                            |
| **`/groups/create`**   | `src/app/(protected)/groups/create/page.tsx`   | **Create Group**: Form to start a new group.                                       |
| **`/groups/[id]`**     | `src/app/(protected)/groups/[id]/page.tsx`     | **Group Details**: View group members, total balance, and group-specific expenses. |
| **`/friends`**         | `src/app/(protected)/friends/page.tsx`         | **Friends List**: List of active friends and pending friend requests.              |
| **`/friends/add`**     | `src/app/(protected)/friends/add/page.tsx`     | **Add Friend**: Form/Search to invite new friends.                                 |

## Components

Reused UI components found in `src/components/`.

- **Layout**: `Sidebar`, `TopBar`
- **UI**: `Button`, `Card`, `Input`
- **Feature**: `ExpenseItem` (Used in global list and group detail)

## Data Actions

Server actions integrated:

- `getUserExpenses` (New)
- `getUserGroups` (New)
- `getGroupExpenses` (Existing)
- `getFriends` (New)
