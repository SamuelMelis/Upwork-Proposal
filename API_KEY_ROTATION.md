# API Key Rotation - Setup Guide

## How It Works

The app now supports **multiple Gemini API keys** with automatic rotation when a key runs out of tokens or hits quota limits.

### Automatic Rotation
- When an API call fails with a quota/rate limit error, the system automatically switches to the next key
- Retries the request with the new key
- Continues until a key works or all keys are exhausted

## Adding Your API Keys

Open `src/utils/apiKeyManager.js` and add your keys to the array:

```javascript
const GEMINI_API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY, // First key from .env
    'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX', // Your second key
    'AIzaSyYYYYYYYYYYYYYYYYYYYYYYYYYYY', // Your third key
    'AIzaSyZZZZZZZZZZZZZZZZZZZZZZZZZZZ', // Your fourth key
];
```

**Important:** 
- Keep the first line to use your `.env` key
- Add as many additional keys as you want
- The system will automatically filter out any empty/undefined keys

## How Rotation Works

1. **Normal Operation:** Uses the first available key
2. **Quota Error Detected:** Automatically switches to the next key
3. **Retry:** Attempts the same request with the new key
4. **Success:** Continues using the new key for subsequent requests
5. **All Keys Exhausted:** Returns error to user

## Console Logs

You'll see helpful logs in the browser console:
- `✅ API Key Manager initialized with X key(s)` - Shows how many keys loaded
- `⚠️ Quota error detected on attempt X` - When a quota error occurs
- `🔄 Retrying with next API key` - When rotating to next key
- `❌ No more API keys available` - When all keys are exhausted

## Error Detection

The system automatically detects these quota-related errors:
- "quota exceeded"
- "rate limit"
- "resource exhausted"
- "too many requests"
- HTTP 429 errors
- "insufficient quota"

Any other errors (like network issues) will fail immediately without rotation.
