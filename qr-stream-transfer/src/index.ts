import * as QRCode from 'qrcode';
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import chunkText from 'chunk-text';

export interface TransferOptions {
  autoRedirect?: boolean;
  chunkSize?: number;
  timeout?: number;
}

export interface TransferData {
  type: 'text' | 'file' | 'link';
  content: string | Buffer;
  metadata?: {
    filename?: string;
    mimeType?: string;
    size?: number;
  };
}

export class QRStreamTransfer {
  private server: express.Application;
  private io: Server;
  private activeTransfers: Map<string, {
    data: TransferData;
    chunks: string[];
    currentChunk: number;
    options: TransferOptions;
  }>;

  constructor(port: number = 3000) {
    this.server = express();
    const httpServer = createServer(this.server);
    this.io = new Server(httpServer);
    this.activeTransfers = new Map();

    this.setupServer();
    httpServer.listen(port);
  }

  private setupServer() {
    this.io.on('connection', (socket) => {
      socket.on('request_chunk', (transferId: string, chunkIndex: number) => {
        const transfer = this.activeTransfers.get(transferId);
        if (transfer && chunkIndex < transfer.chunks.length) {
          socket.emit('chunk_data', {
            transferId,
            chunkIndex,
            data: transfer.chunks[chunkIndex],
            isLast: chunkIndex === transfer.chunks.length - 1
          });
        }
      });

      socket.on('transfer_complete', (transferId: string) => {
        this.activeTransfers.delete(transferId);
      });
    });
  }

  public async generateTransferQR(data: TransferData, options: TransferOptions = {}): Promise<string> {
    const transferId = uuidv4();
    const defaultOptions: TransferOptions = {
      autoRedirect: false,
      chunkSize: 1024,
      timeout: 300000 // 5 minutes
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    // Convert data to chunks if needed
    let chunks: string[];
    if (typeof data.content === 'string') {
      chunks = chunkText(data.content, finalOptions.chunkSize!);
    } else {
      chunks = [data.content.toString('base64')];
    }

    this.activeTransfers.set(transferId, {
      data,
      chunks,
      currentChunk: 0,
      options: finalOptions
    });

    // Generate QR code with transfer information
    const qrData = {
      transferId,
      type: data.type,
      metadata: data.metadata,
      autoRedirect: finalOptions.autoRedirect,
      serverUrl: `http://localhost:${this.io.engine.port}`
    };

    return QRCode.toDataURL(JSON.stringify(qrData));
  }

  public async scanAndReceiveQR(qrData: string): Promise<TransferData> {
    const { transferId, serverUrl } = JSON.parse(qrData);
    
    return new Promise((resolve, reject) => {
      const socket = this.io.connect(serverUrl);
      let receivedChunks: string[] = [];
      let isComplete = false;

      socket.on('chunk_data', ({ data, isLast }) => {
        receivedChunks.push(data);
        if (isLast) {
          isComplete = true;
          socket.emit('transfer_complete', transferId);
        } else {
          socket.emit('request_chunk', transferId, receivedChunks.length);
        }
      });

      // Set timeout
      setTimeout(() => {
        if (!isComplete) {
          reject(new Error('Transfer timeout'));
        }
      }, 300000);

      // Start transfer
      socket.emit('request_chunk', transferId, 0);

      // Process received data
      socket.on('disconnect', () => {
        if (isComplete) {
          const transfer = this.activeTransfers.get(transferId);
          if (transfer) {
            if (transfer.data.type === 'file') {
              resolve({
                type: 'file',
                content: Buffer.from(receivedChunks.join(''), 'base64'),
                metadata: transfer.data.metadata
              });
            } else {
              resolve({
                type: transfer.data.type,
                content: receivedChunks.join(''),
                metadata: transfer.data.metadata
              });
            }
          }
        }
      });
    });
  }

  public getCopyableText(data: TransferData): string {
    if (data.type === 'text' || data.type === 'link') {
      return data.content.toString();
    }
    return '';
  }

  public async generateLinkQR(url: string, autoRedirect: boolean = false): Promise<string> {
    return this.generateTransferQR({
      type: 'link',
      content: url
    }, { autoRedirect });
  }
}

// Export a singleton instance
export const qrStreamTransfer = new QRStreamTransfer();

// Export types
export type { TransferOptions, TransferData }; 