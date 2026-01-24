# AGENTS.md

This file provides context for AI agents working on the "Free Location Sheet" project.

## Project Overview
**Free Location Sheet** is a home belongings management system that uses Google Spreadsheets as its database. It allows users to track items ("belongings") and where they are stored ("storages").

## Technology Stack
- **Frontend**: React 19, Redux Toolkit, Material UI (MUI) v7.
- **Backend**: Ruby (Google Cloud Functions Framework).
- **Database**: Google Sheets (via Google Sheets API v4 and Google Visualization API).
- **Deployment**: Firebase Hosting (frontend), Google Cloud Functions (backend).
- **Build System**: Webpack 5.
- **Testing**: Jest, React Testing Library.

## Directory Structure
- `src/`: Frontend source code.
  - `api/`: API interaction layer.
    - `sheet.ts`: **CRITICAL**. Handles all CRUD operations with Google Sheets. Implements a custom ORM-like layer over the Sheets API.
  - `component/`: React UI components.
  - `state/`: Redux slices and store configuration.
- `backend/`: Backend serverless functions.
  - `app.rb`: Defines the `ichiba_proxy` Cloud Function which searches Rakuten Ichiba for product details (used for barcode scanning).
- `__mocks__/`: Jest mocks.
- `apiTest/`: Integration tests for the API layer.

## Key Concepts & Architecture

### 1. Database (Google Sheets)
The system treats a Google Sheet as a relational database.
- **Tables**: `belongings` and `storages`.
- **Querying**: Uses Google Visualization API Query Language (SQL-like) via `Sheet.query()` in `src/api/sheet.ts`.
- **Updates**: Uses Google Sheets API `batchUpdate` and `values.append`.
- **Schema**:
  The schema for `Belonging` and `Storage` is as follows:

  #### `Belonging`
  | Field       | Type    | Description                            |
  |-------------|---------|----------------------------------------|
  | `row`       | number  | The row number in the Google Sheet.    |
  | `id`        | string  | Unique identifier (UUID).              |
  | `name`      | string  | Name of the item.                      |
  | `description` | string  | Description of the item.               |
  | `quantities`| number  | Quantity of the item.                  |
  | `storageId` | string  | Foreign key to the `storages` table.   |
  | `printed`   | boolean | `true` if a label has been printed.    |
  | `deadline`  | string  | Deadline date in 'yyyy/MM/dd' format.  |

  #### `Storage`
  | Field       | Type    | Description                               |
  |-------------|---------|-------------------------------------------|
  | `row`       | number  | The row number in the Google Sheet.       |
  | `id`        | string  | Unique identifier (UUID).                 |
  | `name`      | string  | Name of the storage location.             |
  | `description` | string  | Description of the storage location.      |
  | `printed`   | boolean | `true` if a label has been printed.       |

### 2. Frontend Architecture
- **State Management**: Redux Toolkit manages the application state (`belongings`, `storages`).
- **Routing**: React Router (`react-router-dom`).
- **Styling**: Emotion (`@emotion/react`) and MUI system.

### 3. Backend Services
- **Ichiba Proxy**: A Ruby function (`backend/app.rb`) that takes an EAN (barcode) and returns product metadata (name, URL) from the Rakuten Web Service API.

## Development Commands
- `npm start`: Start local development server (Webpack Dev Server).
- `npm test`: Run unit tests.
- `npm run api-test`: Run API integration tests.
- `npm run build`: Build for production.
- `npm run deploy`: Deploy to Firebase.

## Common Tasks for Agents
- **Modifying Data Access**: Check `src/api/sheet.ts`. This file manually maps array rows to objects. Ensure index alignment if schema changes.
- **UI Changes**: Components use MUI. Check `src/component/`.
- **Backend Logic**: Modify `backend/app.rb`. This is a stateless function.
