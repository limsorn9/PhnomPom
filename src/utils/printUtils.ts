import { toCanvas, toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export interface PrintOptions {
  landscape?: boolean;
  pageTitle?: string;
  marginMm?: number;
  hideSelector?: string;
  targetClass?: string;
}

export interface PdfExportOptions {
  landscape?: boolean;
  filename?: string;
  format?: 'a4' | 'letter';
  marginMm?: number | [number, number, number, number];
  quality?: number;
  scale?: number;
}

/**
 * Resolves element from string ID or HTMLElement
 */
const resolveElement = (elementOrId: HTMLElement | string): HTMLElement | null => {
  if (typeof elementOrId === 'string') {
    return document.getElementById(elementOrId);
  }
  return elementOrId;
};

/**
 * Internal interface to store original element styles before print mode
 */
interface ScrollStateBackup {
  element: HTMLElement;
  overflow: string;
  overflowX: string;
  overflowY: string;
  height: string;
  maxHeight: string;
  position: string;
  scrollTop: number;
  scrollLeft: number;
}

/**
 * Programmatically disables application mobile/desktop scroll behaviors
 * when printing or PDF rendering is triggered.
 * Returns a restore function to revert all styles and scroll positions
 * once the print window / PDF generation completes.
 */
export const disableAppScrollForPrint = (): (() => void) => {
  if (typeof document === 'undefined') return () => {};

  const backups: ScrollStateBackup[] = [];
  const rootElements = [document.documentElement, document.body];
  const scrollContainers = document.querySelectorAll<HTMLElement>(
    '#root, .overflow-y-auto, .overflow-x-auto, .overflow-auto, [class*="overflow-"], main, [data-scroll-container]'
  );

  const allTargets: HTMLElement[] = [
    ...rootElements,
    ...Array.from(scrollContainers)
  ];

  // Save current styles & scroll positions
  allTargets.forEach((el) => {
    backups.push({
      element: el,
      overflow: el.style.overflow,
      overflowX: el.style.overflowX,
      overflowY: el.style.overflowY,
      height: el.style.height,
      maxHeight: el.style.maxHeight,
      position: el.style.position,
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft
    });

    // Apply print-friendly non-scrolling overrides
    el.style.setProperty('overflow', 'visible', 'important');
    el.style.setProperty('overflow-x', 'visible', 'important');
    el.style.setProperty('overflow-y', 'visible', 'important');
    el.style.setProperty('height', 'auto', 'important');
    el.style.setProperty('max-height', 'none', 'important');
  });

  // Apply global print mode classes
  document.documentElement.classList.add('print-view', 'app-print-active');
  document.body.classList.add('print-view', 'app-print-active');

  // Return restore callback
  return () => {
    backups.forEach(({ element, overflow, overflowX, overflowY, height, maxHeight, position, scrollTop, scrollLeft }) => {
      element.style.overflow = overflow;
      element.style.overflowX = overflowX;
      element.style.overflowY = overflowY;
      element.style.height = height;
      element.style.maxHeight = maxHeight;
      element.style.position = position;
      if (scrollTop) element.scrollTop = scrollTop;
      if (scrollLeft) element.scrollLeft = scrollLeft;
    });

    document.documentElement.classList.remove('print-view', 'app-print-active');
    document.body.classList.remove('print-view', 'app-print-active');
  };
};

/**
 * Reverts application scroll behaviors after print operation
 */
export const enableAppScrollAfterPrint = (restoreFn?: () => void) => {
  if (restoreFn) {
    restoreFn();
  } else if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('print-view', 'app-print-active');
    document.body.classList.remove('print-view', 'app-print-active');
  }
};

/**
 * Higher-order helper that wraps an asynchronous print or PDF action with
 * automatic scroll-lock and restoration.
 */
export const withScrollDisabledForPrint = async <T>(
  action: () => Promise<T> | T
): Promise<T> => {
  const restoreScroll = disableAppScrollForPrint();
  try {
    return await action();
  } finally {
    restoreScroll();
  }
};

/**
 * Isolated Iframe Print Helper
 * Ensures only the document content is printed cleanly with all styles and fonts intact,
 * with zero scrollbars, zero container clipping, and full fidelity in web preview containers.
 */
export const printElement = (
  elementOrId: HTMLElement | string,
  options: PrintOptions = {}
): Promise<boolean> => {
  return withScrollDisabledForPrint(async () => {
    return new Promise((resolve) => {
      const el = resolveElement(elementOrId);
      if (!el) {
        console.warn('Print target element not found, falling back to window.print()');
        window.print();
        resolve(false);
        return;
      }

      const { landscape = false, pageTitle = 'ឯកសាររដ្ឋបាលផ្លូវការ' } = options;

      // Add print-view class to target element temporarily
      el.classList.add('print-view');

      try {
        // 1. Remove any previous sandbox iframe
        const existingIframe = document.getElementById('print-sandbox-iframe');
        if (existingIframe) {
          existingIframe.remove();
        }

        // 2. Create isolated hidden print iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'print-sandbox-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) {
          window.print();
          resolve(false);
          return;
        }

        // 3. Gather style rules and stylesheet links
        let styleContent = '';
        document.querySelectorAll('style').forEach((st) => {
          styleContent += st.innerHTML + '\n';
        });

        let linkTags = '';
        document.querySelectorAll('link[rel="stylesheet"]').forEach((lk) => {
          linkTags += lk.outerHTML + '\n';
        });

        // 4. Construct print document with exact fonts, page directives, and scrollbar elimination
        const printHtml = `
          <!DOCTYPE html>
          <html lang="km" class="print-view">
          <head>
            <meta charset="utf-8" />
            <title>${pageTitle}</title>
            ${linkTags}
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Kantumruy+Pro:wght@400;600;700&family=Moul&family=Siemreap&display=swap" rel="stylesheet">
            <style>
              ${styleContent}
              
              @page {
                size: A4 ${landscape ? 'landscape' : 'portrait'};
                margin: ${landscape ? '5mm' : '8mm'};
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                box-sizing: border-box;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              
              *::-webkit-scrollbar {
                display: none !important;
                width: 0px !important;
                height: 0px !important;
              }
              
              html, body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: 'Battambang', 'Kantumruy Pro', 'Khmer OS Battambang', sans-serif;
                color: #0f172a;
                width: 100% !important;
                height: auto !important;
                overflow: visible !important;
              }

              .print-view,
              .print-view * {
                overflow: visible !important;
                height: auto !important;
                max-height: none !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }

              .font-moul {
                font-family: 'Moul', 'Khmer OS Muol Light', serif !important;
              }

              .font-battambang {
                font-family: 'Battambang', sans-serif !important;
              }

              .no-print, .print\\:hidden, [data-no-print="true"] {
                display: none !important;
              }

              .overflow-x-auto, .overflow-y-auto, .overflow-auto, [class*="overflow-"] {
                overflow: visible !important;
                max-width: none !important;
                max-height: none !important;
              }

              .page-break-before {
                page-break-before: always !important;
                break-before: page !important;
              }

              .page-break-inside-avoid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              table {
                border-collapse: collapse;
                width: 100% !important;
                max-width: 100% !important;
                table-layout: auto;
              }

              th, td {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .print-container {
                width: 100% !important;
                margin: 0 auto;
                overflow: visible !important;
                height: auto !important;
              }
            </style>
          </head>
          <body class="print-view">
            <div class="print-container print-view">
              ${el.outerHTML}
            </div>
          </body>
          </html>
        `;

        doc.open();
        doc.write(printHtml);
        doc.close();

        const triggerPrint = () => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
              iframe.remove();
              el.classList.remove('print-view');
            }, 1500);
            resolve(true);
          } catch (e) {
            console.warn('Iframe print fallback triggered:', e);
            window.print();
            el.classList.remove('print-view');
            resolve(false);
          }
        };

        if (doc.fonts && doc.fonts.ready) {
          doc.fonts.ready.then(() => {
            setTimeout(triggerPrint, 300);
          });
        } else {
          setTimeout(triggerPrint, 400);
        }
      } catch (err) {
        console.error('Error during isolated printing:', err);
        el.classList.remove('print-view');
        window.print();
        resolve(false);
      }
    });
  });
};

/**
 * High-Definition, Scrollbar-Free PDF Export using html-to-image + jsPDF
 * Injects a temporary anti-scrollbar stylesheet and forces overflow: visible on all tables and containers
 * so that no browser scrollbars (horizontal or vertical) get captured into the PDF.
 */
export const downloadElementAsPdf = async (
  elementOrId: HTMLElement | string,
  filename: string = 'ឯកសារសាលារៀន.pdf',
  options: PdfExportOptions = {}
): Promise<boolean> => {
  return withScrollDisabledForPrint(async () => {
    const el = resolveElement(elementOrId);
    if (!el) {
      console.error('PDF export target element not found');
      return false;
    }

    const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    const isLandscape = options.landscape ?? false;
    const format = options.format || 'a4';

    // 1. Inject anti-scrollbar and overflow-expansion style for clean rasterization
    const antiScrollbarStyle = document.createElement('style');
    antiScrollbarStyle.id = '__pdf_anti_scrollbar_style__';
    antiScrollbarStyle.innerHTML = `
      #__pdf_anti_scrollbar_style__ ~ * * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      *::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
      }
      .overflow-x-auto, .overflow-y-auto, .overflow-auto, [class*="overflow-"] {
        overflow: visible !important;
        max-width: none !important;
        max-height: none !important;
        height: auto !important;
      }
      .no-print, .print\\:hidden, [data-no-print="true"] {
        display: none !important;
      }
      .print-view,
      .print-view * {
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    `;
    document.head.appendChild(antiScrollbarStyle);

    // Add capturing marker class and print-view class to element
    el.classList.add('pdf-export-active', 'print-view');

    try {
      // 2. Convert DOM node to Canvas using html-to-image with full scrollWidth/scrollHeight
      const canvas = await toCanvas(el, {
        pixelRatio: options.scale ?? 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          overflow: 'visible',
          overflowX: 'visible',
          overflowY: 'visible',
          scrollbarWidth: 'none',
          boxShadow: 'none',
          margin: '0',
          transform: 'none',
          height: 'auto',
          maxHeight: 'none',
          width: `${el.scrollWidth || el.offsetWidth}px`
        },
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return (
              !node.classList.contains('no-print') &&
              !node.classList.contains('print:hidden') &&
              node.getAttribute('data-no-print') !== 'true'
            );
          }
          return true;
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', options.quality ?? 0.96);
      
      // 3. Initialize jsPDF document (A4 dimensions: 210 x 297 mm)
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: format
      });

      const pdfWidth = isLandscape ? 297 : 210;
      const pdfHeight = isLandscape ? 210 : 297;

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Multi-page handling if document height exceeds single A4
      while (heightLeft > 2) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save(cleanFilename);
      return true;
    } catch (renderErr) {
      console.warn('html-to-image render failed, attempting fallback PNG snapshot:', renderErr);

      try {
        const dataUrl = await toPng(el, {
          pixelRatio: 1.5,
          backgroundColor: '#ffffff',
          style: {
            overflow: 'visible',
            scrollbarWidth: 'none',
            boxShadow: 'none',
            height: 'auto'
          }
        });

        const pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'mm',
          format: format
        });

        const pdfWidth = isLandscape ? 297 : 210;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, 0);
        pdf.save(cleanFilename);
        return true;
      } catch (fallbackErr) {
        console.error('All direct PDF generation methods failed, falling back to isolated print:', fallbackErr);
        await printElement(el, { landscape: isLandscape });
        return false;
      }
    } finally {
      // Clean up injected anti-scrollbar stylesheet and marker classes
      el.classList.remove('pdf-export-active', 'print-view');
      antiScrollbarStyle.remove();
    }
  });
};


