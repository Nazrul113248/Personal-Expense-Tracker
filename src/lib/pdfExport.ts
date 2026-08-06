import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';

interface ExportPdfOptions {
  transactions: Transaction[];
  userName: string;
}

// Format numbers specifically for PDF rendering (BDT 1,500.00) to avoid font encoding issues with standard PDF fonts
const formatPdfCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `BDT ${formatted}`;
};

export const exportTransactionsToPDF = ({ transactions, userName }: ExportPdfOptions) => {
  // 1. Calculate totals from the exported transactions set
  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpenses;

  // 2. Initialize jsPDF document (A4 portrait)
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 3. Colored Header Banner (Dark Blue)
  doc.setFillColor(15, 23, 42); // slate-900 / dark blue (#0F172A)
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Expense Tracker', 14, 18);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Transaction Report', 14, 28);

  // Header Date & Time on Top Right
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`Generated: ${formattedDate} ${formattedTime}`, pageWidth - 14, 28, { align: 'right' });

  // 4. Summary Card Section
  doc.setFillColor(248, 250, 252); // slate-50 background
  doc.setDrawColor(226, 232, 240); // slate-200 border
  doc.roundedRect(14, 48, pageWidth - 28, 28, 3, 3, 'FD');

  // Left Section: User & Date
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFontSize(9);

  doc.setFont('helvetica', 'bold');
  doc.text('User Name:', 18, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(userName || 'Valued User', 40, 57);

  doc.setFont('helvetica', 'bold');
  doc.text('Report Date:', 18, 66);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formattedDate}, ${formattedTime}`, 40, 66);

  // Middle Section: Total Income & Total Expenses
  const col2X = 88;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Total Income:', col2X, 57);
  doc.setTextColor(5, 150, 105); // Green
  doc.text(formatPdfCurrency(totalIncome), col2X + 26, 57);

  doc.setTextColor(51, 65, 85);
  doc.text('Total Expenses:', col2X, 66);
  doc.setTextColor(220, 38, 38); // Red
  doc.text(formatPdfCurrency(totalExpenses), col2X + 26, 66);

  // Right Section: Current Balance
  const col3X = pageWidth - 18;
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Current Balance:', col3X - 35, 61, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(currentBalance >= 0 ? 30 : 220, currentBalance >= 0 ? 58 : 38, currentBalance >= 0 ? 138 : 38);
  doc.text(formatPdfCurrency(currentBalance), col3X, 61, { align: 'right' });

  // 5. Transaction Table Data
  const tableData = transactions.map((t, index) => [
    (index + 1).toString(),
    t.date,
    t.title,
    t.category,
    t.type,
    formatPdfCurrency(t.amount),
    t.description || '-',
  ]);

  autoTable(doc, {
    startY: 82,
    margin: { left: 14, right: 14, top: 15, bottom: 20 },
    head: [['Serial No.', 'Date', 'Title', 'Category', 'Type', 'Amount (BDT)', 'Description']],
    body: tableData,
    headStyles: {
      fillColor: [30, 58, 138], // Dark blue (#1E3A8A)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
      valign: 'middle',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Striped row alternate color
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 16 }, // Serial No.
      1: { halign: 'center', cellWidth: 22 }, // Date
      2: { halign: 'left', cellWidth: 32 },   // Title
      3: { halign: 'center', cellWidth: 22 }, // Category
      4: { halign: 'center', cellWidth: 18 }, // Type
      5: { halign: 'right', cellWidth: 34 },  // Amount (BDT)
      6: { halign: 'left' },                  // Description
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 5) {
        data.cell.styles.halign = 'right';
      }
      if (data.section === 'body') {
        const rowData = data.row.raw as string[];
        const type = rowData[4]; // Type column
        
        // Highlight Income vs Expense cells
        if (data.column.index === 4 || data.column.index === 5) {
          if (type === 'Income') {
            data.cell.styles.textColor = [5, 150, 105]; // Green
            data.cell.styles.fontStyle = 'bold';
          } else if (type === 'Expense') {
            data.cell.styles.textColor = [220, 38, 38]; // Red
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    },
  });

  // 6. Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    // Footer Text
    doc.text('Personal Expense Tracker — Official Report', 14, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }

  // 7. Download PDF file with format: Expense_Report_YYYY-MM-DD.pdf
  const dateString = now.toISOString().split('T')[0];
  const fileName = `Expense_Report_${dateString}.pdf`;
  doc.save(fileName);
};

