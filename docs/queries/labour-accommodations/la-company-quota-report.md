# Labour Accommodation Company Quota Report

## Description
This query retrieves a comprehensive report of labour accommodations along with their associated companies and quota information. It shows both individual company quotas and total labour accommodation capacity utilization.

**Purpose**: Generate a detailed report showing:
- Labour accommodation details
- Companies associated with each LA
- Individual company quota allocation and consumption
- Total LA quota and consumption aggregates

**Schedule**: On-demand

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| LaRegistrationId (IN clause) | VARCHAR | List of Labour Accommodation Registration IDs to include in the report | 'LA000023743', 'LA000023782', etc. |

### Parameter Notes
- The query uses a hardcoded IN clause with specific LaRegistrationId values
- To use this query, replace the list in the WHERE clause with the desired LA registration IDs
- The list can contain one or multiple LA registration IDs

## Query

```sql
WITH Q AS (SELECT LA.LaRegistrationId,
                  LA.LaName,
                  LQR.CompanyCode,
                  COALESCE(CL.COM_NAME_ARB, CL.COM_NAME_ENG) AS CompanyName,
                  LQR.ContractStartDate,
                  LQR.ContractEndDate,
                  SUM(ISNULL(LQR.AllottedCapacity, 0))       AS CompanyAllottedCapacity,
                  SUM(ISNULL(LQR.ConsumedCapacity, 0))       AS CompanyConsumedCapacity,
                  vGLRO.AppUserNameAr,
                  vGLRO.EmiratesIdNumber,
                  LA.ContactPersonMobileNumber,
                 LQR.LaQuotationRequestReference
           FROM LA.view_GetLaRegistrations AS LA WITH (NOLOCK)
                    inner join LabourAccommodations.LA.view_GetLARegistrationOperators vGLRO on vGLRO.UserId = LA.OperatedByUserId
                    LEFT JOIN LA.LaQuotationRequests AS LQR WITH (NOLOCK)
                              ON LA.LaRegistrationId = LQR.LaRegistrationId
                    LEFT join MIGRATION.Migration.Migration.Companies CL ON CL.COM_COMPANY_CODE = LQR.CompanyCode
           WHERE LA.LaRegistrationId IN (
                                         -- Pass list of LA Registration IDs here
                                         'LA000023743', 'LA000023782', 'LA000023783'
                                         -- Add more IDs as needed
               )
           GROUP BY LA.LaRegistrationId,
                    LA.LaName,
                    LQR.ContractStartDate,
                    LQR.ContractEndDate,
                    LQR.CompanyCode,
                    vGLRO.AppUserNameAr,
                    vGLRO.EmiratesIdNumber,
                    LA.ContactPersonMobileNumber,
                    LQR.LaQuotationRequestReference,
                    COALESCE(CL.COM_NAME_ARB, CL.COM_NAME_ENG))
SELECT LaRegistrationId,
       LaName,
       CompanyCode,
       CompanyName,
       ContractStartDate,
       ContractEndDate,
       AppUserNameAr,
       EmiratesIdNumber,
       ContactPersonMobileNumber,
       LaQuotationRequestReference,
       CompanyAllottedCapacity                                           AS CompanyQuota,
       CompanyConsumedCapacity                                           AS CompanyConsumed,
       SUM(CompanyAllottedCapacity) OVER (PARTITION BY LaRegistrationId) AS TotalLaQuota,
       SUM(CompanyConsumedCapacity) OVER (PARTITION BY LaRegistrationId) AS TotalLaConsumed
FROM Q
ORDER BY LaRegistrationId, CompanyName;
```

## Output Columns

| Column | Description |
|--------|-------------|
| LaRegistrationId | Labour Accommodation Registration ID |
| LaName | Labour Accommodation Name |
| CompanyCode | Company Code |
| CompanyName | Company Name (Arabic or English) |
| ContractStartDate | Contract start date between LA and company |
| ContractEndDate | Contract end date between LA and company |
| AppUserNameAr | LA Operator name in Arabic |
| EmiratesIdNumber | Emirates ID number of the operator |
| ContactPersonMobileNumber | Contact person mobile number for the LA |
| LaQuotationRequestReference | Quotation request reference number |
| CompanyQuota | Allotted capacity for the specific company |
| CompanyConsumed | Consumed capacity by the specific company |
| TotalLaQuota | Total allotted capacity across all companies for this LA (aggregate) |
| TotalLaConsumed | Total consumed capacity across all companies for this LA (aggregate) |

## Notes
- Uses WITH (NOLOCK) hint for better performance on read operations
- Joins multiple views and tables:
  - `LA.view_GetLaRegistrations`: Main LA registration view
  - `LA.view_GetLARegistrationOperators`: LA operator details
  - `LA.LaQuotationRequests`: Quota request information
  - `MIGRATION.Migration.Migration.Companies`: Company details
- Window functions (OVER PARTITION BY) calculate total LA quotas while maintaining row-level detail
- Results are ordered by LaRegistrationId and CompanyName for easy grouping
- COALESCE ensures company name is shown in Arabic if available, otherwise English

## Usage Example

To modify the query for different LA registrations, replace the IN clause values:

```sql
WHERE LA.LaRegistrationId IN ('LA000023743', 'LA000023782', 'LA000023783')
```

Or to get all LAs, remove the WHERE clause entirely (may impact performance).
