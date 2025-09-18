# Grok Super Heavy - Code Analysis Prompts

## 🎯 Prompt Templates for Different Analysis Types

### 1. **Immediate Bug Fix Prompt**
```
As an expert React/Next.js developer, analyze this GLP-1 medication tracking app for critical bugs:

CONTEXT: This is a healthcare PWA for GLP-1 users with Firebase backend, handling sensitive health data.

CURRENT ISSUES:
- Firestore errors: "Unsupported field value: undefined" 
- Async race conditions in injection tracking
- Type errors: "can't access property 'medication', t is undefined"

CODEBASE FOCUS: 
- src/services/firestoreInjectionService.ts
- src/components/injection-tracker/
- src/services/adaptiveAnalyticsService.ts

REQUIREMENTS:
1. Identify root causes of undefined field errors
2. Fix async/await patterns causing race conditions  
3. Add proper null/undefined checks
4. Ensure data integrity for health records
5. Maintain backward compatibility

CONSTRAINTS:
- Must work with Next.js 15 + React 19
- Firebase Firestore with security rules
- User data cannot be lost
- Mobile-first responsive design
```

### 2. **Architecture Review Prompt**
```
As a senior software architect, review this healthcare app's architecture for scalability and maintainability:

PROJECT: GLP-1 Nutrition Sidekick - PWA for medication users
TECH STACK: Next.js 15, React 19, TypeScript, Firebase, Tailwind CSS

ANALYZE:
1. **Data Flow Architecture**
   - localStorage → Firestore migration strategy
   - Real-time sync patterns
   - Offline-first capabilities

2. **Service Layer Design**  
   - API abstraction patterns
   - Error handling consistency
   - Cross-service communication

3. **Component Architecture**
   - State management patterns
   - Prop drilling vs context usage
   - Component composition

4. **Performance Patterns**
   - Bundle optimization opportunities
   - React rendering optimization
   - Database query efficiency

PROVIDE:
- Architectural improvement recommendations
- Code organization suggestions  
- Performance optimization strategies
- Scalability considerations for healthcare data
```

### 3. **Security Audit Prompt**
```
As a healthcare application security expert, audit this GLP-1 medication tracking app:

SENSITIVITY: Handles personal health information (PHI) including:
- Medication dosages and schedules
- Injection sites and timing
- Symptom tracking data
- Personal health profiles

SECURITY FOCUS AREAS:
1. **Data Protection**
   - Firebase security rules validation
   - Client-side data exposure
   - API endpoint security

2. **Authentication & Authorization**
   - User session management
   - Data access controls
   - Cross-user data isolation

3. **Data Transmission**
   - API call security
   - Local storage handling
   - Migration data integrity

4. **Compliance Considerations**
   - HIPAA compliance gaps
   - Data retention policies
   - User consent management

DELIVERABLES:
- Security vulnerability assessment
- Compliance recommendations
- Data protection improvements
- Privacy-by-design suggestions
```

### 4. **Performance Optimization Prompt**
```
As a React performance specialist, optimize this healthcare PWA for production:

APP PROFILE:
- Target: Mobile-first healthcare users
- Critical: Fast injection logging 
- Context: Potentially slow network conditions
- Requirement: Offline-capable PWA

PERFORMANCE GOALS:
- <2s initial load time
- <100ms interaction response
- Smooth animations on mobile
- Reliable offline functionality

ANALYZE:
1. **Bundle Analysis**
   - Code splitting opportunities
   - Tree shaking effectiveness
   - Dependency optimization

2. **Runtime Performance**  
   - React re-render patterns
   - Memory usage optimization
   - Async operation efficiency

3. **Loading Strategies**
   - Critical path optimization
   - Progressive loading
   - Service worker caching

4. **Database Performance**
   - Firestore query optimization
   - Data fetching patterns
   - Real-time subscription efficiency

PROVIDE:
- Specific performance improvements
- Measurable optimization targets
- Implementation priority ranking
```

### 5. **Code Quality & Maintainability Prompt**
```
As a TypeScript/React code quality expert, improve this healthcare app's maintainability:

QUALITY GOALS:
- Reduce technical debt
- Improve developer experience  
- Enhance code readability
- Strengthen type safety

REVIEW AREAS:
1. **TypeScript Usage**
   - Type definition completeness
   - Generic type optimization
   - Interface design patterns
   - Error type handling

2. **React Patterns**
   - Hook usage optimization
   - Component composition
   - State management clarity
   - Effect dependency management

3. **Code Organization**
   - File/folder structure
   - Import/export patterns
   - Service abstraction
   - Utility function design

4. **Error Handling**
   - Consistent error patterns
   - User-friendly error messages
   - Logging and debugging
   - Recovery strategies

DELIVERABLES:
- Refactoring recommendations
- Type system improvements
- Code organization suggestions
- Best practices implementation
```

### 6. **Feature Enhancement Prompt**
```
As a product-focused full-stack developer, suggest feature improvements for this GLP-1 medication app:

USER CONTEXT:
- Primary: GLP-1 medication users (Ozempic, Mounjaro, etc.)
- Needs: Injection tracking, meal planning, symptom monitoring
- Challenges: Medication side effects, dietary changes, compliance

CURRENT FEATURES:
- AI-powered meal generation
- Injection site tracking
- Symptom correlation analysis
- PWA with offline support

ENHANCEMENT AREAS:
1. **User Experience**
   - Onboarding flow optimization
   - Accessibility improvements
   - Mobile interaction patterns

2. **AI/ML Capabilities**
   - Smarter meal recommendations
   - Predictive health insights
   - Personalized coaching

3. **Data Visualization**  
   - Health trend analytics
   - Progress tracking dashboards
   - Export capabilities

4. **Integration Opportunities**
   - Healthcare provider portals
   - Wearable device sync
   - Pharmacy integrations

PROVIDE:
- Feature prioritization matrix
- Implementation complexity assessment
- User impact analysis
- Technical feasibility review
```

## 🚀 How to Use These Prompts with Grok

### Step 1: Package Your Code
```bash
# Create a focused code package
tar -czf glp1-codebase.tar.gz \
  src/ \
  firestore.rules \
  package.json \
  CLAUDE.md \
  GROK_CODEBASE_ANALYSIS.md \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git
```

### Step 2: Context Setting
Start each Grok conversation with:
```
I'm sharing my Next.js healthcare app codebase for analysis. First read GROK_CODEBASE_ANALYSIS.md for full context, then apply the following prompt:

[Insert specific prompt from above]
```

### Step 3: Iterative Analysis
After initial analysis, follow up with:
```
Based on your analysis, prioritize the top 3 most critical issues and provide:
1. Specific code changes with file paths
2. Implementation steps in order
3. Testing strategies for each fix
4. Potential side effects to monitor
```

### Step 4: Implementation Validation
Before implementing suggestions:
```
Before I implement these changes, please:
1. Double-check compatibility with Next.js 15 + React 19
2. Verify Firebase Firestore best practices
3. Confirm no breaking changes for existing users
4. Suggest rollback strategies if needed
```

## 💡 Pro Tips for Grok Collaboration

1. **Be Specific**: Always include exact file paths and line numbers
2. **Provide Context**: Include error messages and user impact
3. **Set Constraints**: Mention technical limitations and requirements  
4. **Ask for Alternatives**: Request multiple solution approaches
5. **Validate Assumptions**: Have Grok explain reasoning for major changes