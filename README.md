# 🩸 St. Takla Blood Donation Management System

> A professional-grade medical platform engineered to streamline life-saving blood donation workflows, donor tracking, and community outreach.

---

## 🏛️ System Architecture & Logic

The platform is built on a **Session-Based Donation Logic**. Instead of just tracking dates, the system organizes clinical operations into distinct sessions (e.g., Session 1: Jan-Jun | Session 2: Jul-Dec) to match seasonal medical cycles. This allows administrators to track retention and ensure donors adhere to healthy donation intervals.

### 🔐 The Authority Matrix (Roles)

The system operates on a strictly enforced Role-Based Access Control (RBAC) hierarchy to ensure data privacy and operational security:

| Role | Badge | Access Level | Responsibilities |
| :--- | :--- | :--- | :--- |
| **User** | `0` | **Observer** | Search donors, view profiles, and check donation status. |
| **Super User** | `1` | **Staff** | Register new donors, record session attendance, and manage registrations. |
| **Admin** | `2` | **Command** | Full CRUD, user management, WhatsApp outreach, and data exports. |

---

## 📱 Core Modules

### 👤 Donor Intelligence (The Medical Dashboard)
Every donor has a "Living Profile"—a comprehensive medical identity that tracks:
- **Biological Data**: Blood Type, Age (auto-calculated), and masked National ID.
- **Geographic Intel**: Organized by Alexandria's districts for localized outreach.
- **Chronological History**: Every donation session is logged with automated session detection.

### 🩸 Rapid Donation Recording
Engineered for speed during busy donation days.
- **Smart Detection**: Automatically identifies the current Year and Session.
- **One-Click Log**: Records presence in the system with zero data-entry friction for staff.
- **Conflict Prevention**: Built-in logic prevents duplicate donations in the same session.

### 💬 WhatsApp Outreach Engine
Integrated with the **Meta Business API** for large-scale donor mobilization.
- **Filtered Broadcasts**: Send messages based on Blood Type, Session History, or Year.
- **Medical Reminders**: Automated outreach to donors eligible for the next session.
- **Real-time Logging**: Track every sent and failed message with detailed error reporting.

---

## 🛡️ Clinical Integrity & Privacy

### 🔒 Privacy by Design
- **SSN Masking**: Sensitive National IDs are masked (`••••••••••••`) for non-administrative users, ensuring that only high-level personnel can access primary identity documents.
- **Role-Gated Endpoints**: Server-side validation ensures that even if the UI is bypassed, unauthorized data modification is impossible.

### 📉 Data Sanitization
- **Strict Validations**: The system prevents invalid phone formats, duplicate National IDs, and illogical birthdates, maintaining a "Clean Database" policy crucial for medical records.
- **Session Constraints**: Logic-based locks ensure a donor cannot be recorded twice in the same half-year session, adhering to medical safety standards.

---

## 🗺️ Page Mapping

### 🏢 Administrative Command Center
- **Dashboard**: High-level analytics (Donation counts, Active Donors, User activity).
- **Recent Donors Quick View**: A focused list of the latest registrants with one-click profile access.
- **User Management**: The "Control Tower" where Admins activate/deactivate staff and change permissions.

### 🔍 Donor Management Suite
- **Global Search**: Advanced fuzzy-search across names, IDs, and phone numbers.
- **District Filters**: Sort and manage donors by their specific residential districts for mobile clinic planning.
- **Export Center**: Generate professional Excel reports for offline analysis and auditing.

### 👥 Staff Workspace (Super User)
- **Registration Hub**: Optimized forms for registering new donors on-site.
- **Check-in Logic**: Fast search-and-record workflow for returning donors.

---

## 🚀 Future Roadmap (Vision)

The St. Takla system is designed for continuous evolution:
- **📊 Advanced Analytics**: Predictive modeling to forecast blood stock levels based on historical session attendance.
- **🏥 Multi-Church Integration**: Scaling the platform to support multiple branches or churches with centralized data.
- **📲 Donor Mobile Portal**: A personal app for donors to track their own history, Hb levels, and next eligibility date.
- **📍 Mobile Clinic Mapping**: Heatmaps of donor density to decide the best locations for mobile donation trucks.

---

## 🎨 Design Philosophy
The system follows a **Premium Medical Aesthetic**:
- **Modern Typography**: Using clean, readable fonts for clinical clarity.
- **Vibrant Hierarchy**: Red accents for critical blood-related data, Green for success, and Amber for warnings.
- **Interactive UI**: Fluid transitions powered by Framer Motion to reduce cognitive load on staff.

---

> [!IMPORTANT]
> This system handles sensitive PII (Personally Identifiable Information). Data encryption and secure API routes are enforced at the server level to protect donor confidentiality.

> [!TIP]
> Use the **District Intelligence** in the All Donors page to organize transport or outreach for donors in specific areas like "Sidi Gaber" or "Smouha" during emergencies.