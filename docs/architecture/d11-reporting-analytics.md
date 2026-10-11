# D11 — Reporting and Analytics

## Reporting boundary

Reports are authorization-scoped projections, not unrestricted database exports. Every query applies tenant, role, assignment/relationship, date, and academic-context filters before aggregation.

## MVP reports

Student roster/enrollment, attendance, teacher workload, examination completion, marks progress, class/subject performance, result summary, generated documents, notices, and audit activity. Role dashboards show only relevant aggregates and freshness information.

## Export

CSV, XLSX, and PDF exports are asynchronous private artifacts. Requests record filters, requester, data version/time, output location, expiry, and audit event. Large reports use database aggregation, pagination/chunking, and queue capacity controls.

## Analytics governance

Metrics must not accidentally expose individual student information. Definitions for pass rate, average, attendance rate, and ranking are versioned and displayed with applied filters.
