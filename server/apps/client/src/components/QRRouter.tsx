import React from 'react';
import QRCode from 'qrcode.react';

interface QRRouterProps {
  tankId: number;
}

const QRRouter: React.FC<QRRouterProps> = ({ tankId }) => {
  const qrValue = `https://example.com/tank/${tankId}`;
  return (
    <div>
      <h4>QR Code for Tank {tankId}</h4>
      <QRCode value={qrValue} />
    </div>
  );
};

export default QRRouter; 