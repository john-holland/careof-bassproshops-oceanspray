# QR Stream Transfer

A powerful library for transferring data between devices using QR codes. This library enables seamless transfer of text, files, and links through QR code scanning, with support for automatic redirection and clipboard operations.

## Features

- Transfer text, files, and links via QR codes
- Automatic redirection for links
- Copy to clipboard functionality
- Chunked data transfer for large files
- Real-time progress tracking
- TypeScript support
- React component included

## Installation

```bash
npm install qr-stream-transfer
```

## Usage

### Basic Usage

```typescript
import { qrStreamTransfer } from 'qr-stream-transfer';

// Generate QR code for text
const qrCode = await qrStreamTransfer.generateTransferQR({
  type: 'text',
  content: 'Hello, World!'
});

// Generate QR code for a link with auto-redirect
const linkQrCode = await qrStreamTransfer.generateLinkQR(
  'https://example.com',
  true
);

// Scan and receive data
const data = await qrStreamTransfer.scanAndReceiveQR(qrCodeData);
```

### React Component

```tsx
import { QRTransfer } from 'qr-stream-transfer/components';

function App() {
  const handleDataReceived = (data) => {
    console.log('Received data:', data);
  };

  return (
    <QRTransfer
      onDataReceived={handleDataReceived}
      autoRedirect={true}
    />
  );
}
```

## API Reference

### QRStreamTransfer

#### generateTransferQR(data: TransferData, options?: TransferOptions): Promise<string>
Generates a QR code for data transfer.

#### generateLinkQR(url: string, autoRedirect?: boolean): Promise<string>
Generates a QR code for a URL with optional auto-redirect.

#### scanAndReceiveQR(qrData: string): Promise<TransferData>
Scans a QR code and receives the transferred data.

#### getCopyableText(data: TransferData): string
Returns copyable text from the transferred data.

### Types

#### TransferData
```typescript
interface TransferData {
  type: 'text' | 'file' | 'link';
  content: string | Buffer;
  metadata?: {
    filename?: string;
    mimeType?: string;
    size?: number;
  };
}
```

#### TransferOptions
```typescript
interface TransferOptions {
  autoRedirect?: boolean;
  chunkSize?: number;
  timeout?: number;
}
```

## Examples

### Transfer a File
```typescript
const file = new File(['Hello, World!'], 'hello.txt', { type: 'text/plain' });
const buffer = await file.arrayBuffer();

const qrCode = await qrStreamTransfer.generateTransferQR({
  type: 'file',
  content: Buffer.from(buffer),
  metadata: {
    filename: file.name,
    mimeType: file.type,
    size: file.size
  }
});
```

### Transfer Text with Auto-Copy
```typescript
const qrCode = await qrStreamTransfer.generateTransferQR({
  type: 'text',
  content: 'Copy this text automatically'
});

const data = await qrStreamTransfer.scanAndReceiveQR(qrCode);
const text = qrStreamTransfer.getCopyableText(data);
navigator.clipboard.writeText(text);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 