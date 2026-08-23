import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  fileName?: string;
  quality?: number;
  margin?: number;
}

/**
 * Export any HTML element as a clean high-resolution A4 PDF document
 */
export const exportElementToPdf = async (
  elementId: string,
  options: PDFExportOptions = {}
): Promise<boolean> => {
  const {
    fileName = 'Kartu_Pendaftaran_SPMB.pdf',
    margin = 8,
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  try {
    // Generate Canvas with 2x scale for crisp text and barcodes
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, '', 'FAST');
    heightLeft -= pageHeight;

    // In case content exceeds one page (though card is designed for single page A4)
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, contentHeight, '', 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
};
