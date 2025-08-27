# SplitSave Backend Infrastructure Architecture

## Technology Stack

### Core Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with Helmet, CORS, rate limiting
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Caching**: Redis for sessions and real-time data
- **Authentication**: JWT with refresh tokens + bcrypt password hashing

### Real-time Communication
- **WebSockets**: Socket.io for partner synchronization
- **Message Queue**: Redis pub/sub for scaling WebSocket connections
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Infrastructure
- **Hosting**: AWS/Digital Ocean with Docker containers
- **CDN**: CloudFlare for static assets and DDoS protection
- **Monitoring**: New Relic or DataDog for performance monitoring
- **Logging**: Winston with structured JSON logs

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  country_code VARCHAR(2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  income DECIMAL(12,2),
  payday VARCHAR(20),
  personal_allowance DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Partnerships table (couples connection)
CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, paused
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Shared expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  added_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active', -- active, archived, pending_approval
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Savings goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  saved_amount DECIMAL(12,2) DEFAULT 0,
  goal_type VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 1,
  added_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Approval requests
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES users(id),
  request_type VARCHAR(50) NOT NULL, -- expense_add, expense_edit, goal_add, goal_edit
  request_data JSONB NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, declined
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages between partners
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  message_text TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, system, notification
  read_by_recipient BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Monthly contributions tracking
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- YYYY-MM-01 format
  user1_amount DECIMAL(12,2) DEFAULT 0,
  user2_amount DECIMAL(12,2) DEFAULT 0,
  user1_paid BOOLEAN DEFAULT false,
  user2_paid BOOLEAN DEFAULT false,
  user1_paid_date TIMESTAMP,
  user2_paid_date TIMESTAMP,
  total_required DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partnership_id, month)
);

-- Refresh tokens for authentication
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints Structure

### Authentication
```
POST /api/auth/register
POST /api/auth/login  
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### User Management
```
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/account
PUT    /api/users/update-income
```

### Partnership Management
```
POST   /api/partnerships/invite        # Send partner invitation
GET    /api/partnerships/invitations   # Get pending invitations
POST   /api/partnerships/accept/:id    # Accept partnership
DELETE /api/partnerships/decline/:id   # Decline partnership
GET    /api/partnerships/current       # Get current partnership
PUT    /api/partnerships/status        # Pause/resume partnership
```

### Expenses
```
GET    /api/expenses                   # Get all shared expenses
POST   /api/expenses                   # Add new expense (may require approval)
PUT    /api/expenses/:id              # Update expense (may require approval)
DELETE /api/expenses/:id              # Delete expense
GET    /api/expenses/split-calculation # Get current split calculation
```

### Goals  
```
GET    /api/goals                      # Get all goals
POST   /api/goals                      # Add goal (may require approval)  
PUT    /api/goals/:id                 # Update goal
DELETE /api/goals/:id                 # Delete goal
PUT    /api/goals/:id/contribution    # Log contribution to goal
```

### Approvals
```
GET    /api/approvals                 # Get pending approvals
POST   /api/approvals/:id/approve     # Approve request
POST   /api/approvals/:id/decline     # Decline request
```

### Messages
```
GET    /api/messages                  # Get message history
POST   /api/messages                  # Send message
PUT    /api/messages/:id/read         # Mark message as read
```

### Contributions
```
GET    /api/contributions             # Get contribution history
POST   /api/contributions/mark-paid   # Mark monthly contribution as paid
GET    /api/contributions/current     # Get current month status
```

## Authentication & Security

### JWT Token Strategy
- **Access Token**: Short-lived (15 minutes), contains user ID and partnership ID
- **Refresh Token**: Long-lived (30 days), stored securely in database
- **Token Rotation**: New refresh token issued on each refresh
- **Blacklisting**: Invalidate tokens on logout/password change

### Security Measures
```javascript
// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Input validation with Joi
const expenseSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  amount: Joi.number().positive().precision(2).required(),
  category: Joi.string().valid(...validCategories).required(),
  frequency: Joi.string().valid('monthly', 'weekly', 'yearly').required()
});

// SQL injection prevention with parameterized queries
const getExpenses = async (partnershipId) => {
  return await db.expense.findMany({
    where: { partnership_id: partnershipId, status: 'active' },
    orderBy: { created_at: 'desc' }
  });
};
```

## Real-time Synchronization

### WebSocket Event Structure
```javascript
// Partner connection events
socket.emit('partner:online', { partnerId, timestamp });
socket.emit('partner:offline', { partnerId, lastSeen });

// Data synchronization events  
socket.emit('expense:added', { expense, addedBy });
socket.emit('expense:updated', { expenseId, changes, updatedBy });
socket.emit('expense:deleted', { expenseId, deletedBy });

// Goal synchronization
socket.emit('goal:added', { goal, addedBy });
socket.emit('goal:progress', { goalId, newAmount, updatedBy });

// Approval events
socket.emit('approval:requested', { request, requestedBy });
socket.emit('approval:responded', { requestId, approved, respondedBy });

// Messages
socket.emit('message:new', { message, sender });
socket.emit('message:read', { messageId, readBy });
```

### Connection Management
```javascript
// Partner room management
socket.on('join_partnership', (partnershipId) => {
  socket.join(`partnership_${partnershipId}`);
  socket.to(`partnership_${partnershipId}`).emit('partner:online', {
    partnerId: socket.userId,
    timestamp: new Date()
  });
});

// Offline detection
socket.on('disconnect', () => {
  socket.to(`partnership_${socket.partnershipId}`).emit('partner:offline', {
    partnerId: socket.userId,
    lastSeen: new Date()
  });
});
```

## Data Validation & Business Logic

### Expense Split Calculation
```javascript
const calculateSplit = async (partnershipId) => {
  const partnership = await getPartnershipWithUsers(partnershipId);
  const expenses = await getActiveExpenses(partnershipId);
  
  const totalIncome = partnership.user1.income + partnership.user2.income;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const user1Ratio = partnership.user1.income / totalIncome;
  const user2Ratio = partnership.user2.income / totalIncome;
  
  return {
    user1Amount: Math.round(totalExpenses * user1Ratio * 100) / 100,
    user2Amount: Math.round(totalExpenses * user2Ratio * 100) / 100,
    user1Ratio: Math.round(user1Ratio * 100),
    user2Ratio: Math.round(user2Ratio * 100),
    totalExpenses
  };
};
```

### Approval Workflow
```javascript
const requiresApproval = (action, userId, partnershipId) => {
  // Expenses over $100 require approval
  if (action.type === 'expense' && action.amount > 100) return true;
  
  // All goals require approval
  if (action.type === 'goal') return true;
  
  // Changes to existing items require approval
  if (action.type.includes('edit')) return true;
  
  return false;
};
```

## Deployment Architecture

### Production Environment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: splitsave-api:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/splitsave
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: splitsave
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/splitsave_prod
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secure-random-string-256-bits
JWT_REFRESH_SECRET=different-super-secure-random-string
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
CORS_ORIGIN=https://splitsave.com
```

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. Set up PostgreSQL database with basic schema
2. Implement user authentication (register/login/JWT)  
3. Basic CRUD operations for expenses and goals
4. Deploy to staging environment

### Phase 2: Partnership Features (Week 3-4)
1. Partnership invitation system
2. Data sharing between partners
3. Basic approval workflow
4. Deploy partnership features to staging

### Phase 3: Real-time Features (Week 5-6)
1. WebSocket implementation for live updates
2. Message system between partners
3. Push notifications for mobile
4. Load testing and optimization

### Phase 4: Production Deployment (Week 7-8)
1. Production environment setup
2. Database migration from demo data
3. Performance monitoring implementation
4. Security audit and penetration testing

This backend architecture provides a solid foundation for scaling SplitSave from a demo to a production-ready collaborative finance platform that real couples can use to manage their shared financial life.