# Queries Domain

This domain contains database queries and scripts organized by their respective systems and purposes.

## Structure

The queries domain is organized into the following subdirectories:

- **oracle**: Oracle database queries
- **labour-accommodations**: Labour accommodations related queries
- **inspection**: Inspection related queries
- **twjeeh**: Twjeeh system queries
- **taqyeem**: Taqyeem system queries

## Query Documentation Standard

Each query file should follow this standard format:

### 1. Title
A clear, descriptive title for the query

### 2. Description
- Purpose of the query
- When it should be executed (e.g., monthly, on-demand)
- What data it retrieves or processes

### 3. Parameters
List all parameters with:
- Parameter name
- Data type
- Description
- Example value

### 4. Query
The actual SQL query or script

## Example Format

```markdown
# Query Title

## Description
Brief description of what this query does and when it should be run.

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| :PARAM_NAME | VARCHAR2 | Description of parameter | 'example_value' |
| :PARAM_NUM | NUMBER | Description of number param | 100 |

## Query

```sql
SELECT * FROM table_name WHERE column = :PARAM_NAME;
```
```

## Contributing

When adding a new query:
1. Place it in the appropriate subdirectory
2. Follow the documentation standard above
3. Include all required parameters with clear examples
4. Add comments in complex queries for clarity