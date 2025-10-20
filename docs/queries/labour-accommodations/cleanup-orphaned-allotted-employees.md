# Cleanup Orphaned Allotted Employees

## Description
This script cleans up orphaned employee room allocations that occur when a quota (LaQuotationRequest) is deleted manually from the system while it still has employees allotted to it.

**Problem**: When a quota gets deleted manually from the system, the employees that were allotted to that quota remain in the `LaAllottedEmployeesRooms` table. This creates orphaned records where employees are assigned to non-existent quotas, causing data integrity issues.

**Solution**: This script identifies orphaned employee allocations, moves them to the history table with proper audit trail, and then removes them from the active table.

**Purpose**:
- Identify employee allocations linked to deleted quotas
- Preserve orphaned records in history table for audit
- Clean up orphaned records from active table
- Maintain data integrity in Labour Accommodation system

**Schedule**: On-demand (maintenance/troubleshooting)

**⚠️ WARNING**: This script performs DELETE operations. Always verify the records to be deleted before execution. Run the SELECT statement first to review affected records.

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| @ExecutionDateTime | DATETIME | UTC timestamp of when the script is executed (automatically set) | GETUTCDATE() |
| @companyCode | INT | Company code to filter specific company. Set to NULL to process all companies | 819198 |

### Parameter Notes
- **@ExecutionDateTime**: Automatically set to current UTC time, used for audit trail
- **@companyCode**:
  - Set to a specific company code to clean up only that company's orphaned records
  - Set to NULL to process all companies with orphaned records
  - Useful for testing on a single company first before running for all

## Query

```sql
DECLARE @ExecutionDateTime DATETIME = GETUTCDATE();
declare @companyCode int = 819198



IF OBJECT_ID('tempdb..#to_purge') IS NOT NULL DROP TABLE #to_purge;

SELECT
    laer.LaAllotedEmployeeRoomId,
    laer.LaQuotationRequestId,
    laer.FacilityRowId,
    laer.FacilityRoomId,
    laer.EmployeeLabourCardNo,
    laer.EmployeePersonCode,
    laer.EmployeeSalary,
    laer.SalaryIndicatorValue,
    laer.IsEmployeeInjured,
    laer.LastInjuryDate,
    laer.CreatedBy,
    laer.CreatedAt,
    LQRH.DeletedBy,
    LQRH.DeletedAt,
    lqrh.CompanyCode
INTO #to_purge
FROM la.LaAllottedEmployeesRooms LAER (NOLOCK)
         inner JOIN la.LaQuotationRequestsHistory LQRH  (NOLOCK) on LAER.LaQuotationRequestId = LQRH.LaQuotationRequestId and LQRH.DeletedBy is not null and LQRH.UpdatedBy is null
         LEFT JOIN la.LaQuotationRequests LQR  (NOLOCK)
                   ON LAER.LaQuotationRequestId = LQR.LaQuotationRequestId
WHERE LQR.LaQuotationRequestId IS NULL
  AND (@companyCode IS NULL OR lqrh.CompanyCode = @companyCode);

-- SELECT * FROM #to_purge (NOLOCK)

INSERT INTO la.LaAllottedEmployeesRoomsHistory
(
    LaAllotedEmployeeRoomId,
    LaQuotationRequestId,
    FacilityRowId,
    FacilityRoomId,
    EmployeeLabourCardNo,
    EmployeePersonCode,
    EmployeeSalary,
    SalaryIndicatorValue,
    IsEmployeeInjured,
    LastInjuryDate,
    CreatedBy,
    CreatedAt,
    DeletedBy,
    DeletedAt
)
SELECT LaAllotedEmployeeRoomId
     ,LaQuotationRequestId
     ,FacilityRowId
     ,FacilityRoomId
     ,EmployeeLabourCardNo
     ,EmployeePersonCode
     ,EmployeeSalary
     ,SalaryIndicatorValue
     ,IsEmployeeInjured
     ,LastInjuryDate
     ,CreatedBy
     ,CreatedAt
     ,DeletedBy --SystemAppUserId
     ,DeletedAt
FROM #to_purge;

-- Delete Alloted Employees from Expired La Quotation Requests
DELETE laer
FROM la.LaAllottedEmployeesRooms AS laer
         INNER JOIN #to_purge p
                    ON p.EmployeeLabourCardNo = laer.EmployeeLabourCardNo;


IF OBJECT_ID('tempdb..#to_purge') IS NOT NULL DROP TABLE #to_purge;
```

## How It Works

### Step 1: Identify Orphaned Records
Creates a temporary table `#to_purge` containing:
- Employee room allocations that exist in `LaAllottedEmployeesRooms`
- Where the associated quota exists in `LaQuotationRequestsHistory` (deleted)
- But does NOT exist in `LaQuotationRequests` (active quotas)

### Step 2: Archive to History
Inserts all identified orphaned records into `LaAllottedEmployeesRoomsHistory` table with:
- Original creation details preserved
- Deletion audit trail from the quota history

### Step 3: Delete Orphaned Records
Removes the orphaned employee allocations from the active `LaAllottedEmployeesRooms` table

### Step 4: Cleanup
Drops the temporary table

## Pre-Execution Checklist

Before running this script:

1. ✅ **Review affected records** - Uncomment and run the SELECT statement:
   ```sql
   SELECT * FROM #to_purge (NOLOCK)
   ```
   Review the records that will be deleted to ensure they are indeed orphaned

2. ✅ **Test on specific company** - Set `@companyCode` to a specific company for testing:
   ```sql
   declare @companyCode int = 819198  -- Test with specific company first
   ```

3. ✅ **Verify quota deletion** - Confirm the quotas were intentionally deleted:
   ```sql
   SELECT * FROM la.LaQuotationRequestsHistory
   WHERE CompanyCode = 819198 AND DeletedBy IS NOT NULL
   ```

4. ✅ **Check record counts**:
   ```sql
   SELECT COUNT(*) FROM #to_purge
   ```

5. ✅ **Backup** - Consider backing up affected tables if processing large volumes

## Usage Examples

### Example 1: Test run for specific company
```sql
-- Set specific company to test
DECLARE @ExecutionDateTime DATETIME = GETUTCDATE();
declare @companyCode int = 819198

-- Run the script with SELECT uncommented to review first
-- SELECT * FROM #to_purge (NOLOCK)
```

### Example 2: Process all companies
```sql
-- Set to NULL to process all companies with orphaned records
DECLARE @ExecutionDateTime DATETIME = GETUTCDATE();
declare @companyCode int = NULL

-- Run the full script
```

### Example 3: Count orphaned records before cleanup
```sql
-- Check how many records will be affected
DECLARE @companyCode int = 819198

SELECT
    lqrh.CompanyCode,
    COUNT(*) AS OrphanedEmployeeCount
FROM la.LaAllottedEmployeesRooms LAER (NOLOCK)
INNER JOIN la.LaQuotationRequestsHistory LQRH (NOLOCK)
    ON LAER.LaQuotationRequestId = LQRH.LaQuotationRequestId
    AND LQRH.DeletedBy IS NOT NULL
    AND LQRH.UpdatedBy IS NULL
LEFT JOIN la.LaQuotationRequests LQR (NOLOCK)
    ON LAER.LaQuotationRequestId = LQR.LaQuotationRequestId
WHERE LQR.LaQuotationRequestId IS NULL
  AND (@companyCode IS NULL OR lqrh.CompanyCode = @companyCode)
GROUP BY lqrh.CompanyCode
```

## Post-Execution Verification

After running the script:

1. **Verify history records** were created:
   ```sql
   SELECT * FROM la.LaAllottedEmployeesRoomsHistory
   WHERE DeletedAt >= @ExecutionDateTime
   ORDER BY DeletedAt DESC
   ```

2. **Verify orphaned records** were removed:
   ```sql
   -- This should return 0 rows for the processed company
   SELECT COUNT(*) FROM la.LaAllottedEmployeesRooms LAER
   LEFT JOIN la.LaQuotationRequests LQR
       ON LAER.LaQuotationRequestId = LQR.LaQuotationRequestId
   WHERE LQR.LaQuotationRequestId IS NULL
     AND EXISTS (
         SELECT 1 FROM la.LaQuotationRequestsHistory LQRH
         WHERE LQRH.LaQuotationRequestId = LAER.LaQuotationRequestId
           AND LQRH.CompanyCode = @companyCode
     )
   ```

3. **Document** the cleanup action in support tickets/logs

## Troubleshooting

### If orphaned records remain after execution:
- Check if there are multiple quota requests for the same employee
- Verify the company code parameter is correct
- Check if quotas were soft-deleted vs hard-deleted
- Review the join conditions in the query

### If too many records are being deleted:
- Verify the quota was actually deleted and not just modified
- Check the `LQRH.UpdatedBy IS NULL` condition - this ensures only deleted records, not updated ones
- Test with a specific company code first

## Root Cause Prevention

**Why does this problem occur?**
- Manual quota deletions without proper cascade handling
- Direct database operations bypassing application business logic
- Lack of referential integrity constraints

**Prevention:**
- Always use application functions to delete quotas
- Implement proper CASCADE DELETE or business logic to handle employee allocations
- Add database triggers or constraints to prevent orphaned records

## Notes
- Uses `NOLOCK` hints for read operations to avoid blocking
- Preserves complete audit trail in history table
- Temporary table `#to_purge` is used to ensure consistency between operations
- Script is idempotent - safe to run multiple times
- Only processes quotas that were deleted (DeletedBy IS NOT NULL) but not updated (UpdatedBy IS NULL)
- Deletion is based on EmployeeLabourCardNo to ensure all allocations for the employee are removed
- Always test with a specific company code before running for all companies

## Related Tables
- `la.LaAllottedEmployeesRooms` - Active employee room allocations
- `la.LaAllottedEmployeesRoomsHistory` - Historical employee room allocations
- `la.LaQuotationRequests` - Active quota requests
- `la.LaQuotationRequestsHistory` - Historical/deleted quota requests