```mermaid
flowchart TD
  A[Start] --> B{Pick Docusaurus}
  B -->|Yes| C[Deploy to GitHub Pages]
  B -->|Still thinking| D[Compare with MkDocs]