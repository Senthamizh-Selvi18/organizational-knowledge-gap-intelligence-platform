package com.organizational.knowledge_gap_platform.util.report;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;

/**
 * Turns a simple title + column headers + row data into a downloadable
 * .xlsx file. Every report in the Reports & Export module goes through
 * this same builder so we don't hand-roll POI code five separate times.
 */
public final class ExcelReportBuilder {

    private ExcelReportBuilder() {
    }

    /**
     * @param reportTitle shown as a merged heading row above the table
     * @param columnHeaders column names, in order
     * @param rows          each inner list must be the same length as columnHeaders
     */
    public static byte[] build(String reportTitle, List<String> columnHeaders, List<List<String>> rows) {

        try (Workbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Report");

            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            int rowIndex = 0;

            Row titleRow = sheet.createRow(rowIndex++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(reportTitle);
            titleCell.setCellStyle(titleStyle);
            if (!columnHeaders.isEmpty()) {
                sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(
                        0, 0, 0, columnHeaders.size() - 1));
            }

            rowIndex++; // blank spacer row

            Row headerRow = sheet.createRow(rowIndex++);
            for (int col = 0; col < columnHeaders.size(); col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columnHeaders.get(col));
                cell.setCellStyle(headerStyle);
            }

            for (List<String> rowData : rows) {
                Row row = sheet.createRow(rowIndex++);
                for (int col = 0; col < rowData.size(); col++) {
                    row.createCell(col).setCellValue(rowData.get(col) == null ? "" : rowData.get(col));
                }
            }

            for (int col = 0; col < columnHeaders.size(); col++) {
                sheet.autoSizeColumn(col);
                // autoSizeColumn under-measures bold header text sometimes; give a floor.
                if (sheet.getColumnWidth(col) < 4000) {
                    sheet.setColumnWidth(col, 4000);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            // Building an in-memory workbook shouldn't ever hit real I/O
            // errors; surface as unchecked so callers don't need boilerplate.
            throw new UncheckedIOException("Failed to build Excel report", e);
        }
    }
}
