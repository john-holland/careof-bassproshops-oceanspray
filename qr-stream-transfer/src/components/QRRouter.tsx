import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { qrStreamTransfer, TransferData } from '../index';

interface Page {
    name: string;
    uri: string;
    parentPage?: Page;
    childrenPages: Page[];
}

class Page {
    constructor(name: string, uri: string) {
        this.name = name;
        this.uri = uri;
        this.childrenPages = [];
    }

    getUri(): string {
        return this.uri;
    }

    getLocation(): string {
        return window.location.origin + this.uri;
    }

    getParent(): Page | undefined {
        return this.parentPage;
    }

    getChildren(): Page[] {
        return this.childrenPages;
    }
}

interface RouterState {
    currentPage: Page;
    history: Page[];
}

class Router {
    private state: RouterState;

    constructor(initialPage: Page) {
        this.state = {
            currentPage: initialPage,
            history: [initialPage]
        };
    }

    push(page: Page): void {
        page.parentPage = this.state.currentPage;
        this.state.history.push(page);
        this.state.currentPage = page;
        window.history.pushState({}, '', page.getUri());
    }

    pop(): void {
        if (this.state.history.length > 1) {
            this.state.history.pop();
            this.state.currentPage = this.state.history[this.state.history.length - 1];
            window.history.back();
        }
    }

    getCurrentPage(): Page {
        return this.state.currentPage;
    }

    getHistory(): Page[] {
        return this.state.history;
    }
}

// Initialize pages
const main = new Page("main", "/");
const info = new Page("info", "/info");
const fish = new Page("fish", "/fish");

// Set up page hierarchy
main.childrenPages = [info, fish];
info.parentPage = main;
fish.parentPage = main;

// Create router instance
const router = new Router(main);

interface QRRouterProps {
    onDataReceived?: (data: TransferData) => void;
    autoRedirect?: boolean;
}

export const QRRouter: React.FC<QRRouterProps> = ({ 
    onDataReceived,
    autoRedirect = false 
}) => {
    const [qrCode, setQrCode] = useState<string>('');
    const [showScanner, setShowScanner] = useState(false);
    const [navigationAnnouncement, setNavigationAnnouncement] = useState('');

    // Generate QR code for current page
    useEffect(() => {
        const currentPage = router.getCurrentPage();
        const pageUri = currentPage.getLocation();
        
        // Update navigation announcement when route changes
        const buildNavigationPath = (page: Page): string => {
            const path = [page.name];
            let parent = page.getParent();
            while (parent) {
                path.unshift(parent.name);
                parent = parent.getParent();
            }
            return path.join(' > ');
        };

        setNavigationAnnouncement(
            `Current location: ${buildNavigationPath(currentPage)}. Page URI: ${pageUri}`
        );
        
        qrStreamTransfer.generateTransferQR({
            type: 'text',
            content: pageUri
        }).then(qr => {
            setQrCode(qr);
        });
    }, [router.getCurrentPage()]);

    const handleQRScan = async (result: any) => {
        if (result) {
            try {
                const scannedUri = result.text;
                const pageUri = new URL(scannedUri).pathname;
                
                // Find matching page
                const findPage = (pages: Page[]): Page | undefined => {
                    for (const page of pages) {
                        if (page.uri === pageUri) return page;
                        const found = findPage(page.childrenPages);
                        if (found) return found;
                    }
                    return undefined;
                };

                const targetPage = findPage([main]);
                if (targetPage) {
                    router.push(targetPage);
                    if (autoRedirect) {
                        window.location.href = scannedUri;
                    }
                }
            } catch (error) {
                console.error('Error processing QR code:', error);
            }
        }
    };

    return (
        <>
            {/* ARIA live region for route announcements */}
            <div 
                aria-live="polite" 
                aria-atomic="true"
                className="sr-only"
                role="status"
            >
                {navigationAnnouncement}
            </div>

            <div className="qr-router">
                <h1>QRRouter</h1>
                <p>Current Page: {router.getCurrentPage().name}</p>
                <p>Current URI: {router.getCurrentPage().getLocation()}</p>
                
                {qrCode && (
                    <div className="qr-code-container">
                        <h2>Page QR Code</h2>
                        <img src={qrCode} alt="Page QR Code" />
                    </div>
                )}

                <button 
                    onClick={() => setShowScanner(!showScanner)}
                    aria-expanded={showScanner}
                    aria-controls="qr-scanner"
                    className="scanner-toggle"
                >
                    {showScanner ? 'Hide Scanner' : 'Show Scanner'}
                </button>

                {showScanner && (
                    <div id="qr-scanner" className="scanner-container">
                        <h2>Scan QR Code</h2>
                        <QrReader
                            onResult={handleQRScan}
                            style={{ width: '100%' }}
                        />
                    </div>
                )}
            </div>
        </>
    );
};