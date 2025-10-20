# Closed NotFound Timeout Troubleshooting Query

## Description
This query helps troubleshoot timeout issues that occur when evaluators (المقيم) attempt to close transactions with "closedNotFound" status.

**Problem**: When an evaluator tries to complete a transaction (معامل) with `closedNotFound`, sometimes a timeout occurs. This causes the transaction to partially process - it passes through some stored procedures successfully but fails on others, leaving the transaction in an incomplete state.

**Symptoms:**
- Transaction shows as completed by evaluators, but there are no logs for completion actions
- Only the initial transaction start log exists, no completion logs
- The request notes box doesn't appear (requires request status update which didn't happen due to error)
- The `closedNotFound` notes data was inserted into the database but the status wasn't updated properly
- Center cannot approve or reject the transaction - system asks to verify evaluator data

**Purpose**:
- Verify if the evaluator was actually attempting to perform `closedNotFound` action
- Retrieve SQLErrorLog to identify timeout errors during task completion
- Extract stored procedure execution details with parameters for manual re-execution

**Schedule**: On-demand (troubleshooting)

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| @mb | NVARCHAR(200) | IPS Request Reference Number (معاملة رقم) | N'MB295299739AE' |

### Additional Variables
The query declares additional variables that are populated during execution:
- `@tasknumber`: Task ID associated with the reference number
- `@evalutorID`, `@evlautorname`, `@notes`, `@long`, `@lat`: Evaluator details and notes

## Query

```sql
DECLARE @mb nvarchar(200) =  N'MB295299739AE'
DECLARE @tasknumber BIGINT , @evalutorID int  , @evlautorname nvarchar(4000)
   ,@notes nvarchar(4000)
   ,@long nvarchar(4000) , @lat nvarchar(4000)


SELECT FORMAT(CAST(tenf.RejectDateTime AS DATETIME), N'dd/MM/yyy HH:mm') AS RejectDateTime,
       tenf.Notes,
       nfc.NotFoundCodeNameAR,
       tenf.CreatedBy
FROM dbo.TaskEsatblishmentNotFound tenf(NOLOCK)
     INNER JOIN dbo.NotFoundCodes nfc(NOLOCK) ON tenf.NotFoundCodeID = nfc.NotFoundCodeID
     inner join dbo.IPSRequest AS i(NOLOCK)ON tenf.IPSRequestID = i.IPSRequestID

WHERE (i. ReferenceNumber= @mb)
      AND tenf.DeletedBy IS NULL
      AND tenf.DeletedAt IS NULL
      AND nfc.isActive = 1 AND nfc.DeletedBy IS NULL
    --  AND ISNULL(i.NotFoundCode,0) != 0

ORDER BY tenf.CreatedAt DESC;

SELECT TOP 1 @tasknumber = t.TaskID FROM Task t
inner JOIN TaqeemRequest tr ON t.TaqeemRequestID = tr.RequestID
INNER JOIN IPSRequest i ON tr.IPSRequestID = i.IPSRequestID
WHERE i.ReferenceNumber = @mb

--SELECT @tasknumber AS tasknumber
SELECT top 100  sl.ExecutionCode,* FROM  SQLErrorLog sl  (nolock)
WHERE sl.ExecutionCode LIKE N'%'+ convert(nvarchar(100) , @tasknumber , 10)   +'%'

order BY sl.SQLErrorLogID DESC
```

## Output

### First Result Set: NotFound Details
Verifies if the evaluator was attempting to close the transaction as "NotFound"

| Column | Description |
|--------|-------------|
| RejectDateTime | Date and time when rejection/not found was recorded (formatted as dd/MM/yyyy HH:mm) |
| Notes | Notes entered by the evaluator |
| NotFoundCodeNameAR | Not found code name in Arabic |
| CreatedBy | User who created the record (evaluator ID) |

### Second Result Set: Task Number
Retrieves the Task ID for the reference number (stored in `@tasknumber` variable)

### Third Result Set: SQL Error Logs
Shows recent SQL errors related to this task

| Column | Description |
|--------|-------------|
| ExecutionCode | Stored procedure name and parameters that were being executed when error occurred |
| * | All other columns from SQLErrorLog table including error message, timestamp, etc. |

## Troubleshooting Steps

1. **Run the query** with the problematic reference number (@mb)

2. **Check first result set**:
   - Confirms the evaluator attempted `closedNotFound` action
   - Shows what notes/code were entered

3. **Check third result set** (SQLErrorLog):
   - Look for timeout errors
   - Identify which stored procedure failed

4. **Fix the issue**:
   - From the `ExecutionCode` column, extract the stored procedure and parameters
   - **Important**: Parameters in ExecutionCode are not comma-separated - you must format them properly
   - **Important**: Arabic text parameters must be prefixed with `N` (e.g., N'النص العربي')
   - Manually re-run the stored procedure with corrected parameters

5. **Verify the fix**:
   - Check that transaction status is updated
   - Verify logs are created
   - Confirm the request notes box now appears

## Example Problem Case

**Transaction**: MB295925811AE

**Issue**:
- Cannot be approved by center
- Evaluator and center actions don't appear
- Center cannot accept or reject
- System requests verification of evaluator data

**Root Cause**:
- Transaction shows as completed by evaluators
- No completion action logs found (only initial start log)
- Request notes box doesn't appear (status update didn't occur)
- `closedNotFound` notes were inserted but transaction status wasn't updated due to timeout

## Notes
- Uses `NOLOCK` hints for read operations to avoid blocking
- Returns top 100 error logs to limit result set
- The `ExecutionCode` column contains the full stored procedure call with parameters
- When re-executing stored procedures from `ExecutionCode`, ensure:
  - Parameters are properly comma-separated
  - Arabic text is prefixed with N
  - Parameter types match expected types
- This is a diagnostic query - actual fixes require manual stored procedure re-execution