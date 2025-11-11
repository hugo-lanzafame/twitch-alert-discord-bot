# Twitch Alert Discord Bot

[![License](https://img.shields.io/github/license/hugo-lanzafame/twitch-alert-discord-bot)](LICENSE.md)
[![Powered by Discord.js](https://img.shields.io/badge/Powered_by-Discord.js-7289DA?logo=discord&logoColor=white)](https://discord.js.org/)
[![Twitch API](https://img.shields.io/badge/Twitch-API-6441A4?logo=twitch&logoColor=white)](https://dev.twitch.tv/docs/api/)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-339933?logo=nodedotjs)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A modular Discord bot that sends automatic "Live notifications" and daily "Top Clips" digests to your server.

## Table of Contents

* [Features](#features)
* [Quick Start](#quick-start)
    * [1. Prerequisites](#1-prerequisites)
    * [2. Installation](#2-installation)
    * [3. Running the Bot](#3-running-the-bot)
        * [Option 1: With Docker](#option-1-with-docker)
        * [Option 2: With Nodejs](#option-2-with-nodejs)
* [Project Structure](#project-structure)
  * [Tree view](#tree-view-of-the-files)
* [Security](#security)
* [License](#license)
* [Contributing](#contributing)

## Features

* **Live Notifications**: Automatic detection of your live stream with rich embedded messages (game, title, thumbnail).
* **Daily Top Clips**: Automatically fetches and posts the top clips of the day (by view count) at a scheduled time.
* **Modular**: Easily enable or disable features like live alerts or clips directly from the configuration.
* **No Spam**: Only one notification per stream, and one clip digest per day.
* **Configurable**: Set check intervals, API timeouts, and cron schedules.

## Quick Start

### 1. Prerequisites

* [Docker](https://www.docker.com/) & Docker Compose (Recommended)
* OR [Node.js](https://nodejs.org) (v18.0.0 or higher)
* A Discord account and server.
* A Twitch account.

### 2. Installation

1.  Clone the repository:
    ```bash
      git clone https://github.com/hugo-lanzafame/twitch-alert-discord-bot
      cd twitch-alert-discord-bot   
    ```

2.  Create your configuration file:
    ```bash
    cp .env.example .env
    ```

3.  **Fill in your `.env` file.**
    * This is the most important step. You will need tokens and channel IDs.
    * **See the [Environement Setup Guide](docs/ENV_SETUP.md) for a detailed walkthrough.**

### 3. Running the Bot

Once everything is configured, start the bot with:

#### Option 1: With Docker

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

This will install `discord.js`, `axios`, `dotenv`, and `node-cron`.

```bash
# Start the bot
node ./src/index.js
```

You should see something like this:
```cmd
[dotenv@17.2.3] injecting env (6) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
[11/03/2025 10:00:01] [SUCCESS] Configuration validated
[11/03/2025 10:00:02] [SUCCESS] Discord bot connected as YourBot#1234
[11/03/2025 10:00:02] [MONITOR] Monitoring your_channel every 60000ms
[11/03/2025 10:00:02] [SCHEDULER] Scheduling daily clips job with schedule: 0 20 * * *
[11/03/2025 10:00:03] [SUCCESS] Twitch access token obtained
[11/03/2025 10:00:03] [DEBUG] your_channel is offline
```

**To stop the bot:** Press `Ctrl + C` in the terminal

## Project Structure

The project uses a **Service-Oriented Architecture** based on separation by function :
- The **Orchestrator** `index.js` manages everything, launching specialized services for core tasks.
- Functionalities are strictly isolated based on their runtime needs:
  - `MonitorService` handles continuous, loop-based checks.
  - `SchedulerService` manages time-based cron jobs.
- **Communication Services** (`twitch.service.js`, `discord.service.js`) act as shared data pipelines for all features.
- The `utils/` folder contains reusable, stateless helper functions for generic tasks like logging or retry logic.


### Tree view of the files

```bash
twitch-alert-discord-bot/
├── docs/
│   └── ENV_SETUP.md             # Environement setup guide
├── node_modules/                # Dependencies (auto-generated)
├── src/
│   ├── config/
│   │   └── index.js             # Configuration and validation
│   ├── services/
│   │   ├── discord.service.js   # Discord API integration
│   │   ├── monitor.service.js   # Continuous status checking
│   │   ├── scheduler.service.js # Time-based job scheduling
│   │   └── twitch.service.js    # Twitch API integration
│   ├── utils/
│   │   ├── logger.js            # Logging utility
│   │   └── retry.js             # Retry logic for network errors
│   └── index.js                 # Main application entry point
├── .dockerignore                # Docker ignore file
├── .env                         # Your configuration (DO NOT SHARE!)
├── .env.example                 # Configuration template
├── .gitignore                   # Git ignore file
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Docker image configuration
├── LICENSE.md                   # License file
├── package-lock.json            # Dependency lock file
├── package.json                 # Project metadata and dependencies
└── README.md                    # This file
```

## Security

- Never share or commityour `.env` file
- Never share your `DISCORD_TOKEN` or `TWITCH_CLIENT_SECRET`
- If you accidentally expose a token, regenerate it immediately

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Contributing

Feel free to fork this project and submit pull requests with improvements!