---
title: Old vs New Inspection Flow Scenarios
slug: /inspection/old-vs-new
sidebar_position: 1
---

# 📌 Old vs New Inspection Flow Scenarios

This document serves as a **clear reference** to distinguish between the old inspection task flows (legacy) and the new target flow.  
You can reuse this description in prompts or documentation whenever needed.

---

## 🕑 Old Flow (Legacy)

### Common Steps
1. **Inspector** marks result: *Not Found*, *Closed*, or *Fake*.
2. **Division Manager** reviews.
3. If approved → goes to **Investigator**.
4. **Investigator** prepares prosecution petition and approves.

### Variations
- **Scenario A (Direct Block)**
    - Company is blocked **immediately after Investigator approval**.
    - Then goes to **Happiness Center Manager (HCM)**.
    - Worker checks approvals, updates **Taziz**, and applies fines.

- **Scenario B (HCM Before Block)**
    - Investigator approval sends case to **HCM first**.
    - If HCM approves → company is blocked.
    - Worker updates **Taziz** and applies fines.

---

## 🚀 New Flow (Target Business Process)

### Key Changes
- **Investigator step removed** from the main flow.
- **Division Manager approval always sets a Temporary Block (`tempBlock`)**:
    - `TEMP_BLOCK_YOUTH` if the company has youth flag.
    - `TEMP_BLOCK_NORMAL` otherwise.

### Revisit Rules
- **1st & 2nd inspections** → *Not Found/Closed* allowed → revisit scheduled.
- **3rd inspection** → *Not Found/Closed* disabled → Inspector must select **Fake** with a **Report**.

### Approval & Workers
1. After DM approves → case goes directly to **HCM**.
2. If HCM approves → status set to **`blocked`**.
3. **Worker 1**: Updates **Taziz**, applies fines, removes `tempBlock`.
4. **Worker 2**: Monitors companies blocked >40 days without prosecution petition → creates **Investigation Task** for Investigator.

---

## 🎯 Enum States
- `tempBlock` ∈ { `TEMP_BLOCK_YOUTH`, `TEMP_BLOCK_NORMAL` }
- `blocked` = final permanent state set after HCM approval.

---

✅ Use this page as a **prompt reference** or documentation baseline when working with inspection task flows.  
