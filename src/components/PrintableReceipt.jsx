import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const PrintableReceipt = ({ transaction, onClose }) => {
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('receipt-content').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran - KopiBagus</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              line-height: 1.3;
              margin: 0;
              padding: 20px;
              background: white;
              color: black;
            }
            .receipt { 
              width: 280px; 
              margin: 0 auto; 
              border: 1px solid #ddd;
              padding: 10px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 15px;
              border-bottom: 1px dashed #333;
              padding-bottom: 10px;
            }
            .title { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .subtitle { 
              font-size: 10px; 
              color: #666;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 3px;
            }
            .items { 
              margin: 15px 0;
              border-bottom: 1px dashed #333;
              padding-bottom: 10px;
            }
            .item-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px;
            }
            .item-name { 
              flex: 1;
            }
            .item-qty { 
              width: 30px; 
              text-align: center;
            }
            .item-price { 
              width: 80px; 
              text-align: right;
            }
            .total-section { 
              margin-top: 10px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 3px;
            }
            .total-row.main { 
              font-weight: bold; 
              font-size: 14px;
              border-top: 1px solid #333;
              padding-top: 5px;
            }
            .footer { 
              text-align: center; 
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #333;
              font-size: 10px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .receipt { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <div id="receipt-content">
          <div className="header">
            <div className="title">KopiBagus</div>
            <div className="subtitle">Point of Sale System</div>
            <div className="subtitle">Jl. Kopi Bagus No. 123, Jakarta</div>
            <div className="subtitle">Telp: (021) 123-4567</div>
          </div>
          
          <div className="info-row">
            <span>No. Transaksi:</span>
            <span>#{transaction.id}</span>
          </div>
          <div className="info-row">
            <span>Tanggal:</span>
            <span>{format(new Date(transaction.timestamp), 'dd/MM/yyyy', { locale: id })}</span>
          </div>
          <div className="info-row">
            <span>Waktu:</span>
            <span>{format(new Date(transaction.timestamp), 'HH:mm:ss', { locale: id })}</span>
          </div>
          <div className="info-row">
            <span>Kasir:</span>
            <span>Admin</span>
          </div>
          
          <div className="items">
            {transaction.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="item-name">{item.name}</div>
                <div className="item-qty">x{item.quantity}</div>
                <div className="item-price">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</div>
              </div>
            ))}
          </div>
          
          <div className="total-section">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="total-row">
              <span>Pajak (0%):</span>
              <span>Rp 0</span>
            </div>
            <div className="total-row main">
              <span>Total:</span>
              <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="total-row">
              <span>Pembayaran:</span>
              <span className="capitalize">{transaction.paymentMethod}</span>
            </div>
            {transaction.paymentMethod === 'cash' && (
              <>
                <div className="total-row">
                  <span>Diterima:</span>
                  <span>Rp {transaction.receivedAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="total-row">
                  <span>Kembalian:</span>
                  <span>Rp {transaction.change.toLocaleString('id-ID')}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="footer">
            <div>Terima kasih atas kunjungan Anda!</div>
            <div>Selamat menikmati kopi terbaik kami</div>
            <div>www.kopibagus.com</div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={printReceipt}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cetak Struk
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintableReceipt;