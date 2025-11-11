# Environment Setup Guide

This guide details the steps to obtain all the necessary keys, tokens, and IDs required to populate your `.env` file.

## Required Global Configuration

These values are essential for the bot's core functionality.

### 1. DISCORD_TOKEN

**Create a Discord Bot:**

1.  Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2.  Click **"New Application"** and give it a name (e.g., "Twitch Notifier").
3.  Go to the **"Bot"** tab.
4.  Click **"Reset Token"** and then **"Copy"**.
5.  Paste this value into your `.env` file as `DISCORD_TOKEN`.

**IMPORTANT:** The Token can only be viewed once. Save it immediately! Never share this token publicly!

**Invite the Bot to Your Server:**

1.  Still in the Discord Developer Portal, go to **"OAuth2"** > **"URL Generator"**.
2.  Select scopes:
      * `bot`
3.  Select bot permissions:
      * `Send Messages`
      * `Embed Links`
      * `Mention Everyone`
4.  Copy the generated URL at the bottom.
5.  Open it in your browser and invite the bot to your server.

### 2. TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET

**Create a Twitch Application:**

1.  Go to the [Twitch Developers Console](https://dev.twitch.tv/console).
2.  Click **"Register Your Application"**.
3.  Fill in the form:
      * **Name**: "Discord Bot" (or any descriptive name).
      * **OAuth Redirect URLs**: `http://localhost`
      * **Category**: "Application Integration"
      * **Client Type**: **Confidential**
4.  Click **"Create"**.
5.  Click **"Manage"** for your new application.
6.  Copy the **Client ID** and paste it as `TWITCH_CLIENT_ID` in `.env`.
7.  Click **"New Secret"**, copy the value immediately, and paste it as `TWITCH_CLIENT_SECRET` in `.env`.

**IMPORTANT:** The Client Secret can only be viewed once. Save it immediately! Never share this Client Secret publicly!

### 3. TWITCH_USERNAME

This is simply your Twitch username. It must match the name in your channel URL exactly.

**Example:** If your channel is `twitch.tv/your_amazing_streamer`, then:

```
TWITCH_USERNAME=your_amazing_streamer
```

Use **lowercase** letters only!

## Channel and Feature Configuration

### Finding a Discord Channel ID

You will need the Channel ID for live alerts (`LIVE_NOTIFICATION_CHANNEL_ID`) and for daily clips (`TOP_CLIPS_CHANNEL_ID`).

1.  **Enable Developer Mode in Discord:**
      * Open Discord User Settings.
      * Go to **"Advanced"**.
      * Enable **"Developer Mode"**.
2.  **Get the Channel ID:**
      * Go to your Discord server.
      * Right-click on the destination channel (text channel).
      * Click **"Copy Channel ID"**.
      * Paste this ID into the corresponding variable in your `.env`.

**IMPORTANT:** Ensure your bot has the `Send Messages`, `Embed Links`, and `Mention Everyone` permissions in the selected channel.

### Channel Variables

  * **`LIVE_NOTIFICATION_CHANNEL_ID`**: The ID of the channel where the bot should post **LIVE** stream alerts. Leave blank to **disable** this feature.
  * **`TOP_CLIPS_CHANNEL_ID`**: The ID of the channel where the bot should post the **Top Clips** digest. Leave blank to **disable** this feature.

## Optional Settings

### Global API and Monitoring

These settings control the robustness and frequency of API requests.

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| **`API_MAX_RETRIES`** | Maximum number of retry attempts for failed API requests. | `3` |
| **`API_RETRY_DELAY`** | Delay in milliseconds between retry attempts. | `2000` (2 seconds) |
| **`API_REQUEST_TIMEOUT`** | Maximum time in milliseconds to wait for a Twitch or Discord API response. | `10000` (10 seconds) |

### Feature: Live Notifications

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| **`LIVE_NOTIFICATION_CHECK_INTERVAL`** | Time interval in milliseconds between each stream status check. | `60000` (1 minute) |

### Feature: Daily Top Clips

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| **`TOP_CLIPS_SCHEDULE`** | [Cron expression](https://en.wikipedia.org/wiki/Cron) to schedule the time of the digest post. (Example: `0 20 * * *` = every day at 8:00 PM) | `0 20 * * *` |
| **`TOP_CLIP_COUNT`** | Number of clips to display in the daily digest. | `5` |

## Setup Complete!

**Congratulations!** You have now collected all the necessary credentials and configured your bot's environment variables. You are ready to proceed to the next step: [Running the Bot](../README.md#3-running-the-bot).
