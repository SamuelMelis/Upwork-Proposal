# Telegram Mini App Integration Plan

## Overview
Convert the Upwork AI Proposal Generator into a Telegram Mini App that users can access directly from Telegram.

## Steps to Create Telegram Mini App

### 1. Create Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name (e.g., "Upwork Proposal Generator")
4. Choose a username (e.g., "upwork_proposal_bot")
5. Save the **Bot Token** you receive

### 2. Install Telegram Web App SDK
```bash
npm install @twa-dev/sdk
```

### 3. Code Changes Required

#### A. Update `index.html`
Add Telegram Web App script:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

#### B. Create Telegram Integration Hook
File: `src/hooks/useTelegram.js`
- Initialize Telegram WebApp
- Get user data
- Handle theme
- Control main button
- Handle back button

#### C. Update Main App
- Integrate Telegram SDK
- Adapt UI for Telegram theme
- Use Telegram's MainButton for actions
- Handle Telegram user authentication

#### D. Style Adjustments
- Match Telegram's design language
- Responsive for mobile (Telegram is mobile-first)
- Use Telegram color scheme

### 4. Register Mini App with BotFather
1. Send `/newapp` to @BotFather
2. Select your bot
3. Provide app title, description, and photo
4. Enter your Vercel URL (e.g., `https://your-app.vercel.app`)
5. Get your Mini App link

### 5. Testing
- Open Telegram
- Start your bot
- Click the Mini App button
- Test all functionality

### 6. Optional Enhancements
- Use Telegram user data for personalization
- Send notifications via bot
- Add inline keyboard buttons
- Implement Telegram payments (if needed)

## Key Differences from Web App
1. **Authentication**: Use Telegram user data instead of separate login
2. **Navigation**: Use Telegram's back button
3. **Actions**: Use Telegram's MainButton for primary actions
4. **Theme**: Adapt to Telegram's light/dark theme
5. **Viewport**: Optimized for mobile screens

## Security Considerations
- Validate Telegram init data
- Use Telegram's user ID for user identification
- Keep API keys secure (already in Vercel env vars)

## Next Steps
1. Install Telegram SDK
2. Create Telegram integration hook
3. Update UI components
4. Test in Telegram
5. Deploy updates to Vercel
