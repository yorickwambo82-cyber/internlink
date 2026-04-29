# Admin Dashboard Components - Work Record

## Task: Create 6 Admin Dashboard Components for InternLink Portal

### Completed Files

1. **`/src/components/admin/AdminDashboard.tsx`**
   - Welcome message with admin name
   - 6 StatCards: Total Students, Total Companies, Active Offers, Total Applications, Pending Companies, Completion Rate
   - Recharts BarChart for Applications by Status
   - Recharts PieChart for Status Distribution with legend
   - Recent Activity Feed (last 5 audit logs with emoji indicators)
   - Quick Actions: Manage Users, Approve Companies, View Analytics
   - Fetches: GET /api/admin/stats, GET /api/admin/audit-logs?limit=5
   - Framer Motion stagger entrance animation
   - Loading skeletons, empty states

2. **`/src/components/admin/ManageUsers.tsx`**
   - Search bar with name/email filtering
   - Role filter dropdown (All, Student, Company, Supervisor, Admin)
   - Table with columns: Name (avatar+name), Email, Role (color badge), Status (Active/Paused), Verified (icon), Joined (relative time), Actions
   - Actions: Activate/Suspend (with AlertDialog confirmation), Verify, Delete (with AlertDialog confirmation)
   - Pagination with page info and prev/next
   - User detail dialog on eye click
   - Fetches: GET /api/admin/users (with query params), PUT /api/admin/users

3. **`/src/components/admin/ManageCompanies.tsx`**
   - Tabs: All, Pending Approval, Verified (with badge counts)
   - Company cards with: Company name, verified badge, email, industry, city, registration number, created date, offer/supervisor/review counts
   - Actions per card: View Details (dialog), Approve (AlertDialog), Reject (AlertDialog)
   - Company detail dialog with full info and approve/reject buttons
   - Fetches: GET /api/admin/companies (with status param), PUT /api/admin/companies

4. **`/src/components/admin/ManageCategories.tsx`**
   - Category grid (3 columns on lg) with name, icon/emoji, description, offer count
   - Active/Inactive visual state with toggle button
   - Add Category button → Dialog with name, description, icon fields
   - Edit button per category → same dialog pre-filled
   - Delete with AlertDialog (warns about associated offers)
   - Toggle active/inactive per category
   - Fetches: GET /api/admin/categories, POST/PUT/DELETE /api/admin/categories

5. **`/src/components/admin/AuditLogs.tsx`**
   - Table with: Timestamp (date+time), User (name+role), Action (color-coded badge), Entity (name+truncated ID), Details
   - Filter by action type dropdown
   - Refresh button
   - Pagination with page info
   - Fetches: GET /api/admin/audit-logs (with action and page params)

6. **`/src/components/admin/EditGuide.tsx`**
   - Ordered list of guide sections with drag handle visual, order badge, up/down reordering
   - Active/Inactive toggle per section
   - Add Section button → Dialog with title, content (textarea), order (number)
   - Edit button → same dialog pre-filled
   - Delete with AlertDialog confirmation
   - Optimistic updates for reorder and toggle operations
   - Fetches: GET /api/guide, POST /api/guide (for create/update/toggle)

### Technical Details
- All components start with `'use client'`
- Use shared components: StatCard, StatusBadge, EmptyState, AnimatedCard
- Use shadcn/ui components: Card, Button, Input, Label, Textarea, Select, Tabs, Dialog, AlertDialog, Badge, Separator, Table, Switch, Skeleton
- Use Recharts for charts (BarChart, PieChart)
- Use Framer Motion for stagger entrance animations
- Use sonner for toast notifications
- All API calls include Authorization header with Bearer token
- Responsive design (mobile-first with responsive grid breakpoints)
- Loading states with Skeleton components
- Error handling with toast notifications
- Lint passes cleanly
