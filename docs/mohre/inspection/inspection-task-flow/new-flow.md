---
title: New Flow — Enums, Youth Logic, and Two Revisits
slug: /inspection/new-flow
sidebar_position: 3
---

# New Flow — Enums, Youth Logic, and Two Revisits

This is the **target flow** with business rules: `tempBlock` and `blocked` are **enums**, two revisits maximum, and special handling for **Youth** companies at temporary block stage.

## Step-by-Step

1. **Inspector** marks result (Not Found / Closed / Fake).
2. **Division Manager** reviews:
    - If rejected → stop/rework.
    - If approved → company is set to `tempBlock` (Youth or Normal).
3. **Revisit rules:**
    - 1st inspection → revisit if Not Found/Closed.
    - 2nd inspection → revisit if Not Found/Closed.
    - 3rd inspection → must mark **Fake** + Report.
4. **HCM** reviews:
    - If approved → company becomes `blocked`.
5. **Worker 1** updates Taziz, applies fines, removes `tempBlock`.
6. **Worker 2** monitors for long-term blocked cases (>40 days).

## Flow (Mermaid)

```mermaid
flowchart TD
  subgraph R1 [Inspector]
    I1[Assign Inspection Task]
    I2{Result?
Not Found / Closed / Fake}
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

  %% Revisit logic
  I1 --> I2
  I2 -- Fake --> F1[Inspector Writes Fake Report]
  F1 --> DM1
  I2 -- Not Found/Closed --> C1[Visit Count +1]
  C1 --> C2{Visit Count <= 2?}
  C2 -- Yes (1st or 2nd) --> DM1
  C2 -- No (3rd) --> FForced[Force Fake Selection\nReport Required]
  FForced --> DM1

  %% DM Approval
  DM1 --> DM2
  DM2 -- Reject --> E0((Stop / Rework))
  DM2 -- Approve --> Y1{Youth Company?}
  Y1 -- Yes --> TB1[Set tempBlock = TEMP_BLOCK_YOUTH]
  Y1 -- No --> TB2[Set tempBlock = TEMP_BLOCK_NORMAL]
  TB1 --> HCM1
  TB2 --> HCM1

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
