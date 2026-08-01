package com.organizational.knowledge_gap_platform.util.report;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Turns a simple title + column headers + row data into a downloadable PDF
 * table. Every report in the Reports & Export module goes through this same
 * builder so we don't hand-roll PDF layout code five separate times.
 */
public final class PdfReportBuilder {

    private static final DateTimeFormatter GENERATED_AT_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 16, Font.BOLD);
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 9, Font.ITALIC, java.awt.Color.GRAY);
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, java.awt.Color.WHITE);
    private static final Font CELL_FONT = new Font(Font.HELVETICA, 9);

    private PdfReportBuilder() {
    }

    /**
     * @param reportTitle   shown as a heading at the top of the page
     * @param columnHeaders column names, in order
     * @param rows          each inner list must be the same length as columnHeaders
     */
    public static byte[] build(String reportTitle, List<String> columnHeaders, List<List<String>> rows) {

        // Landscape orientation: most of these reports are wide (many columns).
        Document document = new Document(PageSize.A4.rotate(), 24, 24, 36, 24);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph(reportTitle, TITLE_FONT));
            document.add(new Paragraph(
                    "Generated " + java.time.LocalDateTime.now().format(GENERATED_AT_FORMAT),
                    SUBTITLE_FONT));
            document.add(Chunk.NEWLINE);

            if (rows.isEmpty()) {
                document.add(new Paragraph("No data available for this report.", CELL_FONT));
                document.close();
                return out.toByteArray();
            }

            PdfPTable table = new PdfPTable(Math.max(columnHeaders.size(), 1));
            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            for (String header : columnHeaders) {
                PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
                cell.setBackgroundColor(new java.awt.Color(63, 81, 181)); // indigo, matches the app's accent
                cell.setPadding(6);
                table.addCell(cell);
            }

            boolean shaded = false;
            for (List<String> rowData : rows) {
                for (String value : rowData) {
                    PdfPCell cell = new PdfPCell(new Phrase(value == null ? "" : value, CELL_FONT));
                    cell.setPadding(5);
                    if (shaded) {
                        cell.setBackgroundColor(new java.awt.Color(245, 245, 250));
                    }
                    table.addCell(cell);
                }
                shaded = !shaded;
            }

            document.add(table);
            document.close();
            return out.toByteArray();

        } catch (DocumentException e) {
            throw new RuntimeException("Failed to build PDF report", e);
        }
    }
}
