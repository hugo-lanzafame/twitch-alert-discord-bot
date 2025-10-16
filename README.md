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

- [Node.js](https://nodejs.org) (version 16.9.0 or higher) (if you don't use docker)
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

**IMPORTANT:** Never share this token publicly!

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

**WARNING:** The Client Secret can only be viewed once. Save it immediately! Never share this token publicly!

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

## Running the Bot

Once everything is configured, start the bot with:

### Option 1: With Node.js (Direct)

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
node bot.js
```

You should see:
```
Bot connected as YourBot#1234
Monitoring stream status...
```

**To stop the bot:** Press `Ctrl + C` in the terminal

### Option 2: With Docker (Recommended for servers)

If you prefer using Docker or don't have Node.js installed:

```bash
# Build and start the bot
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the bot
docker-compose stop

# Restart the bot
docker-compose restart

# Update and rebuild
git pull
docker-compose up -d --build
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
├── node_modules/          # Dependencies (auto-generated)
├── .dockerignore          # Docker ignore file
├── .env                   # Your configuration (DO NOT SHARE!)
├── .env.example           # Configuration template
├── .gitignore             # Git ignore file
├── bot.js                 # Main bot code
├── docker-compose.yml     # Docker compose configuration
├── Dockerfile             # Docker image configuration
├── LICENSE.md             # Project license
├── package.json           # Project metadata
├── package-lock.json      # Dependency lock file
└── README.md              # This file
```

## Security

- Never share (or commit to Git) your `.env` file
- Never share your Discord token or Twitch secrets
- If you accidentally expose a token, regenerate it immediately

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Contributing

Feel free to fork this project and submit pull requests with improvements!
