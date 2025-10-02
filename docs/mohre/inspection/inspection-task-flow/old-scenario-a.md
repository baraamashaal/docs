---
title: Inspection Task Flows
slug: /inspection/flows
sidebar_position: 1
---

# 📘 Inspection Task Flow Documentation

This documentation describes both the **old process flows** (two scenarios) and the **new flow** with updated business rules.  
It includes **detailed written explanations** and **Mermaid diagrams** for clarity.

---

## 1. Old Flow (Legacy)

### Overview
- Inspector performs an inspection.
- Depending on the result, the case flows through **Division Manager → Investigator → Happiness Center Manager → Worker**.
- Two possible variants existed:
    - **Scenario A:** Blocking happens **immediately after Investigator approval**, before HCM approval.
    - **Scenario B:** Blocking happens **only after HCM approval**.

---

### Scenario A — Direct Blocking after Investigator

**Flow:**
1. Inspector inspects and reports result.
2. Division Manager reviews and approves.
3. Investigator prepares and approves a prosecution petition.
4. Company is immediately **blocked**.
5. Happiness Center Manager (HCM) confirms.
6. Worker checks approval + block, then updates **Taziz** and applies fines.

**Mermaid Diagram:**

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
    W1[Check: HCM Approved & Company Blocked]
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
  INV2 -- Approve --> B1[Immediately Block Company]
  B1 --> HCM1
  HCM1 --> HCM1A
  HCM1A -- Reject --> E3((Unblock / Rework))
  HCM1A -- Approve --> W1
  W1 --> W2 --> E4((End))
