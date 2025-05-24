import React, { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { qrStreamTransfer, TransferData } from '../index';

interface QRTransferProps {
  onDataReceived?: (data: TransferData) => void;
  autoRedirect?: boolean;
}

export const QRTransfer: React.FC<QRTransferProps> = ({ 
  onDataReceived,
  autoRedirect = false 
}) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [receivedData, setReceivedData] = useState<TransferData | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const buffer = await file.arrayBuffer();
        const qr = await qrStreamTransfer.generateTransferQR({
          type: 'file',
          content: Buffer.from(buffer),
          metadata: {
            filename: file.name,
            mimeType: file.type,
            size: file.size
          }
        });
        setQrCode(qr);
      } catch (err) {
        setError('Error generating QR code');
      }
    }
  };

  const handleTextInput = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    try {
      const qr = await qrStreamTransfer.generateTransferQR({
        type: 'text',
        content: text
      });
      setQrCode(qr);
    } catch (err) {
      setError('Error generating QR code');
    }
  };

  const handleLinkInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    try {
      const qr = await qrStreamTransfer.generateLinkQR(url, autoRedirect);
      setQrCode(qr);
    } catch (err) {
      setError('Error generating QR code');
    }
  };

  const handleQRScan = async (result: any) => {
    if (result) {
      try {
        const data = await qrStreamTransfer.scanAndReceiveQR(result.text);
        setReceivedData(data);
        onDataReceived?.(data);

        if (data.type === 'link' && autoRedirect) {
          window.location.href = data.content.toString();
        }
      } catch (err) {
        setError('Error receiving data');
      }
    }
  };

  const handleCopy = () => {
    if (receivedData) {
      const text = qrStreamTransfer.getCopyableText(receivedData);
      if (text) {
        navigator.clipboard.writeText(text);
      }
    }
  };

  return (
    <div className="qr-transfer">
      <div className="transfer-controls">
        <div className="input-section">
          <h3>Send Data</h3>
          <div className="input-group">
            <label>Text:</label>
            <textarea onChange={handleTextInput} placeholder="Enter text to transfer" />
          </div>
          <div className="input-group">
            <label>Link:</label>
            <input type="url" onChange={handleLinkInput} placeholder="Enter URL to transfer" />
          </div>
          <div className="input-group">
            <label>File:</label>
            <input type="file" onChange={handleFileUpload} />
          </div>
        </div>

        {qrCode && (
          <div className="qr-display">
            <h3>Generated QR Code</h3>
            <img src={qrCode} alt="Transfer QR Code" />
          </div>
        )}

        <div className="scan-section">
          <h3>Receive Data</h3>
          <button onClick={() => setIsScanning(!isScanning)}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </button>
          {isScanning && (
            <div className="qr-scanner">
              <QrReader
                onResult={handleQRScan}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        {receivedData && (
          <div className="received-data">
            <h3>Received Data</h3>
            <div className="data-content">
              {receivedData.type === 'file' ? (
                <div>
                  <p>File: {receivedData.metadata?.filename}</p>
                  <p>Size: {receivedData.metadata?.size} bytes</p>
                  <p>Type: {receivedData.metadata?.mimeType}</p>
                </div>
              ) : (
                <div>
                  <p>{receivedData.content.toString()}</p>
                  <button onClick={handleCopy}>Copy to Clipboard</button>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        .qr-transfer {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .transfer-controls {
          display: grid;
          gap: 20px;
        }
        .input-group {
          margin-bottom: 15px;
        }
        .input-group label {
          display: block;
          margin-bottom: 5px;
        }
        .input-group input,
        .input-group textarea {
          width: 100%;
          padding: 8px;
        }
        .qr-display {
          text-align: center;
        }
        .qr-display img {
          max-width: 200px;
        }
        .scan-section {
          text-align: center;
        }
        .qr-scanner {
          margin-top: 15px;
        }
        .received-data {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .error-message {
          color: red;
          margin-top: 10px;
        }
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
}; 