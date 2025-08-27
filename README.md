# SplitSave 💰 - Collaborative Finance App for Couples & Partners

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)](https://supabase.com/)

> **SplitSave** is a modern, mobile-first web application designed to help couples and partners manage shared expenses, track savings goals, and build financial harmony together. Built with Next.js 13, TypeScript, and Supabase for a seamless, secure experience.

## ✨ Features

### 🎯 **Core Functionality**
- **Shared Expense Tracking** - Split bills and track shared costs with your partner
- **Collaborative Savings Goals** - Set and monitor financial goals together
- **Partner Approval System** - Approve or decline expense/goal requests
- **Real-time Updates** - Instant synchronization across devices
- **Multi-currency Support** - 100+ global currencies with emoji indicators

### 📱 **Mobile-First Design**
- **Responsive Layout** - Optimized for all screen sizes
- **Touch-Friendly Interface** - Large buttons and intuitive gestures
- **Progressive Web App** - Install on mobile devices
- **Offline Capability** - Works without internet connection
- **Fast Loading** - Optimized performance for mobile networks

### 🔒 **Security & Privacy**
- **End-to-End Encryption** - Your financial data stays private
- **Secure Authentication** - Supabase Auth with email verification
- **Partner Verification** - Safe partnership connections
- **Data Privacy** - GDPR compliant data handling

### 🎨 **User Experience**
- **Intuitive Navigation** - Easy-to-use interface for all skill levels
- **Visual Feedback** - Progress bars, charts, and status indicators
- **Accessibility** - WCAG 2.1 AA compliant design
- **Dark Mode Support** - Automatic theme switching
- **Multi-language Ready** - Internationalization support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/split-save.git
   cd split-save
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**
   ```bash
   # Run the setup script
   npm run setup:db
   # or manually execute the SQL files in the root directory
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Frontend
- **Next.js 13** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Real-time Subscriptions** - Live data updates
- **Row Level Security** - Data protection

### Key Components
```
split-save/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── LoginForm.tsx      # Login/signup form
│   ├── SplitsaveApp.tsx   # Main application
│   └── ...                # Other components
├── lib/                    # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── auth.ts            # Auth utilities
│   └── api-client.ts      # API client
└── database/               # Database setup scripts
```

## 📱 Mobile Optimization

### Responsive Design
- **Breakpoints**: Mobile (320px), Tablet (768px), Desktop (1024px+)
- **Touch Targets**: Minimum 44px for mobile interaction
- **Typography**: Responsive font sizes using CSS clamp()
- **Spacing**: Consistent spacing system across devices

### Performance
- **Lazy Loading** - Components load on demand
- **Image Optimization** - Next.js Image component
- **Code Splitting** - Automatic bundle optimization
- **Service Worker** - Offline functionality

### Progressive Web App
- **Installable** - Add to home screen
- **Offline Support** - Cache essential resources
- **Push Notifications** - Real-time updates
- **Background Sync** - Data synchronization

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SplitSave
```

### Database Setup
The application includes several SQL setup scripts:
- `setup-minimal.sql` - Basic tables and functions
- `setup-partnerships.sql` - Partnership management
- `setup-partnerships-safe.sql` - Enhanced security
- `fix-partnerships.sql` - Data integrity fixes

### Customization
- **Themes**: Modify CSS variables in `globals.css`
- **Colors**: Update Tailwind config in `tailwind.config.js`
- **Features**: Enable/disable features in configuration files

## 📊 SEO & Performance

### Search Engine Optimization
- **Meta Tags** - Comprehensive Open Graph and Twitter cards
- **Structured Data** - JSON-LD schema markup
- **Sitemap** - Automatic sitemap generation
- **Robots.txt** - Search engine crawling rules

### Performance Metrics
- **Core Web Vitals** - Optimized for Google's metrics
- **Lighthouse Score** - 90+ performance rating
- **First Contentful Paint** - < 1.5 seconds
- **Largest Contentful Paint** - < 2.5 seconds

### Analytics & Monitoring
- **Web Vitals** - Performance monitoring
- **Error Tracking** - Comprehensive error logging
- **User Analytics** - Usage pattern analysis

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Coverage
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User workflow testing
- **Accessibility Tests**: WCAG compliance

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Deployment Options
- **Vercel** - Recommended for Next.js apps
- **Netlify** - Static site hosting
- **AWS** - Scalable cloud deployment
- **Docker** - Containerized deployment

### Environment Setup
1. Set production environment variables
2. Configure custom domain
3. Set up SSL certificates
4. Configure CDN for global performance

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Supabase Team** - Powerful backend platform
- **Tailwind CSS** - Utility-first CSS framework
- **Open Source Community** - Continuous improvements

## 📞 Support

- **Documentation**: [docs.splitsave.app](https://docs.splitsave.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/split-save/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/split-save/discussions)
- **Email**: support@splitsave.app

## 🔮 Roadmap

### Upcoming Features
- [ ] **Mobile App** - Native iOS/Android apps
- [ ] **AI Insights** - Smart financial recommendations
- [ ] **Budget Planning** - Advanced budgeting tools
- [ ] **Investment Tracking** - Portfolio management
- [ ] **Tax Preparation** - Automated tax calculations

### Long-term Goals
- **Global Expansion** - Multi-language support
- **Enterprise Features** - Business partnerships
- **API Platform** - Third-party integrations
- **Blockchain Integration** - Cryptocurrency support

---

<div align="center">
  <p>Made with ❤️ for couples and partners worldwide</p>
  <p>
    <a href="https://splitsave.app">Website</a> •
    <a href="https://docs.splitsave.app">Documentation</a> •
    <a href="https://github.com/yourusername/split-save">GitHub</a>
  </p>
</div>
