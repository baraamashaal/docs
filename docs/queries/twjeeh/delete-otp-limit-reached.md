# Delete OTP - Reset OTP Limit

## Description
This stored procedure deletes OTP records for a user who has reached the allowed OTP limit in the Tawjeeh self-service system.

**Problem**: Users receive an error message "Allowed OTP limit reached" when trying to request a new OTP. This prevents them from accessing the system even though the OTP may have been sent successfully.

**Solution**: Execute the `DeleteOTP` stored procedure to clear the OTP records for the user's mobile number, allowing them to request a new OTP.

**Purpose**:
- Reset OTP limit for users who have exceeded allowed attempts
- Clear OTP records from the system
- Allow users to request new OTP after limit is reached

**Schedule**: On-demand (support request)

**⚠️ WARNING**: Only delete OTP records when users legitimately cannot receive or use their OTP. Verify the mobile number before execution.

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| @Mobile | VARCHAR | User's mobile phone number | '0547225593' |
| @DeletedBy | INT | User ID of the support staff performing the deletion | 475 |

### Parameter Notes
- **@Mobile**: Must be the exact mobile number registered in the system
  - Include country code if applicable
  - No spaces or special characters (depends on system format)
- **@DeletedBy**: Should be the ID of the support staff member executing this action for audit purposes

## Query

```sql
exec DeleteOTP @Mobile = '0547225593', @DeletedBy = 475
```

## Error Scenario

### User sees this error:

**Error Message**: "Allowed OTP limit reached"

**Visual Example**: The Tawjeeh mobile app displays a modal dialog with:
- A pink/red circular icon with an exclamation mark (!)
- Message: "Allowed OTP limit reached"
- An "Okay" button in pink/red color
- Language selection screen visible in the background (عربي, English, اردو, etc.)

**When it occurs**:
- User has requested OTP multiple times
- System limit for OTP requests has been exceeded
- User cannot proceed with login/authentication

## Usage Example

### Scenario 1: User reports OTP limit reached
```sql
-- User with mobile 0547225593 reports they cannot get OTP
-- Support staff ID 475 is handling the request
exec DeleteOTP @Mobile = '0547225593', @DeletedBy = 475
```

### Scenario 2: Before deleting, verify the mobile number
```sql
-- First, check if OTP records exist for this mobile
SELECT * FROM OTP WHERE Mobile = '0547225593'

-- Then delete if confirmed
exec DeleteOTP @Mobile = '0547225593', @DeletedBy = 475
```

## Pre-Execution Checklist

Before running this procedure:

1. ✅ **Verify the mobile number** with the user
2. ✅ **Confirm** the user is experiencing "Allowed OTP limit reached" error
3. ✅ **Record** your user ID for the @DeletedBy parameter
4. ✅ **Check** if there are existing OTP records:
   ```sql
   SELECT * FROM OTP WHERE Mobile = '0547225593'
   ```
5. ✅ **Inform the user** to try requesting OTP again after deletion

## Post-Execution Steps

After executing the deletion:

1. Inform the user that the OTP limit has been reset
2. Ask the user to request a new OTP
3. Verify that the user can successfully receive and use the new OTP
4. Document the support ticket with the action taken

## Troubleshooting

### If the error persists after deletion:
- Check if there are multiple mobile number formats in the system (with/without country code)
- Verify the mobile number is correct
- Check if there are system-level rate limiting rules
- Review application logs for other blocking issues

### If user still doesn't receive OTP:
- Verify mobile number is active and can receive SMS
- Check SMS gateway logs
- Verify the mobile number is correctly registered in the user's profile

## Notes
- This procedure deletes OTP records, not user accounts
- The deletion is logged with the @DeletedBy parameter for audit trail
- After deletion, user must request a new OTP - old OTPs will be invalid
- Common use case: Users request OTP multiple times without checking SMS, reaching the limit
- Always verify the mobile number before deletion to avoid affecting wrong users
- Document all OTP deletions in support tickets for tracking

## Related System
**Application**: Tawjeeh (توجيه) Self-Service System
**Module**: OTP Authentication
**Affected Users**: Mobile app users attempting to login/authenticate