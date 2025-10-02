---
title: Old Flow — Scenario B (HCM Approval Before Blocking)
slug: /inspection/old-scenario-b
sidebar_position: 2
---

# Old Flow — Scenario B (HCM Approval Before Blocking)

This scenario reflects the legacy behavior where the **Investigator approval does not block the company immediately**.  
Instead, the case is sent to the **Happiness Center Manager (HCM)** first. Only after HCM approves does the system block the company. After blocking, the **Worker** updates Taziz and applies fines.

---

## Step-by-Step Flow

1. **Inspector** conducts an inspection.
    - If compliant → process ends.
    - If marked *Not Found*, *Closed*, or *Fake* → goes to Division Manager.

2. **Division Manager** reviews.
    - If rejected → process stops/rework.
    - If approved → passes case to Investigator.

3. **Investigator** prepares and reviews prosecution petition.
    - If rejected → process stops/rework.
    - If approved → passes case to HCM.

4. **Happiness Center Manager (HCM)** reviews.
    - If rejected → process stops/rework.
    - If approved → **company is blocked**.

5. **Worker** executes background updates:
    - Updates Taziz system with blocked status.
    - Applies fines to the company.

---

## Mermaid Diagram

```mermaid
flowchart TD
  subgraph L1[Inspector]
    I1[Assign Inspection Task]
    I2{Mark Result?\nNot Found / Closed / Fake / Compliant}
  end

  subgraph L2[Division Manager]
    DM1[Review]
    DM1A{Approve?}
  end

  subgraph L3[Investigator]
    INV1[Prepare Prosecution Petition]
    INV2{Approve Petition?}
  end

  subgraph L4[Happiness Center Manager]
    HCM1[Review]
    HCM1A{Approve?}
  end

  subgraph L5[Worker]
    W2[Update Taziz: Blocked + Apply Fines]
  end

  I1 --> I2
  I2 -- Compliant --> E0((End))
  I2 -- Not Found/Closed/Fake --> DM1
  DM1 --> DM1A
  DM1A -- Reject --> E1((Stop / Rework))
  DM1A -- Approve --> INV1
  INV1 --> INV2
  INV2 -- Reject --> E2((Stop / Rework))
  INV2 -- Approve --> HCM1
  HCM1 --> HCM1A
  HCM1A -- Reject --> E3((Stop / Rework))
  HCM1A -- Approve --> B1[Block Company]
  B1 --> W2 --> E4((End))
