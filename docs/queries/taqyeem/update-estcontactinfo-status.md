# Update EstContactInfo Status

## Description
This query updates the status of EstContactInfo records to status code 2 for a specific IPS Request. You can identify the request using either the MB reference number or the IPS Request ID directly.

**Purpose**:
- Update EstContactInfo status code to 2
- Flexible parameter input (MB number or IPS Request ID)
- Returns confirmation of update with affected row count

**Schedule**: On-demand (manual update)

**⚠️ WARNING**: This is a data modification query (UPDATE). Always verify the correct MB number or IPS Request ID before execution to avoid updating wrong records.

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| @mb | NVARCHAR(200) | IPS Request Reference Number (MB number). Set to NULL if using @ipsRequestID instead | N'MB300006482AE' |
| @ipsRequestID | INT | IPS Request ID. Set to NULL if using @mb instead | 12345 |

### Parameter Notes
- **You can use either** `@mb` OR `@ipsRequestID`, not both
- If both are NULL, no update will occur
- If `@mb` is provided and `@ipsRequestID` is NULL, the query will look up the IPSRequestID automatically
- If `@ipsRequestID` is provided, it will be used directly

## Query

```sql
-- Update EstContactInfo status by MB number or IPS Request ID
DECLARE @mb nvarchar(200) = N'MB300006482AE'  -- Set MB number here
DECLARE @ipsRequestID INT = NULL               -- Or set IPS Request ID here

-- Get IPSRequestID if MB number is provided
IF @ipsRequestID IS NULL AND @mb IS NOT NULL
    BEGIN
        SELECT TOP 1 @ipsRequestID = i.IPSRequestID
        FROM IPSRequest i (NOLOCK)
        WHERE i.ReferenceNumber = @mb
    END

-- Perform the update if IPSRequestID is found
IF @ipsRequestID IS NOT NULL
    BEGIN
        UPDATE t
        SET t.StatusCode = 2
        FROM dbo.EstContactInfo t
        WHERE t.IPSRequestID = @ipsRequestID

        SELECT @ipsRequestID AS UpdatedIPSRequestID, @@ROWCOUNT AS RowsAffected
    END
ELSE
    BEGIN
        PRINT 'No IPSRequestID found for the provided parameters'
    END
```

## Output

### Success Case
If the update is successful, returns:

| Column | Description |
|--------|-------------|
| UpdatedIPSRequestID | The IPS Request ID that was updated |
| RowsAffected | Number of EstContactInfo records that were updated |

### Failure Case
If no IPSRequestID is found, prints:
```
No IPSRequestID found for the provided parameters
```

## Status Code Reference

| Status Code | Meaning |
|-------------|---------|
| 2 | (Document the meaning of status code 2 based on your system) |

## Usage Examples

### Example 1: Update using MB Number
```sql
DECLARE @mb nvarchar(200) = N'MB300006482AE'
DECLARE @ipsRequestID INT = NULL
-- ... rest of query
```

### Example 2: Update using IPS Request ID
```sql
DECLARE @mb nvarchar(200) = NULL
DECLARE @ipsRequestID INT = 12345
-- ... rest of query
```

## Pre-Execution Checklist

Before running this update query:

1. ✅ **Verify the MB number or IPS Request ID** is correct
2. ✅ **Check current status** of EstContactInfo records:
   ```sql
   SELECT * FROM dbo.EstContactInfo
   WHERE IPSRequestID = (SELECT IPSRequestID FROM IPSRequest WHERE ReferenceNumber = N'MB300006482AE')
   ```
3. ✅ **Confirm** you intend to set StatusCode to 2 for all matching records
4. ✅ **Backup** or note current values if needed for rollback

## Rollback

If you need to revert the status change, identify the correct status code and run:
```sql
UPDATE dbo.EstContactInfo
SET StatusCode = [PREVIOUS_STATUS_CODE]
WHERE IPSRequestID = [YOUR_IPS_REQUEST_ID]
```

## Notes
- Uses `NOLOCK` hint when looking up IPSRequestID to avoid blocking
- Updates **ALL** EstContactInfo records for the specified IPSRequestID
- Returns `@@ROWCOUNT` to confirm how many records were affected
- If `RowsAffected = 0`, it means no EstContactInfo records exist for that IPSRequestID
- Always verify the MB number before execution to prevent unintended updates