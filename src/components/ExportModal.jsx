import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import jsPDF from 'jspdf';

const ExportModal = ({ data, onClose, title = 'Export Data' }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('KopiBagus - Laporan Penjualan', 20, 20);
    
    // Add date range
    doc.setFontSize(12);
    doc.text(`Periode: ${dateRange.start} - ${dateRange.end}`, 20, 35);
    
    // Filter data by date range
    const filteredData = data.filter(transaction => {
      const transactionDate = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    });
    
    // Create simple table manually
    let yPos = 50;
    const rowHeight = 10;
    const colWidths = [30, 40, 50, 30, 30];
    const colPositions = [
      20,
      20 + colWidths[0],
      20 + colWidths[0] + colWidths[1],
      20 + colWidths[0] + colWidths[1] + colWidths[2],
      20 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
    ];
    
    // Headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('No. Transaksi', colPositions[0], yPos);
    doc.text('Tanggal', colPositions[1], yPos);
    doc.text('Items', colPositions[2], yPos);
    doc.text('Pembayaran', colPositions[3], yPos);
    doc.text('Total', colPositions[4], yPos);
    
    yPos += rowHeight;
    doc.line(20, yPos - 5, 190, yPos - 5);
    
    // Data rows
    doc.setFont('helvetica', 'normal');
    filteredData.forEach(transaction => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const transactionDate = format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm', { locale: id });
      const items = transaction.items.map(item => `${item.name} x${item.quantity}`).slice(0, 2).join(', ');
      const totalFormatted = `Rp ${transaction.total.toLocaleString('id-ID')}`;
      
      doc.text(`#${transaction.id}`, colPositions[0], yPos);
      doc.text(transactionDate, colPositions[1], yPos);
      doc.text(items.length > 30 ? items.substring(0, 27) + '...' : items, colPositions[2], yPos);
      doc.text(transaction.paymentMethod, colPositions[3], yPos);
      doc.text(totalFormatted, colPositions[4], yPos);
      
      yPos += rowHeight;
    });
    
    // Add summary
    const totalRevenue = filteredData.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredData.length;
    
    yPos += 10;
    doc.line(20, yPos - 5, 190, yPos - 5);
    yPos += 5;
    
    doc.setFontSize(12);
    doc.text(`Total Transaksi: ${totalTransactions}`, 20, yPos);
    doc.text(`Total Pendapatan: Rp ${totalRevenue.toLocaleString('id-ID')}`, 20, yPos + 10);
    
    // Save PDF
    doc.save(`laporan-penjualan-${dateRange.start}-${dateRange.end}.pdf`);
  };

  const exportToCSV = () => {
    // Filter data by date range
    const filteredData = data.filter(transaction => {
      const transactionDate = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
      return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
    });
    
    // Prepare CSV data
    const csvData = [
      ['No. Transaksi', 'Tanggal', 'Items', 'Pembayaran', 'Total']
    ];
    
    filteredData.forEach(transaction => {
      csvData.push([
        `#${transaction.id}`,
        format(new Date(transaction.timestamp), 'dd/MM/yyyy HH:mm', { locale: id }),
        transaction.items.map(item => `${item.name} x${item.quantity}`).join('; '),
        transaction.paymentMethod,
        transaction.total
      ]);
    });
    
    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-penjualan-${dateRange.start}-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      exportToPDF();
    } else if (exportFormat === 'csv') {
      exportToCSV();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Format Export
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="pdf" className="bg-gray-800">PDF</option>
              <option value="csv" className="bg-gray-800">CSV</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleExport}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 py-3 rounded-lg transition-colors"
          >
            Export
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-200 py-3 rounded-lg transition-colors"
          >
            Batal
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExportModal;