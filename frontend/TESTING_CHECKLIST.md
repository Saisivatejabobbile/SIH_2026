# VoiceShield Frontend Testing Checklist

## Pre-Testing Setup

### Environment Setup
- [ ] `.env` file created with `VITE_MOCK_MODE=true`
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No console errors on page load

### Browser Requirements
- [ ] Chrome/Edge 79+ OR Firefox 66+ OR Safari 12.1+
- [ ] JavaScript enabled
- [ ] Cookies/LocalStorage enabled
- [ ] Microphone available

---

## 1. Authentication Flow

### Landing Page (`/`)
- [ ] Logo and branding visible
- [ ] Hero section displays correctly
- [ ] 3 feature cards visible
- [ ] "Get Started" button navigates to `/signup`
- [ ] "Sign In" button navigates to `/login`
- [ ] All SVG icons render (no emoji visible)
- [ ] Responsive on mobile/tablet/desktop

### Sign Up Page (`/signup`)
- [ ] Form displays all fields (name, email, password, confirm password)
- [ ] Email validation shows error for invalid format
- [ ] Password validation shows error for weak passwords
- [ ] Confirm password validation shows error if mismatch
- [ ] "Sign Up" button submits form
- [ ] Success: Redirects to dashboard
- [ ] Error: Shows error message
- [ ] "Already have an account?" link navigates to `/login`

### Login Page (`/login`)
- [ ] Email and password fields visible
- [ ] "Remember me" checkbox functional
- [ ] "Sign In" button submits form
- [ ] Success: Redirects to dashboard
- [ ] Error: Shows "Invalid credentials" message
- [ ] "Don't have an account?" link navigates to `/signup`

### Logout
- [ ] Logout button in header opens confirmation modal
- [ ] "Cancel" button closes modal
- [ ] "Logout" button logs out and redirects to landing page
- [ ] Token cleared from localStorage
- [ ] Re-visiting `/dashboard` redirects to `/login`

---

## 2. Dashboard Page (`/dashboard`)

### Layout
- [ ] Sidebar visible with navigation links
- [ ] Header shows user info and logout button
- [ ] Main content area displays correctly

### Welcome Section
- [ ] Personalized welcome message shows user's name
- [ ] Mock mode warning banner visible (when in mock mode)
- [ ] Privacy notice badge with green dot

### Stats Cards
- [ ] 3 stat cards visible: Active Calls, Contacts Online, Threats Blocked
- [ ] Icons render correctly (SVG, not emoji)
- [ ] Numbers display correctly
- [ ] Cards have consistent styling

### Security Status Card
- [ ] "Security Status" header visible
- [ ] 3 live indicators: Voice Shield, Risk Monitor, Privacy Guard
- [ ] Green dots animate (pulse effect)
- [ ] "All Systems Operational" text visible

### Quick Actions
- [ ] Quick Actions card visible
- [ ] Buttons: Start New Call, View Contacts, Call History, Settings
- [ ] Each button navigates to correct route
- [ ] Icons render correctly

### Test Call Button (Mock Mode)
- [ ] "🧪 Test Incoming Call" button visible in mock mode
- [ ] Clicking triggers incoming call modal
- [ ] Button not visible in production mode

---

## 3. Contacts Page (`/contacts`)

### Layout
- [ ] Page title "Contacts" visible
- [ ] Search input field visible
- [ ] Contact cards grid layout

### Search Functionality
- [ ] Typing in search filters contacts by name
- [ ] Search filters contacts by email
- [ ] Case-insensitive search works
- [ ] Clearing search shows all contacts
- [ ] "No contacts found" message when no results

### Contact Cards
- [ ] Each card shows avatar with initials
- [ ] Name and email visible
- [ ] Status badge (Online/Offline/Away/In Call)
- [ ] Status badge color-coded correctly
- [ ] "Call" button visible
- [ ] Clicking "Call" button initiates call
- [ ] Navigation to `/call/:callId` occurs

### Empty State
- [ ] Shows when no contacts exist
- [ ] "Add Contact" button visible
- [ ] Icon and message render correctly

### Mock Data
- [ ] At least 5+ contacts visible in mock mode
- [ ] Various status types represented
- [ ] Data loads on page mount

---

## 4. Active Call Flow

### Outgoing Call
- [ ] Clicking "Call" on contact card navigates to `/call/:callId`
- [ ] ActiveCallPage displays immediately
- [ ] Caller name and email visible
- [ ] Avatar displays with correct initials
- [ ] Timer starts at 00:00 and increments
- [ ] "Live Analysis" badge visible with pulse animation
- [ ] Microphone permission prompt appears

### Incoming Call
- [ ] IncomingCallModal appears on incoming call event
- [ ] Caller name and avatar visible
- [ ] "Accept" and "Reject" buttons visible
- [ ] Clicking "Accept" navigates to `/call/:callId`
- [ ] Clicking "Reject" closes modal and stays on current page
- [ ] Modal closes automatically after action

### Active Call Page (`/call/:callId`)

#### Visual Elements
- [ ] Call duration timer visible and updating
- [ ] "Live Analysis" badge visible
- [ ] Caller avatar, name, and email displayed
- [ ] Waveform animation visible
- [ ] Call controls visible at bottom

#### Waveform Animation
- [ ] Bars animate when microphone active
- [ ] Bars stop when muted
- [ ] Color changes based on risk level:
  - Blue/Green: LOW risk
  - Yellow: MEDIUM risk
  - Red: HIGH risk
- [ ] Smooth animation (no flickering)

#### Risk Analysis Display
- [ ] "Analyzing Voice..." shows initially (first 3 seconds)
- [ ] Risk status card appears after analysis
- [ ] Risk level badge displays (LOW/MEDIUM/HIGH)
- [ ] Risk score percentage visible
- [ ] Confidence metrics displayed
- [ ] Recommendation text visible
- [ ] Color-coded by risk level
- [ ] Updates every 5 seconds in mock mode

#### Call Controls
- [ ] 4 buttons visible: Mute, Speaker, Add User, End Call
- [ ] Mute button toggles microphone
- [ ] Mute icon changes when toggled
- [ ] Waveform stops when muted
- [ ] "Microphone muted" text appears when muted
- [ ] Speaker button toggles state (visual only)
- [ ] Speaker icon changes when toggled
- [ ] "Add User" shows "coming soon" alert
- [ ] End Call button ends call
- [ ] Redirects to dashboard after ending

#### Mock Mode Notice
- [ ] "Demo Mode: Showing simulated analysis" visible at bottom
- [ ] Only visible when `VITE_MOCK_MODE=true`
- [ ] Icon renders correctly

---

## 5. Call History Page (`/history`)

### Layout
- [ ] Page title "Call History" visible
- [ ] Filter buttons visible: ALL, LOW, MEDIUM, HIGH
- [ ] Search input visible
- [ ] Call history list visible

### Filters
- [ ] "ALL" shows all calls
- [ ] "LOW" shows only low-risk calls
- [ ] "MEDIUM" shows only medium-risk calls
- [ ] "HIGH" shows only high-risk calls
- [ ] Active filter button highlighted
- [ ] Filtering works correctly

### Search
- [ ] Search by contact name works
- [ ] Search by contact email works
- [ ] Case-insensitive search
- [ ] Clearing search shows all calls (filtered)
- [ ] "No call history found" when no results

### Call History Cards
- [ ] Each card shows caller avatar and name
- [ ] Call duration displayed
- [ ] Timestamp shown (e.g., "2 hours ago")
- [ ] Risk level badge visible
- [ ] Risk score displayed
- [ ] "View Details" button visible
- [ ] Cards sorted by date (most recent first)

### Call Detail Modal
- [ ] Clicking "View Details" opens modal
- [ ] Modal shows full call information
- [ ] Risk analysis details visible
- [ ] Acoustic and prosody indicators displayed
- [ ] Recommendation text visible
- [ ] "Close" button closes modal
- [ ] Clicking outside modal closes it

### Empty State
- [ ] Shows when no history exists
- [ ] Icon and message render correctly
- [ ] "Start a Call" button navigates to contacts

---

## 6. Settings Page (`/settings`)

### Layout
- [ ] Page title "Settings" visible
- [ ] Full width layout (no max-width constraint)
- [ ] All sections visible and properly spaced

### Section Groups
- [ ] **ACCOUNT** section header visible
- [ ] Profile settings list item
- [ ] Logout list item with red text

- [ ] **CALL SETTINGS** section header visible
- [ ] Auto-answer toggle
- [ ] Call notifications toggle
- [ ] Audio settings item with chevron

- [ ] **AI VOICE PROTECTION** section header visible
- [ ] Real-time analysis toggle (default ON)
- [ ] Sensitivity level item with chevron
- [ ] Advanced settings item with chevron

- [ ] **PRIVACY** section header visible
- [ ] Audio retention shows OFF (non-changeable)
- [ ] Data sharing toggle
- [ ] Privacy policy link with chevron

- [ ] **NOTIFICATIONS** section header visible
- [ ] Push notifications toggle
- [ ] Email notifications toggle
- [ ] Notification preferences item with chevron

- [ ] **SECURITY** section header visible
- [ ] Two-factor authentication toggle
- [ ] Change password item with chevron
- [ ] Security log item with chevron

- [ ] **ABOUT** section header visible
- [ ] Version shows "v1.0.0"
- [ ] Help & Support link with chevron
- [ ] Terms of Service link with chevron

### Interactive Elements
- [ ] All toggle switches functional
- [ ] Toggle switches maintain state (visual)
- [ ] Chevron items clickable (show alert)
- [ ] Icons render correctly (SVG, not emoji)
- [ ] Hover states work on interactive elements

---

## 7. About Page (`/about`)

### Hero Section
- [ ] Large shield icon visible
- [ ] "About VoiceShield" title visible
- [ ] Tagline visible
- [ ] "Get Started" button navigates to signup

### Mission & Vision
- [ ] Mission statement visible
- [ ] Vision statement visible
- [ ] Icons render correctly

### Key Features
- [ ] 4 feature cards visible
- [ ] Each card has icon, title, description
- [ ] Cards: Real-Time Detection, Privacy-First, Risk Assessment, Transparent Analysis
- [ ] Icons render correctly

### How It Works
- [ ] 4-step process visible
- [ ] Step numbers displayed
- [ ] Step titles and descriptions visible
- [ ] Icons render correctly
- [ ] Proper vertical layout

### Privacy Commitment
- [ ] Section title visible
- [ ] 4 privacy guarantees visible as list items
- [ ] Icons render correctly

### FAQ Section
- [ ] "Frequently Asked Questions" title visible
- [ ] 6 FAQ items visible
- [ ] Each item has question and answer
- [ ] Proper spacing and readability

### Footer
- [ ] Version information visible ("v1.0.0")
- [ ] Copyright notice (if present)

---

## 8. Navigation & Routing

### Sidebar Navigation
- [ ] All navigation links visible
- [ ] Icons render correctly
- [ ] Active route highlighted
- [ ] Clicking each link navigates correctly:
  - Dashboard → `/dashboard`
  - Contacts → `/contacts`
  - Call History → `/history`
  - Settings → `/settings`
  - About → `/about`

### Header
- [ ] User name displayed
- [ ] User email displayed
- [ ] Avatar with initials
- [ ] Logout button visible

### Protected Routes
- [ ] Accessing `/dashboard` when logged out redirects to `/login`
- [ ] Accessing `/contacts` when logged out redirects to `/login`
- [ ] Accessing `/history` when logged out redirects to `/login`
- [ ] Accessing `/settings` when logged out redirects to `/login`
- [ ] Accessing `/about` when logged out redirects to `/login`
- [ ] `/`, `/login`, `/signup` accessible when logged out

### URL Navigation
- [ ] Back button works correctly
- [ ] Forward button works correctly
- [ ] Refreshing page maintains auth state (if token exists)
- [ ] Direct URL access works for all routes

---

## 9. Responsive Design

### Desktop (1920x1080)
- [ ] Sidebar visible and full width
- [ ] Content area properly sized
- [ ] No horizontal scrolling
- [ ] All cards and components aligned

### Tablet (768x1024)
- [ ] Layout adjusts appropriately
- [ ] Sidebar collapses or adapts
- [ ] Content readable and usable
- [ ] Touch targets adequate size

### Mobile (375x667)
- [ ] Mobile-friendly layout
- [ ] Sidebar becomes hamburger menu (if implemented)
- [ ] Content stacks vertically
- [ ] Touch targets large enough
- [ ] No horizontal scrolling
- [ ] Text readable without zoom

---

## 10. Browser Compatibility

### Chrome/Edge
- [ ] All features work
- [ ] WebRTC functional
- [ ] Audio processing works
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] WebRTC functional
- [ ] Audio processing works
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] WebRTC functional
- [ ] Audio processing works
- [ ] No console errors

---

## 11. Performance

### Page Load
- [ ] Landing page loads in < 2 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] No layout shift (CLS)
- [ ] Images load progressively

### Interactions
- [ ] Button clicks respond immediately
- [ ] Navigation transitions smooth
- [ ] Form inputs responsive
- [ ] No UI freezing or lag

### Memory
- [ ] No memory leaks after extended use
- [ ] Call cleanup releases resources
- [ ] No growing memory usage when idle

---

## 12. Accessibility

### Keyboard Navigation
- [ ] Tab key navigates through interactive elements
- [ ] Enter key activates buttons
- [ ] Escape key closes modals
- [ ] Focus visible on all elements

### Screen Reader Support
- [ ] Images have alt text
- [ ] Buttons have descriptive labels
- [ ] Form inputs have labels
- [ ] Headings properly structured

### Color Contrast
- [ ] Text readable on backgrounds
- [ ] Meets WCAG AA standards
- [ ] Status indicators distinguishable

---

## 13. Error Handling

### Network Errors
- [ ] Shows error message when API fails
- [ ] Graceful degradation in mock mode
- [ ] WebSocket reconnection attempts

### Form Validation
- [ ] Invalid email shows error
- [ ] Weak password shows error
- [ ] Required fields validated
- [ ] Clear error messages

### Call Errors
- [ ] Microphone permission denied shows error
- [ ] WebRTC connection failure handled
- [ ] Call end cleanup successful
- [ ] No orphaned connections

---

## 14. Mock Mode Testing

### Configuration
- [ ] `VITE_MOCK_MODE=true` in `.env`
- [ ] Mock mode banner visible on dashboard
- [ ] Mock mode notice on active call page

### Mock Data
- [ ] Contacts load with mock data
- [ ] Call history loads with mock data
- [ ] Risk analysis generates random data
- [ ] No real API calls made (check network tab)

### Mock WebSockets
- [ ] Signaling WebSocket connects to mock endpoint
- [ ] Analysis WebSocket connects to mock endpoint
- [ ] Messages logged to console
- [ ] No real backend connection required

---

## 15. Production Mode Testing

### Configuration
- [ ] `VITE_MOCK_MODE=false` in `.env`
- [ ] Backend running and accessible
- [ ] No mock mode banner visible

### Real Data
- [ ] Contacts load from backend API
- [ ] Call history loads from backend API
- [ ] Risk analysis comes from real AI backend
- [ ] WebSockets connect to real endpoints

### Integration
- [ ] Full call flow works end-to-end
- [ ] Risk updates received in real-time
- [ ] Audio data sent to backend
- [ ] All API endpoints respond correctly

---

## 16. Security Testing

### Authentication
- [ ] Token stored securely in localStorage
- [ ] Token included in API requests (check network tab)
- [ ] Protected routes require authentication
- [ ] Expired token redirects to login

### Permissions
- [ ] Microphone permission requested only when needed
- [ ] Permission denied handled gracefully
- [ ] No unnecessary permissions requested

### Data Privacy
- [ ] No audio stored in localStorage
- [ ] No sensitive data in console logs (production)
- [ ] No PII exposed in URLs
- [ ] WebRTC encrypted (check connection info)

---

## Test Results Summary

**Date**: _________________

**Tested By**: _________________

**Browser**: _________________

**Mode**: Mock / Production

**Overall Status**: Pass / Fail / Partial

### Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

### Notes:
_________________________________
_________________________________
_________________________________

---

## Automated Testing (Future)

### Unit Tests
- [ ] Component tests with React Testing Library
- [ ] Service tests (API, WebRTC, Audio)
- [ ] Utility function tests
- [ ] Hook tests

### Integration Tests
- [ ] Call flow end-to-end test
- [ ] Authentication flow test
- [ ] Navigation flow test

### E2E Tests
- [ ] Playwright/Cypress tests
- [ ] Full user journey tests
- [ ] Cross-browser tests

---

## Sign-off

**Frontend Lead**: _________________ Date: _______

**QA Lead**: _________________ Date: _______

**Product Owner**: _________________ Date: _______
