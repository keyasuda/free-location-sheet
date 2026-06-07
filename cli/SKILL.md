---
name: free-location-sheet
description: Query and display belongings and storages from a Google Sheets-based home belongings management system via the fls CLI. Use this skill when the user asks about their items, where things are stored, or wants to search/browse their belongings database.
---

# Free Location Sheet CLI (fls)

This skill provides access to the Free Location Sheet database — a home belongings management system backed by Google Spreadsheets. It uses the `fls` CLI (Ruby + rclone) to fetch and query data.

## Prerequisites

- The `fls` CLI must be available at `<PROJECT_ROOT>/cli/fls`
- `rclone` must be configured with access to the Google Drive remote
- Ruby 3.4+ with bundler gems installed under `cli/`

## Initial Setup

Before any query, the rclone remote path must be configured. Run once:

```bash
./cli/fls setup
```

Then enter the rclone path to the spreadsheet (e.g. `drive:/開発・テスト用.xlsx`).

The path is stored at `~/.config/free-location-sheet/config.json` and persisted across sessions.

## Commands

### Search and list belongings

```bash
# List all belongings
./cli/fls belongings

# Search by keyword (matches name and description, AND for multiple words)
./cli/fls belongings KEYWORD

# Show a specific belonging by ID (includes storage info)
./cli/fls belongings --id BELONGING_ID

# List belongings with storage name resolved
./cli/fls belongings --with-storage

# Combine options
./cli/fls belongings --with-storage KEYWORD
```

### Search and list storages

```bash
# List all storages
./cli/fls storages

# Search by keyword (matches name and description)
./cli/fls storages KEYWORD

# Show a specific storage by ID
./cli/fls storages --id STORAGE_ID

# Show a storage with all belongings inside it
./cli/fls storages --id STORAGE_ID --with-belongings
```

### Override remote path temporarily

```bash
./cli/fls belongings --remote "drive:/other-sheet.xlsx" KEYWORD
```

## Data Model

### Belonging

| Field       | Type    | Description                         |
|-------------|---------|-------------------------------------|
| id          | string  | UUID                                |
| name        | string  | Item name                           |
| description | string  | Item description                    |
| quantities  | integer | Quantity                            |
| storageId   | string  | Foreign key to storages (nullable)  |
| printed     | boolean | Whether a label has been printed    |
| deadline    | string  | Deadline in yyyy/MM/dd (nullable)   |

### Storage

| Field       | Type    | Description                      |
|-------------|---------|----------------------------------|
| id          | string  | UUID                             |
| name        | string  | Storage location name            |
| description | string  | Storage description (nullable)   |
| printed     | boolean | Whether a label has been printed |

## Usage Patterns

### When the user asks where an item is

1. Search for the belonging by name: `./cli/fls belongings --with-storage ITEM_NAME`
2. The "Storage" column shows which storage it belongs to

### When the user asks what is in a storage

1. Find the storage: `./cli/fls storages STORAGE_NAME`
2. Get the storage ID from the result
3. List belongings: `./cli/fls storages --id STORAGE_ID --with-belongings`

### When the user asks about items with deadlines

1. List all belongings and scan the Deadline column: `./cli/fls belongings`

## Notes

- Each command invocation fetches the spreadsheet via rclone, so there is network latency
- Keyword search is case-insensitive substring matching
- Multiple keywords are AND-combined (all must match)
- If `--with-storage` shows "(not found)", the belonging's storageId references a storage that doesn't exist in the storages sheet
- The `setup` command is interactive (prompts for input); for non-interactive use, write directly to `~/.config/free-location-sheet/config.json` with format `{"remote_path": "drive:/path.xlsx"}`
