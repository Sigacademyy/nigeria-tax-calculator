// Export helper functions

export function exportToPDF(title, content, filename) {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px; }
          h2 { color: #0f766e; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0f766e; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .summary { margin-top: 20px; padding: 15px; background-color: #fee2e2; border-radius: 6px; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        ${content}
        <div class="footer">
          Generated on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

