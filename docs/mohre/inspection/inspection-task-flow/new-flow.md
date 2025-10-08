---
title: New Flow — Enums, Youth Logic, and Two Revisits
slug: /inspection/new-flow
sidebar_position: 3
---

# New Flow — Enums, Youth Logic, and Two Revisits

This is the **target flow** with business rules: `tempBlock` and `blocked` are **enums**, two revisits maximum, and special handling for **Youth** companies at temporary block stage.

## Step-by-Step

1.  **Inspector** performs an inspection and marks a result.
2.  **Division Manager Review**: The case is sent to the Division Manager for review.
3.  **DM Decision & Actions**:
    -   If the DM **rejects** the case → process stops or is sent for rework.
    -   If the DM **approves** the case:
        1.  The company is set to `tempBlock` (with special handling for `Youth` companies).
        2.  A **notification is sent** to the company owners.
4.  **Post-Approval Flow**:
    -   **For "Fake" reports**: The case moves to the **HCM** for final review.
    -   **For "Not Found / Closed" (1st/2nd visit)**: A **revisit is scheduled**, and the inspection flow begins again.
5.  **HCM Review (for Fake Reports only):**
    -   If approved → company becomes `blocked`.
6.  **Worker 1** updates Taziz, applies fines, removes `tempBlock`.
7.  **Worker 2** monitors for long-term blocked cases (>40 days).

## Flow (Mermaid)

```mermaid
flowchart TD
  subgraph R1 [Inspector]
    I1[Assign Inspection Task]
    I2{Result?
Not Found / Closed / Fake}
  end

  subgraph System [System Action]
    SN1["Send Notification to Owners\n(SMS & Email, template per result)"]
  end

  subgraph R2 [Division Manager]
    DM1[Review]
    DM2{Approve?}
  end

  subgraph R3 [HCM]
    HCM1[Review]
    HCM2{Approve?}
  end

  subgraph R4 [Workers]
    W1[Worker: Update Taziz, Apply Fines, Remove tempBlock]
    W2[Worker: Monitor Blocked >40 Days\nNo Prosecution Petition -> Create Investigation Task]
  end

  %% Revisit and Fake Report Paths
  I1 --> I2
  I2 -- Fake --> F1[Inspector Writes Fake Report]
  F1 --> DM1
  I2 -- Not Found/Closed --> C1[Visit Count +1]
  C1 --> C2{Visit Count <= 2?}
  C2 -- Yes (1st or 2nd) --> DM1
  C2 -- No (3rd) --> FForced[Force Fake Selection\nReport Required]
  FForced --> DM1

  %% DM Approval Logic
  DM1 --> DM2
  DM2 -- Reject --> E0((Stop / Rework))
  DM2 -- Approve --> Y1{Youth Company?}

  %% Post-Approval Actions
  Y1 -- Yes --> TB1[Set tempBlock = TEMP_BLOCK_YOUTH]
  Y1 -- No --> TB2[Set tempBlock = TEMP_BLOCK_NORMAL]
  
  TB1 --> SN1
  TB2 --> SN1

  %% Post-Notification Decision
  SN1 --> DecisionNode{Is reported As Fake?}
  DecisionNode -- Yes --> HCM1
  DecisionNode -- No (Revisit Approved) --> I1

  %% HCM Approval
  HCM1 --> HCM2
  HCM2 -- Reject --> E1((Stop / Rework))
  HCM2 -- Approve --> B1[Set status = blocked]
  B1 --> W1 --> E2((End))

  %% Monitoring worker
  B1 -.-> W2
```

## Enum States

- `tempBlock` ∈ { `TEMP_BLOCK_YOUTH`, `TEMP_BLOCK_NORMAL` }
- `blocked` is the final permanent state set after HCM approval.
