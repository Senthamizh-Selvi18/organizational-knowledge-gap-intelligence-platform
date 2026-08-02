package com.organizational.knowledge_gap_platform.util.report;

import java.util.List;

/**
 * A report reduced to its simplest exportable shape: a title, column
 * headers, and string rows. Both ExcelReportBuilder and PdfReportBuilder
 * consume this, so each report type only needs to be converted to a
 * ReportTable once (in ReportServiceImpl) rather than once per export format.
 */
public record ReportTable(String title, List<String> headers, List<List<String>> rows) {
}
