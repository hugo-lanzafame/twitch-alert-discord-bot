# Twitch Live Notifier Bot for Discord

A Discord bot that automatically sends notifications to your server when you go live on Twitch. Get embedded messages with stream details and game info!

## Features

- Automatic live stream detection
- Notifications with @everyone mention
- Embedded messages with stream thumbnail
- Shows game and stream title
- Checks stream status every 60 seconds (configurable)
- No spam - only one notification per stream

## Prerequisites

Before you begin, make sure you have:

- [Docker](https://www.docker.com/) and Docker Compose (recommended) OR [Node.js](https://nodejs.org) (version 18.0.0 or higher) (see below why)
- A Discord account and server
- A Twitch account

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hugo-lanzafame/twitch-alert-discord-bot
cd twitch-alert-discord-bot
```

### 2. Configure Environment Variables

1. Copy the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
   
2. Open the `.env` file and fill in all the required values (see below for instructions)

## Getting Your Configuration Values

### 1. DISCORD_TOKEN

**Create a Discord Bot:**

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "Twitch Notifier")
4. Go to the **"Bot"** tab
6. Click **"Reset Token"** and then **"Copy"**
7. Paste it in your `.env` file as `DISCORD_TOKEN`

**IMPORTANT:** The Token can only be viewed once. Save it immediately! Never share this token publicly!

**Invite the Bot to Your Server:**

1. Still in Discord Developer Portal, go to **"OAuth2"** > **"URL Generator"**
2. Select scopes:
   - `bot`
3. Select bot permissions:
   - `Send Messages`
   - `Embed Links`
   - `Mention Everyone`
4. Copy the generated URL at the bottom
5. Open it in your browser and invite the bot to your server

### 2. TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET

**Create a Twitch Application:**

1. Go to [Twitch Developers Console](https://dev.twitch.tv/console)
2. Click **"Register Your Application"**
3. Fill in the form:
   - **Name:** "Discord Bot" (or any name)
   - **OAuth Redirect URLs:** `http://localhost`
   - **Category:** "Application Integration"
   - **Client Type:** **Confidential**
4. Click **"Create"**
5. Click **"Manage"** on your new application
6. Copy the **Client ID** and paste as `TWITCH_CLIENT_ID` in `.env`
7. Click **"New Secret"**, copy it immediately and paste as `TWITCH_CLIENT_SECRET` in `.env`

**WARNING:** The Client Secret can only be viewed once. Save it immediately! Never share this Client Secret publicly!

### 3. TWITCH_USERNAME

This is simply your Twitch username (as it appears in your channel URL).

Example: If your channel is `twitch.tv/yourname`, then:
```
TWITCH_USERNAME=yourname
```

Use **lowercase** letters only!

### 4. DISCORD_CHANNEL_ID

**Find a Channel ID:**

1. **Enable Developer Mode in Discord:**
   - Open Discord Settings
   - Go to **"Advanced"**
   - Enable **"Developer Mode"**

2. **Get the Channel ID:**
   - Go to your Discord server
   - Right-click on the channel where you want notifications
   - Click **"Copy Channel ID"**
   - Paste it as `DISCORD_CHANNEL_ID` in `.env`

**NB:** Make sure your bot has the permission to send messages, embed links and mention everyone in the selected channel.

### 5. MONITORING SETTINGS (Optional)

These settings control how the bot monitors your stream and handles errors:

- **CHECK_INTERVAL** - Time in milliseconds between stream status checks. Default: `60000` (1 minute)
- **MAX_RETRIES** - Maximum number of retry attempts for failed API requests. Default: `3`
- **RETRY_DELAY** - Delay in milliseconds between retry attempts. Default: `2000` (2 seconds)
- **REQUEST_TIMEOUT** - Maximum time in milliseconds to wait for API responses. Default: `10000` (10 seconds)

## Running the Bot

Once everything is configured, start the bot with:

### Option 1: With Docker

If you want your bot to run 24/7 on a server (VPS, Raspberry Pi, or dedicated server). Docker provides automatic restarts on crashes, isolated environment, centralized logging, and ensures the bot runs identically everywhere. Perfect for production deployment where you want a "set it and forget it" solution.

```bash
# Build and start the bot
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the bot
docker-compose stop

# Restart the bot
docker-compose restart

# Update
git pull
docker-compose up -d --build
```

### Option 2: With Node.js

If you're actively developing the bot, testing it temporarily, or only need it running while you're at your computer. Direct Node.js execution is simpler for quick tests and allows instant code changes without rebuilding. Great for development and learning, but requires you to manually start the bot each time.

```bash
# Install Dependencies
npm install
```

This will install:
- `discord.js` - Discord API library
- `axios` - HTTP client for Twitch API
- `dotenv` - Environment variables manager

```bash
# Start the bot
node ./src/index.js
```

You should see:
```
[dotenv@17.2.3] injecting env (6) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
[20/10/2025 04:53:47] [SUCCESS] Configuration validated
[20/10/2025 04:53:47] [SUCCESS] Discord bot connected as YourBot#1234
[20/10/2025 04:53:47] [STREAM] Monitoring your_channel every 60000ms
[20/10/2025 04:53:48] [SUCCESS] Twitch access token obtained
[20/10/2025 04:53:48] [DEBUG] your_channel is offline
```

**To stop the bot:** Press `Ctrl + C` in the terminal

## Customization

You can modify the `CHECK_INTERVAL` in your `.env` file to change how often the bot checks your stream status:

- `60000` = 1 minute (default)
- `30000` = 30 seconds
- `120000` = 2 minutes

Don't set it too low to avoid rate limits!

## Project Structure

```
twitch-alert-discord-bot/
│
├── src/
│   ├── config/
│   │   └── index.js             # Configuration and validation
│   ├── services/
│   │   ├── twitch.service.js    # Twitch API integration
│   │   └── discord.service.js   # Discord API integration
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   └── retry.js             # Retry logic for network errors
│   └── index.js                 # Main application entry point
├── node_modules/                # Dependencies (auto-generated)
├── .env                         # Your configuration (DO NOT SHARE!)
├── .env.example                 # Configuration template
├── .gitignore                   # Git ignore file
├── .dockerignore                # Docker ignore file
├── Dockerfile                   # Docker image configuration
├── docker-compose.yml           # Docker Compose configuration
├── package.json                 # Project metadata and dependencies
├── package-lock.json            # Dependency lock file
├── LICENSE.md                   # License file
└── README.md                    # This file
```

## Security

- Never share (or commit to Git) your `.env` file
- Never share your Discord token or Twitch secrets
- If you accidentally expose a token, regenerate it immediately

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Contributing

Feel free to fork this project and submit pull requests with improvements!