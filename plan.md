# Kanban Board MVP Implementation Plan (NestJS Backend + Next.js Frontend)

This plan outlines the architecture, database schema, and step-by-step implementation for the Kanban Board MVP. The system utilizes a **NestJS** backend for business logic and data persistence via **Prisma** to a **PostgreSQL** database, and a **Next.js** frontend for the user interface.

---

## 1. Goal Description

Build a high-performance, internal, database-backed project management tool (inspired by Jira/Trello) with a decoupled architecture:
1. **Backend**: NestJS API + Prisma + PostgreSQL (Neon). Handles authentication verification via Clerk, drag-and-drop column/task reordering, comments, activity logging, and search/filtering.
2. **Frontend**: Next.js App Router. Focuses strictly on UI, layout, state management (Redux Toolkit & React Query), and drag-and-drop interface (`dnd-kit`), making API requests to the NestJS backend.

This plan details the backend architecture, Prisma database schema, API design, security, and integration path with the frontend.

---

## 2. User Review Required

Please review the following design decisions and assumptions:

> [!IMPORTANT]
> **Authentication Guard & Lazy Sync**
> We will verify Clerk JWT session tokens on the NestJS backend using `@clerk/backend`. To make local development seamless, we implement a **Lazy Upsert** in the Auth Guard: if an authenticated request's `clerkId` does not exist in our database, NestJS fetches user profile details from the Clerk API and inserts the user record, enrolling them in the default workspace.

> [!WARNING]
> **Floating Point Task Reordering**
> We store `position` as a `Float`. Moving a task recalculates its position as the midpoint between the task's new neighbors. If the gap becomes extremely narrow (e.g., `< 0.0001`), the column tasks are automatically re-spaced (`1000.0, 2000.0, ...`) to prevent floating-point precision loss.

> [!NOTE]
> **Atlassian Design System Styling**
> We will configure Tailwind CSS v4 in the frontend using Atlassian's design tokens (CSS variables) to match their look-and-feel. We'll use Atlassian standard backgrounds (`#FAFBFC`, `#F4F5F7`), brand blue (`#0052CC`), secondary text (`#5E6C84`), system typography, and rounded corners (`3px` for buttons/inputs, `4px` for cards) to emulate the Jira/Trello experience.

---

## 3. Open Questions

1. **Workspace Syncing**: Should the seed script pre-generate a workspace with a fixed ID/Slug (e.g. `default-workspace`) so the frontend and backend are automatically aligned? *(Recommendation: Yes, we seed a single workspace on database initialization).*
2. **User Roles**: The MVP includes `ADMIN` and `MEMBER` roles. Should we enforce role permissions on the API (e.g., only Admin can archive projects) or keep the MVP access flat? *(Recommendation: Keep access flat for all authenticated members for now, but save the roles in the database for future enhancement).*

---

## 4. Proposed Changes

We will introduce a `backend/` directory alongside the existing `frontend/` directory in the repository workspace.

```
cadence/
 ├── frontend/               # Existing Next.js frontend
 ├── backend/                # [NEW] NestJS Backend
 │    ├── src/
 │    │    ├── main.ts
 │    │    ├── app.module.ts
 │    │    ├── prisma/       # Prisma service and module
 │    │    ├── auth/         # Clerk token validation guard
 │    │    ├── workspaces/   # Workspace & membership
 │    │    ├── projects/     # Project management
 │    │    ├── boards/       # Boards & columns
 │    │    ├── tasks/        # Task CRUD, comments, activity
 │    │    ├── labels/       # Labels management
 │    │    └── dashboard/    # Metrics & dashboard stats
 │    ├── prisma/
 │    │    ├── schema.prisma # Prisma Schema
 │    │    └── seed.ts       # Demo/seed script
 │    ├── tsconfig.json
 │    ├── package.json
 │    └── .env
 └── plan.md                 # [NEW] This plan file
```

---

### 4.1 Database Schema (`backend/prisma/schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum MemberRole {
  ADMIN
  MEMBER
}

enum ProjectCategory {
  CLIENT
  INTERNAL
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ActivityType {
  TASK_CREATED
  TASK_UPDATED
  TASK_MOVED
  ASSIGNEE_CHANGED
  PRIORITY_CHANGED
  DUE_DATE_CHANGED
  LABEL_CHANGED
  COMMENT_ADDED
  TASK_ARCHIVED
}

model User {
  id               String            @id @default(uuid())
  clerkId          String            @unique
  email            String            @unique
  name             String?
  imageUrl         String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  memberships      WorkspaceMember[]
  createdProjects  Project[]         @relation("ProjectCreator")
  assignedTasks    Task[]            @relation("TaskAssignee")
  createdTasks     Task[]            @relation("TaskCreator")
  comments         Comment[]
  actorActivities  ActivityLog[]     @relation("ActivityActor")
}

model Workspace {
  id          String            @id @default(uuid())
  name        String
  slug        String            @unique
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  members     WorkspaceMember[]
  projects    Project[]
  labels      Label[]
}

model WorkspaceMember {
  id          String     @id @default(uuid())
  workspaceId String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        MemberRole @default(MEMBER)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([workspaceId, userId])
}

model Project {
  id          String          @id @default(uuid())
  workspaceId String
  workspace   Workspace       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  description String?
  category    ProjectCategory @default(INTERNAL)
  createdById String
  creator     User            @relation("ProjectCreator", fields: [createdById], references: [id])
  archivedAt  DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  board       Board?
  activities  ActivityLog[]
}

model Board {
  id        String        @id @default(uuid())
  projectId String        @unique
  project   Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name      String
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  columns   BoardColumn[]
}

model BoardColumn {
  id        String   @id @default(uuid())
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  name      String
  position  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
}

model Task {
  id            String       @id @default(uuid())
  projectId     String
  boardColumnId String
  column        BoardColumn  @relation(fields: [boardColumnId], references: [id], onDelete: Cascade)
  title         String
  description   String?
  assigneeId    String?
  assignee      User?        @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  createdById   String
  creator       User         @relation("TaskCreator", fields: [createdById], references: [id])
  priority      Priority     @default(MEDIUM)
  dueDate       DateTime?
  position      Float
  archivedAt    DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  labels        TaskLabel[]
  comments      Comment[]
  activities    ActivityLog[]

  @@index([boardColumnId])
  @@index([assigneeId])
  @@index([projectId])
}

model Label {
  id          String      @id @default(uuid())
  workspaceId String
  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  name        String
  color       String
  tasks       TaskLabel[]

  @@unique([workspaceId, name])
}

model TaskLabel {
  taskId  String
  task    Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  labelId String
  label   Label  @relation(fields: [labelId], references: [id], onDelete: Cascade)

  @@id([taskId, labelId])
}

model Comment {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  body      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ActivityLog {
  id          String       @id @default(uuid())
  taskId      String?
  task        Task?        @relation(fields: [taskId], references: [id], onDelete: SetNull)
  projectId   String?
  project     Project?     @relation(fields: [projectId], references: [id], onDelete: SetNull)
  actorId     String
  actor       User         @relation("ActivityActor", fields: [actorId], references: [id], onDelete: Cascade)
  type        ActivityType
  meta        Json?
  createdAt   DateTime     @default(now())
}
```

---

### 4.2 Auth Strategy (`backend/src/auth/`)

An `AuthGuard` extracts the session token from the `Authorization` header and decodes it using the Clerk SDK.

```typescript
// backend/src/auth/jwt.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';

@CanActivate()
export class AuthGuard implements CanActivate {
  private clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.split(' ')[1];
    try {
      // 1. Verify token with Clerk
      const verified = await this.clerkClient.verifyToken(token);
      const clerkId = verified.sub;

      // 2. Fetch or Upsert user in our database (Lazy Sync)
      let user = await this.prisma.user.findUnique({
        where: { clerkId },
        include: { memberships: true },
      });

      if (!user) {
        const clerkUser = await this.clerkClient.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
        const imageUrl = clerkUser.imageUrl;

        // Ensure default workspace exists
        let workspace = await this.prisma.workspace.findFirst();
        if (!workspace) {
          workspace = await this.prisma.workspace.create({
            data: { name: 'Seeded Workspace', slug: 'seeded-workspace' },
          });
        }

        user = await this.prisma.user.create({
          data: {
            clerkId,
            email,
            name,
            imageUrl,
            memberships: {
              create: {
                workspaceId: workspace.id,
                role: 'ADMIN',
              },
            },
          },
          include: { memberships: true },
        });
      }

      // Attach user object to request
      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

---

### 4.3 Task Move API (`PATCH /api/tasks/:id/move`)

Handles moving a task to a different column or updating its relative position.

```typescript
// Request Body DTO
export class MoveTaskDto {
  boardColumnId: string;
  prevTaskId?: string; // Null if placed at the absolute top
  nextTaskId?: string; // Null if placed at the absolute bottom
}
```

#### Midpoint calculation logic in NestJS Service:
```typescript
async moveTask(taskId: string, dto: MoveTaskDto) {
  const { boardColumnId, prevTaskId, nextTaskId } = dto;

  let newPosition: number;

  if (!prevTaskId && !nextTaskId) {
    // 1. Empty column
    newPosition = 1000.0;
  } else if (!prevTaskId && nextTaskId) {
    // 2. Top of column
    const nextTask = await this.prisma.task.findUnique({ where: { id: nextTaskId } });
    newPosition = nextTask.position / 2.0;
  } else if (prevTaskId && !nextTaskId) {
    // 3. Bottom of column
    const prevTask = await this.prisma.task.findUnique({ where: { id: prevTaskId } });
    newPosition = prevTask.position + 1000.0;
  } else {
    // 4. In between two tasks
    const [prevTask, nextTask] = await Promise.all([
      this.prisma.task.findUnique({ where: { id: prevTaskId } }),
      this.prisma.task.findUnique({ where: { id: nextTaskId } }),
    ]);
    newPosition = (prevTask.position + nextTask.position) / 2.0;
  }

  // 5. Update position & column
  const updatedTask = await this.prisma.task.update({
    where: { id: taskId },
    data: { boardColumnId, position: newPosition },
  });

  // 6. Self-healing normalization check
  const gap = 0.0001;
  const needNormalization = await this.checkIfNormalizationNeeded(boardColumnId, gap);
  if (needNormalization) {
    await this.normalizeColumnPositions(boardColumnId);
  }

  return updatedTask;
}
```

---

### 4.4 API Endpoints Map

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/webhooks/clerk` | `POST` | Webhook Secret | Clerk user synchronization (Alternative to Lazy Upsert) |
| `/api/users/me` | `GET` | Yes | Get currently authenticated user profile |
| `/api/users` | `GET` | Yes | Get list of all users in the workspace (for assignee selection) |
| `/api/projects` | `GET` | Yes | Get list of all non-archived projects |
| `/api/projects` | `POST` | Yes | Create a new project (Auto-creates empty board + default columns) |
| `/api/projects/:id` | `PATCH` | Yes | Update project fields or archive |
| `/api/projects/:projectId/board`| `GET` | Yes | Get board structure with columns and sorted tasks |
| `/api/tasks` | `POST` | Yes | Create a task (Appends to column, position = max + 1000) |
| `/api/tasks/:id` | `PATCH` | Yes | Update task details (title, description, priority, assignee, etc.) |
| `/api/tasks/:id/move` | `PATCH` | Yes | Drag-and-drop reorder task |
| `/api/tasks/:id` | `DELETE` | Yes | Archive task |
| `/api/tasks/:taskId/comments` | `GET` | Yes | Fetch task comments |
| `/api/tasks/:taskId/comments` | `POST` | Yes | Create a comment |
| `/api/comments/:id` | `DELETE` | Yes | Delete a comment (Author only) |
| `/api/tasks/:taskId/activity` | `GET` | Yes | Fetch activity logs for a task |
| `/api/dashboard/metrics` | `GET` | Yes | Get dashboard statistics |
| `/api/tasks/my` | `GET` | Yes | Get tasks assigned to the current user |

---

## 5. Atlassian Design System Integration

We will style the application's user interface to align with the core visual language of the **Atlassian Design System (Jira / Trello)**:

### 5.1 Design Tokens (Tailwind v4 Configuration)

We map Atlassian Design Tokens to CSS variables inside `frontend/app/globals.css`:

```css
:root {
  /* Atlassian Color Palette (Light Mode) */
  --ds-background-default: #FFFFFF;
  --ds-background-neutral: #F4F5F7;
  --ds-background-neutral-hovered: #EBECF0;
  --ds-background-neutral-subtle: #FAFBFC;
  --ds-background-brand-bold: #0052CC;
  --ds-background-brand-bold-hovered: #0747A6;
  
  --ds-text: #172B4D;          /* Charcoal Primary */
  --ds-text-subtle: #5E6C84;   /* Cool Gray Secondary */
  --ds-text-brand: #0052CC;    /* Atlassian Blue */
  --ds-border: #DFE1E6;        /* Light Gray Border */
  
  /* Status / Priority Badges */
  --ds-priority-highest: #DE350B; /* Red-Orange */
  --ds-priority-high: #FF5630;
  --ds-priority-medium: #FFAB00; /* Yellow */
  --ds-priority-low: #36B37E;    /* Green */
  --ds-priority-lowest: #0065FF;  /* Blue */

  /* Border Radii */
  --radius-button: 3px;
  --radius-card: 4px;
}

@theme {
  --color-bg-app: var(--ds-background-neutral-subtle);
  --color-bg-card: var(--ds-background-default);
  --color-bg-column: var(--ds-background-neutral);
  --color-bg-column-hover: var(--ds-background-neutral-hovered);
  
  --color-brand: var(--ds-background-brand-bold);
  --color-brand-hover: var(--ds-background-brand-bold-hovered);
  
  --color-text-main: var(--ds-text);
  --color-text-muted: var(--ds-text-subtle);
  --color-border-main: var(--ds-border);
  
  /* Atlassian Font Stack */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
```

### 5.2 Layout Architecture

1. **Sidebar Navigation**:
   - Left-anchored navigation using `#0747A6` / Atlassian Blue or `#F4F5F7` based on active context.
   - Collapsible layout containing: Logo, Project Selector, Dashboard Link, My Tasks Link, and quick access to projects list.
2. **Topbar Header**:
   - Clean breadcrumbs (e.g. `Projects / Phoenix / Kanban Board`).
   - Quick Search bar input matching Atlassian input styles (borderless until focused, border highlight on focus).
   - Avatar stacks showing workspace members with absolute boundary counts.
3. **Kanban Board Layout**:
   - Column layout (`#F4F5F7` column backgrounds) with column headers displaying status names and card count badges.
   - Issue/Task Cards: Solid white background (`#FFFFFF`), slim gray borders (`#DFE1E6`), elevation shadow. Bottom details: Assignee avatar on the right, Priority icon indicator (Atlassian style arrow icons) on the left, Category badge.
4. **Sliding Task Drawer**:
   - Right-side slide-over drawer (`#FFFFFF` background).
   - Title input matching inline text-editing behavior.
   - Description rich text editor.
   - Secondary fields column mapping Status, Assignee, Priority, Labels, and Due Date cleanly with dropdowns.
   - Comment inputs with full user avatar layouts and timestamped activity logs.

---

## 6. Verification Plan

### Automated Tests
1. **Backend Integration / E2E Tests**:
   - Verify JWT parsing with mock Clerk payload.
   - Verify Project CRUD flow and automatic column seeding.
   - Verify task midpoint ordering logic, edge cases (top, bottom, empty column), and normalization triggers.
2. **Frontend E2E (Playwright)**:
   - Perform drag-and-drop movement, and check if task reordering is persisted on browser refresh.
   - Test search, filter parameters, task creation, and comment logs.

### Manual Verification
1. Run `npm run dev` on both `frontend` and `backend`.
2. Access Swagger UI at `http://localhost:3000/api/docs` (if enabled) to interact with endpoint parameters.
3. Access the Next.js local environment (`http://localhost:3001`), register/log-in via Clerk, and verify visual alignment with Atlassian guidelines.

---
