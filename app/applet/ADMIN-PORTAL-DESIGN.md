# ADMIN-PORTAL-DESIGN
## URJAFLUX AI OS

### Purpose
The Admin Portal is restricted to `Super Admin` and `Administrator` roles. It focuses on cross-tenant health, system configuration, and user management.

### Key Screens & Features

#### 1. System Health Dashboard
- **Visuals:** High-density metric cards and timeseries charts.
- **Metrics:** Active jobs, Pipeline success rates, API latency, Memory consumption of worker nodes, Database storage utilized.
- **Actions:** Quick links to restart workers or clear failed queues.

#### 2. User & Tenant Management
- **Visuals:** Enterprise Data Grid.
- **Data:** List of all users, roles, last login, associated projects/tenants.
- **Actions:** Invite User, Reset Password, Modify Role, Suspend Account.

#### 3. AI Expert Configuration
- **Visuals:** List view of available Expert Engines (Vastu, Architecture, etc.).
- **Data:** Version, Status (Active/Inactive), Trigger rules.
- **Actions:** Enable/Disable experts globally, update prompt templates or rule weights.

#### 4. Import / Job Queue Manager
- **Visuals:** Real-time updating table of all background tasks.
- **Data:** Job ID, Type (OCR, Embedding), Progress %, ETA.
- **Actions:** Pause, Resume, Cancel, Force Retry.

#### 5. System Logs
- **Visuals:** Monospaced, dark-themed terminal view.
- **Features:** Real-time tailing, robust search via regex, filter by log level (INFO, WARN, ERROR, FATAL), export to CSV.
