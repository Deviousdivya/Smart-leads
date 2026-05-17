# SmartLeads - Modern CRM & Lead Management

SmartLeads is a professional, full-stack lead management system designed for sales teams to capture, track, and analyze business opportunities in real-time.

## 🚀 Key Features

- **Lead Management**: Full CRUD operations for leads with detailed tracking of status, source, and contact info.
- **Real-time Analytics**: Visual performance dashboards using Recharts to track conversion rates and lead sources.
- **Secure Authentication**: JWT-based authentication system with secure cookie storage.
- **Team Collaboration**: Integrated team status viewer to see which colleagues are online.
- **Modern UI/UX**: 
  - Fully responsive design (Mobile & Desktop).
  - Dark Mode support with system preference detection.
  - Collapsible sidebar for maximum workspace efficiency.
  - Staggered animations and smooth transitions.
- **Advanced Filtering**: Search, sort, and filter leads by status, source, or date.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **TypeScript**
- **Tailwind CSS** (Styling)
- **Shadcn UI** (Component Library)
- **Lucide React** (Icons)
- **TanStack Query** (Data Fetching)
- **React Hook Form** + **Zod** (Form Validation)
- **Recharts** (Data Visualization)
- **Sonner** (Toast Notifications)

### Backend
- **Node.js** + **Express**
- **TypeScript** (compiled via esbuild)
- **JSON Database** (for demo persistence)
- **JWT** (Authentication)

## 📦 Project Structure

```text
├── src/
│   ├── components/       # Reusable UI components
│   │   └── ui/          # Shadcn base components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (API, cn helper)
│   ├── pages/            # Page-level components
│   ├── types/            # TypeScript interfaces
│   └── App.tsx           # Main application routing
├── server/
│   ├── middleware/      # Auth & error middlewares
│   ├── routes/           # API endpoints
│   └── db/              # Data persistence logic
├── server.ts             # Express server entry point
└── README.md             # Project documentation
```

## 🚦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 🔐 Security Information

- Secrets and tokens are managed via `.env` variables (see `.env.example`).
- Cookies are configured with `HttpOnly`, `Secure`, and `SameSite: None` for cross-origin security in development environments.
- API keys must always be kept server-side.

---
Built with ❤️ using Google AI Studio Build.
