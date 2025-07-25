# Apple MCP tools (Security Enhanced Fork)

This is a security-enhanced fork of the original [apple-mcp](https://github.com/dhravya/apple-mcp) by Dhravya Shah. Check out the original project and supermemory MCP too - https://mcp.supermemory.ai

This is a collection of apple-native tools for the [MCP protocol](https://modelcontextprotocol.com/docs/mcp-protocol) with added security features including input validation, rate limiting, and authentication.


#### Quick install

To install this security-enhanced version of Apple MCP:

For Claude Desktop, edit your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apple-mcp": {
      "command": "npx",
      "args": ["-y", "@chriswritescode-dev/apple-mcp"]
    }
  }
}
```

For Cursor, add to your MCP settings:

```json
{
  "mcpServers": {
    "apple-mcp": {
      "command": "npx",
      "args": ["-y", "@chriswritescode-dev/apple-mcp"]
    }
  }
}
```


## Features

### Core Functionality
- **Messages**:
  - Send messages using the Apple Messages app
  - Read messages with full conversation history
  - Check unread messages
- **Notes**:
  - List all notes
  - Search & read notes in Apple Notes app
  - Create new notes with markdown formatting
- **Contacts**:
  - Search contacts for sending messages
  - Find phone numbers by contact name
- **Emails**:
  - Send emails with multiple recipients (to, cc, bcc)
  - Search emails with custom queries and mailbox selection
  - Check unread email counts globally or per mailbox
  - List mailboxes and email accounts
- **Reminders**:
  - List all reminders and reminder lists
  - Search for reminders by text
  - Create new reminders with optional due dates and notes
  - Open the Reminders app to view specific reminders
- **Calendar**:
  - Search calendar events with customizable date ranges
  - List upcoming events
  - Create new calendar events with details like title, location, and notes
  - Open calendar events in the Calendar app
- **Web Search**:
  - Search the web using DuckDuckGo
  - Retrieve and process content from search results
- **Maps**:
  - Search for locations and addresses
  - Save locations to favorites
  - Get directions between locations
  - Drop pins on the map
  - Create and list guides
  - Add places to guides

### Security Features (New in v0.3.0)
- **Input Validation**: All user inputs validated to prevent injection attacks
- **Rate Limiting**: Prevent abuse with configurable operation limits
- **Authentication**: Optional token-based authentication for production use
- **Audit Logging**: Track all operations for security monitoring
- **Safe Execution**: Protected AppleScript and SQL query execution

- TODO: Search and open photos in Apple Photos app
- TODO: Search and open music in Apple Music app


You can also daisy-chain commands to create a workflow. Like:
"can you please read the note about people i met in the conference, find their contacts and emails, and send them a message saying thank you for the time."

(it works!)


#### Manual installation

You just need bun, install with `brew install oven-sh/bun/bun`

Now, edit your `claude_desktop_config.json` with this:

```json
{
  "mcpServers": {
    "apple-mcp": {
      "command": "bunx",
      "args": ["@chriswritescode-dev/apple-mcp@latest"]
    }
  }
}
```

### Usage

Now, ask Claude to use the `apple-mcp` tool.

```
Can you send a message to John Doe?
```

```
find all the notes related to AI and send it to my girlfriend
```

```
create a reminder to "Buy groceries" for tomorrow at 5pm
```

## Configuration & Security

Apple MCP now includes comprehensive security features to protect your data and prevent abuse. 

### Environment Variables

Create a `.env` file in your project root (or set environment variables) to configure security features:

```bash
# Authentication (optional but recommended for production)
MCP_AUTH_TOKEN=your-secret-token-here

# Rate Limiting (defaults to true)
ENABLE_RATE_LIMITING=true

# Audit Logging (defaults to true)
ENABLE_AUDIT_LOGGING=true

# Limits
MAX_MESSAGE_LENGTH=10000
MAX_SEARCH_RESULTS=100
```

See `.env.example` for a complete list of configuration options.

### Security Features

- **Input Validation**: All inputs are validated to prevent injection attacks
- **Rate Limiting**: Configurable limits to prevent abuse (e.g., 10 messages/minute)
- **Authentication**: Optional token-based authentication for production use
- **Audit Logging**: Track all operations with detailed logs
- **Command Injection Protection**: Safe handling of AppleScript and SQL queries

For detailed security information, see [SECURITY.md](./SECURITY.md).

### Setting up Authentication

For production environments, we strongly recommend enabling authentication:

1. Generate a secure token:
   ```bash
   openssl rand -hex 32
   ```

2. Set the token in your environment:
   ```bash
   export MCP_AUTH_TOKEN=your-generated-token
   ```

3. Configure your MCP client to include the token in requests

## Local Development

```bash
git clone https://github.com/chriswritescode-dev/apple-mcp.git
cd apple-mcp
bun install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your preferred settings

bun run index.ts
```

### Running with Authentication

```bash
# Set auth token for development
export MCP_AUTH_TOKEN=dev-token-123
bun run index.ts
```

## Permissions Required

Apple MCP requires the following macOS permissions:
- **Contacts**: To search and retrieve contact information
- **Messages**: To send and read messages (requires Full Disk Access)
- **Mail**: To send and search emails
- **Notes**: To create and search notes
- **Calendar**: To manage calendar events
- **Reminders**: To create and manage reminders

Grant permissions in System Preferences > Security & Privacy > Privacy.

enjoy!
