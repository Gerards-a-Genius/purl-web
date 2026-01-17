# Pattern Repository MCP Server

An MCP (Model Context Protocol) server that provides Claude with access to the knitting/crochet pattern repository.

## Features

### Tools

| Tool | Description |
|------|-------------|
| `search_patterns` | Search patterns by keyword, technique, or attributes |
| `get_pattern` | Get full details for a specific pattern |
| `list_techniques` | List all techniques used across patterns |
| `get_repository_stats` | Get repository statistics |
| `get_similar_patterns` | Find patterns similar to a given pattern |

### Resources

| Resource | Description |
|----------|-------------|
| `pattern://catalog` | Master catalog of all patterns |
| `pattern://techniques` | Technique taxonomy |
| `pattern://stats` | Repository statistics |

## Installation

```bash
cd mcp-pattern-server
npm install
npm run build
```

## Usage with Claude Code

Add to your Claude Code MCP settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "pattern-repository": {
      "command": "node",
      "args": ["/Users/gerardmartelly/pattern-repository/mcp-pattern-server/dist/index.js"]
    }
  }
}
```

Or for development:

```json
{
  "mcpServers": {
    "pattern-repository": {
      "command": "npx",
      "args": ["tsx", "/Users/gerardmartelly/pattern-repository/mcp-pattern-server/src/index.ts"]
    }
  }
}
```

## Example Queries

Once connected, Claude can use queries like:

- "Search for beginner colorwork patterns"
- "Show me the details for pattern [id]"
- "What techniques are most common in the repository?"
- "Find patterns similar to [id]"

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```
