# Late Wages Query (الاجور المتاخرة)

## Description
This query retrieves companies with late wage payments, showing companies that have more than 50 eligible employees but have paid less than 80% of wages. The query is designed to identify companies with poor wage payment compliance.

**Schedule**: Run on the 19th of each month

## Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| :TOTAL_ELIGIBLE_EMPS | NUMBER | Minimum number of eligible employees to filter companies (typically 50) | 50 |
| :COMPANY_PAYMENT_PERCENT | NUMBER | Minimum payment percentage threshold (typically 80%) | 80 |
| :YEARMONTH | NUMBER | Year and month in YYYYMM format. Should be current month -2 | 202507 |

### Parameter Calculation Note
- **:YEARMONTH**: This should be calculated as the current month minus 2 months in YYYYMM format
  - Example: If current date is September 2025 (202509), use 202507 (July 2025)

## Query

```sql
WITH
    cte
    AS
        (SELECT WPS_COMPANIES_INSPECTION_ID,
                DATEOFSUBMIT,
                COM_CODE,
                MONTH,
                TOTAL_EMPLOYEES,
                TOTAL_ELIGIBLE,
                TOTAL_PAID,
                TOTALELIGIBLEEXEMPTED,
                TRAN_TYPE,
                EMPLOYEES_NOT_COVERED,
                EMPLOYEES_PAID_LESS,
                EMPLOYEES_NOT_PAID,
                PERCENTAGE,
                PERCENTAGE_PAIDLESS,
                ADD_USER,
                MODIFY_USER,
                MODIFY_DATE,
                C_EMAIL,
                C_TYPE,
                PAID,
                PAID_REMARKS,
                ROW_NUMBER ()
                    OVER (PARTITION BY w.COM_CODE
                          ORDER BY w.dateofsubmit DESC)
                    rn
           FROM mol.WPS_Comp_Inspection w
          WHERE     w.C_TYPE = 2
                AND w.total_eligible > :TOTAL_ELIGIBLE_EMPS
                AND w.percentage < :COMPANY_PAYMENT_PERCENT
                AND month = :YEARMONTH)
SELECT lo.A_NAME,
       co.COM_COMPANY_CODE,
       co.COM_NAME_ARB,
       c.PERCENTAGE,
       c.TOTAL_ELIGIBLE,
       c.MONTH,
       co.CATEGORY,
       '50+'     Ty
  FROM cte  c
       INNER JOIN companies co ON co.COM_COMPANY_CODE = c.COM_CODE
       INNER JOIN MOL.SIS_LABOR_OFFICES lo
           ON lo.LABOR_OFFICE_CODE = co.COM_LO_CODE
WHERE c.rn = 1 and co.COM_COMPANY_CODE NOT IN (select comcode from MOL.COM_STATUS cs where cs.COMSTATUS =131);
```

## Output Columns

| Column | Description |
|--------|-------------|
| A_NAME | Labor office name (Arabic) |
| COM_COMPANY_CODE | Company code |
| COM_NAME_ARB | Company name (Arabic) |
| PERCENTAGE | Percentage of wages paid |
| TOTAL_ELIGIBLE | Total eligible employees |
| MONTH | Month of inspection (YYYYMM) |
| CATEGORY | Company category |
| Ty | Type indicator (50+) |

## Notes
- The query uses a CTE (Common Table Expression) to get the most recent inspection record per company
- Filters out companies with status code 131
- Only considers companies with C_TYPE = 2
- Returns companies with 50+ eligible employees