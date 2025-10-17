# Project Structure and Instructions

## Overview
This is a Docusaurus-based documentation site for MOHRE (Ministry of Human Resources and Emiratisation) systems and queries.

## Directory Structure

### Main Documentation (`docs/`)
The main documentation is organized into several domains:

#### 1. MOHRE Domain (`docs/mohre/`)
Contains documentation for MOHRE-specific processes and workflows:
- `inspection/`: Inspection-related documentation and workflows

#### 2. Queries Domain (`docs/queries/`)
Contains database queries and scripts organized by system. Each query should include:
- **Title**: Clear, descriptive name
- **Description**: Purpose, schedule, and what data it retrieves
- **Parameters**: Name, type, description, and example values
- **Query**: The actual SQL script

##### Query Subdirectories:
- `oracle/`: Oracle database queries
- `labour-accommodations/`: Labour accommodations related queries
- `inspection/`: Inspection related queries
- `twjeeh/`: Twjeeh system queries
- `taqyeem/`: Taqyeem system queries

See `docs/queries/README.md` for detailed query documentation standards.

#### 3. Tutorial Content (`docs/tutorial-basics/`, `docs/tutorial-extras/`)
Standard Docusaurus tutorial content

### Source Code (`src/`)
React components and custom pages for the Docusaurus site

### Static Assets (`static/`)
Static files like images, CSS, and other assets

### Blog (`blog/`)
Blog posts and articles

## Query Documentation Standard

When adding new queries to the `docs/queries/` domain:

1. Place the query in the appropriate subdirectory based on the system (oracle, labour-accommodations, etc.)
2. Follow the standard format:
   - Title with English and Arabic names (if applicable)
   - Description including schedule (e.g., "Run on 19th of each month")
   - Parameter table with name, type, description, and examples
   - The SQL query with proper formatting
   - Output columns description
   - Additional notes if needed

3. Example structure:
```markdown
# Query Title (Arabic Name)

## Description
What the query does and when to run it

## Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|

## Query
```sql
-- SQL here
```

## Output Columns
Description of output

## Notes
Additional information
```

## Development

### Installation
```bash
npm install
```

### Local Development
```bash
npm start
```

### Build
```bash
npm run build
```

### Deployment
Automated deployment via GitHub Actions to GitHub Pages

## Firebase Authentication
The project includes Firebase authentication with role-based access and invitation system. See:
- `FIREBASE_SETUP.md` for Firebase configuration
- `INVITATION_SYSTEM_SETUP.md` for invitation system details

## Adding New Content

### Adding a New Query
1. Navigate to the appropriate subdirectory in `docs/queries/`
2. Create a new `.md` file with a descriptive name (e.g., `late-wages.md`)
3. Follow the query documentation standard (see above)
4. Include all parameters with types and examples
5. Add execution schedule if applicable

### Adding New Documentation
1. Create a `.md` file in the appropriate domain directory
2. Update `sidebars.ts` if you want it to appear in the navigation
3. Follow Docusaurus markdown syntax

## Important Files
- `docusaurus.config.ts`: Main configuration file
- `sidebars.ts`: Sidebar navigation configuration
- `.env`: Environment variables (not committed to git)
- `.env.example`: Example environment variables template