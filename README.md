# 🧊 Icecube Multi-Cloud Data Platform

A comprehensive multi-cloud data platform for ETL pipelines, data sources, notebooks, and analytics.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Default Login (Offline Mode):**
- Email: `admin@icecube.com`
- Password: `admin123`

Open browser at `http://localhost:5173`

## 📚 Documentation

- **[START_HERE.md](./START_HERE.md)** - Complete setup guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[WHITE_SCREEN_FIX.md](./WHITE_SCREEN_FIX.md)** - White screen issue resolution

## ✨ Features

### 🔧 IGO ETL (Interactive Graphical Operations)
- **Visual Workflow Builder** - Drag-and-drop ETL pipeline creation
- **Form Builder** - Guided form-based ETL setup
- **Node Configuration** - Configure data sources with multiple auth methods
- **Dynamic Canvas** - Resizable workflow area with fullscreen mode
- **Code Generation** - Auto-generate ETL code from visual workflows

### 📊 Data Sources
- Support for 15+ data source types
- S3, PostgreSQL, MySQL, MongoDB, Snowflake, BigQuery, etc.
- Multiple authentication methods (Access Keys, IAM Roles)
- Save and reuse configurations
- Test connections before saving

### 💻 Interactive Notebooks
- Multi-language support (SQL, Python, R, Scala)
- Execute queries in real-time
- Save and share notebooks
- Code syntax highlighting

### 🔍 Query Editor
- SQL query execution
- Data catalog browser
- Save frequently used queries
- Query history

### ☁️ Cloud Management
- AWS, Azure, GCP integration
- Compute cluster provisioning
- Resource monitoring
- Cost tracking

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State:** React Context API
- **Database:** Supabase (PostgreSQL)
- **Backend:** Python FastAPI (optional)
- **Visual Workflows:** React Flow
- **Code Editor:** Monaco Editor

## 📦 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Jobs/              # ETL pipeline components
│   │   │   ├── ETLPipelineCreator.tsx
│   │   │   ├── VisualETLCanvas.tsx
│   │   │   ├── NodeConfigModal.tsx
│   │   │   └── IGOETLTabEnhanced.tsx
│   │   ├── DataSources/       # Data source management
│   │   ├── Notebooks/         # Interactive notebooks
│   │   ├── Query/             # Query editor
│   │   └── CloudProfiles/     # Cloud management
│   ├── contexts/              # React contexts
│   │   ├── RDSAuthContext.tsx # Authentication
│   │   └── ThemeContext.tsx   # Theme management
│   ├── lib/                   # Utilities and API clients
│   │   ├── auth.ts           # Unified auth
│   │   ├── rdsApi.ts         # Backend API
│   │   └── supabase.ts       # Supabase client
│   └── App.tsx               # Main application
├── backend/                   # Python backend (optional)
├── supabase/                 # Database migrations
└── public/                   # Static assets
```

## 🔐 Authentication

The application supports dual authentication:

### 1. Dummy Offline Mode (Default)
- **Email:** admin@icecube.com
- **Password:** admin123
- Works without backend
- Perfect for development and testing

### 2. RDS Backend Authentication
- Real user accounts
- Requires backend running at `http://localhost:8000`
- Full feature access

## 💾 Data Persistence

- **Supabase:** Primary database for all persistent data
- **LocalStorage:** Auth tokens and session data
- **Graceful Degradation:** App works offline if Supabase unavailable

## 🎨 Key Features Implemented

### Enhanced UX
- ✅ Expandable description textarea with character counter
- ✅ Dynamic canvas height controls (400px - 1200px)
- ✅ Fullscreen mode for visual workflows
- ✅ Double-click nodes to configure
- ✅ Node configuration modal with multiple tabs
- ✅ Integration with saved data sources

### Node Configuration
- ✅ S3 with Access Keys or IAM Role ARN
- ✅ Database connections (PostgreSQL, MySQL, MongoDB)
- ✅ Select from pre-configured data sources
- ✅ Create new configurations on-the-fly
- ✅ Real-time validation

### Authentication
- ✅ Offline mode with dummy admin account
- ✅ RDS backend authentication support
- ✅ Automatic fallback handling
- ✅ Safe localStorage access
- ✅ Error boundary with user-friendly messages

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Python 3.9+ for backend

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd icecube_ui_bolt
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment** (already set up)
```bash
# .env file is pre-configured with:
# - Supabase connection
# - Backend API URL
# - AWS credentials (if needed)
```

4. **Start development server**
```bash
npm run dev
```

5. **Login**
- Use: admin@icecube.com / admin123
- Or start backend for real authentication

### With Backend (Optional)

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📝 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run typecheck   # TypeScript type checking
```

## 🐛 Troubleshooting

### White Screen?
See [WHITE_SCREEN_FIX.md](./WHITE_SCREEN_FIX.md) for detailed resolution steps.

**Quick fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Use incognito/private window
3. Check browser console (F12)
4. Try dummy admin login

### Backend Connection Issues?
The app works **offline** - backend is optional!

### Port Already in Use?
```bash
npx kill-port 5173
npm run dev -- --port 3000
```

## 🔧 Configuration

### Environment Variables
See `.env` file for configuration:
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Backend Configuration
See `backend/.env` for backend settings:
- Database connection strings
- JWT secret keys
- AWS credentials

## 🌟 Recent Enhancements

### v2.0 - Enhanced ETL UX (Latest)
- ✅ Node configuration modal with data source integration
- ✅ Multiple S3 authentication methods
- ✅ Saved data sources selector
- ✅ Expandable description field
- ✅ Dynamic canvas height controls
- ✅ Fullscreen workflow mode
- ✅ Fixed authentication issues
- ✅ Safe localStorage handling
- ✅ Better error messages

### v1.0 - Core Features
- ETL visual workflow builder
- Data source management
- Interactive notebooks
- Query editor
- Cloud profile management

## 📖 Usage Examples

### Create ETL Pipeline
1. Navigate to IGO ETL tab
2. Click "Create New Pipeline"
3. Choose Visual Workflow or Form Builder
4. Add nodes from palette
5. Double-click nodes to configure
6. Connect nodes to create workflow
7. Save pipeline

### Configure Data Source
1. Go to Data Sources tab
2. Click "Add Data Source"
3. Select source type (S3, PostgreSQL, etc.)
4. Choose authentication method
5. Enter credentials
6. Test connection
7. Save

### Run Notebook
1. Navigate to Notebooks tab
2. Create new notebook
3. Select language (SQL, Python, R, Scala)
4. Write code in cells
5. Execute cells
6. View results

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React Flow for visual workflow components
- Monaco Editor for code editing
- Supabase for backend infrastructure
- Tailwind CSS for styling
- Vite for build tooling

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Open an issue on GitHub
3. Check browser console for error details

---

Built with ❤️ using React, TypeScript, and Supabase
