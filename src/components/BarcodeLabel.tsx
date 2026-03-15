import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeLabelProps {
  value: string;
  productName: string;
  category: string;
  width?: number;
  height?: number;
}

const BarcodeLabel: React.FC<BarcodeLabelProps> = ({ value, productName, category, width = 2, height = 50 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue: true,
          fontSize: 12,
          margin: 5,
          font: 'monospace',
        });
      } catch {
        // Invalid barcode value
      }
    }
  }, [value, width, height]);

  if (!value) return null;

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xs font-body font-medium text-foreground truncate max-w-[180px]">{productName}</p>
      <p className="text-[10px] text-muted-foreground font-body">{category}</p>
      <svg ref={svgRef} className="mt-1" />
    </div>
  );
};

export default BarcodeLabel;

export function printBarcodeLabels(products: { barcode: string; name: string; category: string }[]) {
  const labelsHtml = products.map(p => `
    <div class="label">
      <p class="name">${p.name}</p>
      <p class="cat">${p.category}</p>
      <svg id="bc-${p.barcode}"></svg>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; }
  .label { 
    display: inline-flex; flex-direction: column; align-items: center; 
    padding: 8px; margin: 4px; border: 1px dashed #ccc;
    width: 220px; page-break-inside: avoid;
  }
  .name { font-size: 11px; font-weight: bold; margin-bottom: 2px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cat { font-size: 9px; color: #666; margin-bottom: 4px; }
  @media print { 
    body { margin: 0; }
    .label { border: none; margin: 2px; }
  }
</style>
</head><body>
${labelsHtml}
<script>
  ${products.map(p => `
    try { JsBarcode("#bc-${p.barcode}", "${p.barcode}", { format: "CODE128", width: 1.5, height: 40, displayValue: true, fontSize: 10, margin: 2, font: "monospace" }); } catch(e) {}
  `).join('\n')}
  setTimeout(() => window.print(), 300);
</script>
</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '400px';
  iframe.style.height = '600px';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => document.body.removeChild(iframe), 5000);
}
