# Testing Guide

## Pre-Testing Setup

Before testing the application, ensure you have:

1. ✅ All dependencies installed: `npm install`
2. ✅ Environment variables configured in `.env.local`
3. ✅ Development server running: `npm run dev`
4. ✅ All API keys are valid and have sufficient quota

## Manual Testing Checklist

### 1. Authentication Flow

**Test Cases:**
- [ ] Visit homepage without authentication
- [ ] Click "Sign In" button
- [ ] Complete Google OAuth flow
- [ ] Verify user profile is created in InstantDB
- [ ] Verify initial balance (€10,000) is set
- [ ] Test sign out functionality
- [ ] Verify redirect to homepage after sign out

**Expected Results:**
- Seamless Google login
- User data persisted in database
- Protected routes accessible after login

### 2. Portfolio View (`/portfolio`)

**Test Cases:**
- [ ] Navigate to Portfolio page
- [ ] Verify cash balance displays correctly
- [ ] Verify "No positions" message when starting
- [ ] Test auto-refresh toggle (on/off)
- [ ] Verify "Last updated" timestamp
- [ ] Click manual refresh button
- [ ] Observe price updates (if holding positions)

**Expected Results:**
- All financial data displays correctly
- Auto-refresh works at 30s intervals
- Manual refresh updates immediately
- P/L calculations are accurate

### 3. Trade Execution (`/trade`)

**Test Cases:**
- [ ] Navigate to Trade page
- [ ] Search for a stock symbol (e.g., "AAPL")
- [ ] Verify autocomplete suggestions appear
- [ ] Select a symbol from suggestions
- [ ] Verify current price loads
- [ ] Verify AI commentary appears (may take a few seconds)
- [ ] Test BUY trade:
  - Enter amount in EUR (e.g., €1000)
  - Verify share calculation
  - Click "Execute Trade"
  - Verify success message
  - Verify cash balance decreases
- [ ] Test SELL trade:
  - Select a held position
  - Enter shares to sell
  - Execute trade
  - Verify success message
  - Verify cash balance increases
- [ ] Test fractional shares (e.g., 0.5 shares)
- [ ] Test insufficient funds error
- [ ] Test insufficient shares error

**Expected Results:**
- Trades execute successfully
- Position updates immediately
- Cash balance updates correctly
- Fractional shares work
- Validation errors display appropriately

### 4. Simulation Mode

**Test Cases:**
- [ ] Click calendar icon in navigation
- [ ] Select a historical date (e.g., 2020-01-01)
- [ ] Verify simulation banner appears
- [ ] Navigate to Trade page
- [ ] Verify prices are historical
- [ ] Execute a trade with historical prices
- [ ] Verify trade is recorded with simulation date
- [ ] Click "Back to Now"
- [ ] Verify real-time prices return

**Expected Results:**
- Historical prices load correctly
- Trades use correct historical prices
- Clear indication of simulation mode
- Easy toggle between modes

### 5. History & Charts (`/history`)

**Test Cases:**
- [ ] Navigate to History page
- [ ] Verify trades table displays all trades
- [ ] Test symbol filter
- [ ] Enter symbol in price chart input (e.g., "TSLA")
- [ ] Verify price chart loads
- [ ] Verify portfolio value chart appears (after multiple snapshots)
- [ ] Verify P/L chart appears
- [ ] Click "Export" button
- [ ] Verify CSV download

**Expected Results:**
- All 3 charts display correctly
- Trade history is complete and filterable
- Charts are interactive and responsive
- CSV export works

### 6. Tournament Mode (`/tournament`)

**Test Cases:**
- [ ] Navigate to Tournament page
- [ ] Click "Create Tournament"
- [ ] Fill in tournament details:
  - Name: "Test Tournament"
  - Start Date: Today
  - End Date: +7 days
  - Starting Balance: €10,000
- [ ] Create tournament
- [ ] Verify tournament appears in list
- [ ] Click "Join" on a tournament
- [ ] Verify "Participating" badge appears
- [ ] Make some trades
- [ ] Verify leaderboard updates
- [ ] Check rank and return %

**Expected Results:**
- Tournament creation works
- Join/leave functionality works
- Leaderboard updates in real-time
- Participant count is accurate

### 7. Leaderboard (`/leaderboard`)

**Test Cases:**
- [ ] Navigate to Leaderboard page
- [ ] Verify your rank appears in top card
- [ ] Verify return % is calculated correctly
- [ ] Check leaderboard table
- [ ] Verify your row is highlighted
- [ ] Test period filters (today, week, month, all time)
- [ ] Verify rank medals (🏆 #1, 🥈 #2, 🥉 #3)

**Expected Results:**
- Rankings are accurate
- Current user is highlighted
- Medals display for top 3
- Period filters work

### 8. Risk Profile (`/risk-profile`)

**Test Cases:**
- [ ] Navigate to Risk Profile page
- [ ] Select "Low Risk" profile
- [ ] Click "Save Profile"
- [ ] Add stocks to watchlist (in Trade page)
- [ ] Return to Risk Profile
- [ ] Click "Generate Recommendation"
- [ ] Verify volatility calculation
- [ ] Verify allocation suggestions
- [ ] Verify pie chart displays
- [ ] Test with different risk profiles

**Expected Results:**
- Volatility calculated from historical data
- Allocations match risk profile:
  - Low: 70% low volatility
  - Medium: 50/50 split
  - High: 70% high volatility
- Pie chart visualizes allocation

### 9. Achievements (`/achievements`)

**Test Cases:**
- [ ] Navigate to Achievements page
- [ ] Verify achievement count (X/7)
- [ ] Check "First Trade" achievement
  - Should unlock after first trade
- [ ] Check progress bars for locked achievements
- [ ] Make trades to unlock achievements
- [ ] Verify achievements unlock in real-time

**Achievement Triggers:**
- `first_trade`: Execute 1 trade ✓
- `profit_10_percent`: Achieve 10%+ return
- `streak_7_days`: Trade on 7 different days
- `diversification`: Hold 5+ different stocks
- `big_win`: 50%+ gain on one stock
- `diamond_hands`: Hold position 30+ days
- `day_trader`: 10+ trades in one day

**Expected Results:**
- Progress tracking is accurate
- Achievements unlock automatically
- Visual feedback is clear

### 10. Internationalization

**Test Cases:**
- [ ] Click language toggle (globe icon)
- [ ] Verify UI switches to Lithuanian
- [ ] Navigate through all pages
- [ ] Verify all text is translated
- [ ] Switch back to English
- [ ] Verify all text returns to English

**Expected Results:**
- Complete translation coverage
- No missing translation keys
- Language preference persists

### 11. Responsive Design

**Test Cases:**
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify navigation adapts
- [ ] Verify tables are scrollable
- [ ] Verify charts resize correctly

**Expected Results:**
- Fully responsive on all screen sizes
- No horizontal scrolling
- Touch-friendly on mobile

## Browser Testing

Test on multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Performance Testing

**Metrics to Check:**
- [ ] Initial page load < 3s
- [ ] Navigation between pages < 500ms
- [ ] API response times < 2s
- [ ] Chart rendering < 1s
- [ ] No memory leaks with auto-refresh

## Error Handling

**Test Cases:**
- [ ] Invalid stock symbol
- [ ] API rate limit exceeded
- [ ] Network timeout
- [ ] Invalid trade amount
- [ ] Database connection error

**Expected Results:**
- Clear error messages
- No application crashes
- Graceful degradation

## Security Testing

**Test Cases:**
- [ ] Access protected routes without login
- [ ] Verify redirects to homepage
- [ ] Check API route protection
- [ ] Verify no API keys in client code
- [ ] Test CSRF protection

**Expected Results:**
- All protected routes require authentication
- API keys are server-side only
- No security vulnerabilities

## Vercel Deployment Testing

After deploying to Vercel:

- [ ] Visit production URL
- [ ] Test Google OAuth with production callback
- [ ] Verify all environment variables work
- [ ] Test all features in production
- [ ] Check Vercel function logs for errors
- [ ] Monitor performance metrics

## Known Limitations

1. **API Rate Limits**: Twelve Data free tier has limited requests
2. **Historical Data**: May not be available for all dates/symbols
3. **Real-time Prices**: Update every 30-60s, not millisecond precision
4. **AI Commentary**: Requires OpenAI API credits

## Bug Reporting Template

If you find issues:

```markdown
**Bug Title**: Brief description

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. ...

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happened

**Screenshots**: If applicable

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Screen size: 1920x1080
```

## Success Criteria

The application is ready for submission when:

- ✅ All core features work (4 points)
- ✅ InstantDB integration complete (3 points)
- ✅ Auto-refresh functional (2 points)
- ✅ Charts and UI polished (1 point)
- ✅ All 5 bonus features work (+5 points)
- ✅ No critical bugs
- ✅ Deployed to Vercel with public URL
- ✅ README and documentation complete

**Total Possible Score**: 10/10 + 5 bonus = 15 points

