import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
    businessId?: string;
    businessName?: string;
    businessAddress?: string;
}

function QRCodeGenerator({
    businessId = 'default-business',
    businessName = 'My Business',
    businessAddress
}: QRCodeGeneratorProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [qrData, setQrData] = useState('');

    // Generate QR code data
    useEffect(() => {
        const paymentData = {
            type: 'spark_payment',
            businessId,
            businessName,
            businessAddress,
            amount: amount ? parseFloat(amount) : undefined,
            description: description || undefined,
            timestamp: Date.now(),
            version: '1.0'
        };

        setQrData(JSON.stringify(paymentData));
    }, [businessId, businessName, businessAddress, amount, description]);

    const handleDownload = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${businessName}-qr-code.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);

        toast({
            title: "QR Code Downloaded",
            description: "Your QR code has been saved as a PNG file.",
        });
    };

    const handleCopyData = async () => {
        try {
            await navigator.clipboard.writeText(qrData);
            toast({
                title: "QR Data Copied",
                description: "QR code data has been copied to clipboard.",
            });
        } catch (error) {
            toast({
                title: "Copy Failed",
                description: "Could not copy QR data to clipboard.",
                variant: "destructive"
            });
        }
    };

    const handleRefresh = () => {
        // Force re-render with new timestamp
        const paymentData = {
            type: 'spark_payment',
            businessId,
            businessName,
            businessAddress,
            amount: amount ? parseFloat(amount) : undefined,
            description: description || undefined,
            timestamp: Date.now(),
            version: '1.0'
        };
        setQrData(JSON.stringify(paymentData));

        toast({
            title: "QR Code Refreshed",
            description: "Generated new QR code with updated timestamp.",
        });
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code Display */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        Payment QR Code
                        <Badge variant="outline" className="text-xs">
                            {amount ? `₹${amount}` : 'Dynamic'}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg">
                        <QRCodeSVG
                            id="qr-code-svg"
                            value={qrData}
                            size={200}
                            level="M"
                            includeMargin={true}
                        />
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">
                            Scan to pay {businessName}
                        </p>
                        {amount && (
                            <p className="text-lg font-bold text-green-400">
                                Amount: ₹{amount}
                            </p>
                        )}
                        {description && (
                            <p className="text-sm text-gray-300">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleDownload}
                            variant="outline"
                            size="sm"
                            className="text-white border-gray-600"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button
                            onClick={handleCopyData}
                            variant="outline"
                            size="sm"
                            className="text-white border-gray-600"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Data
                        </Button>
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            size="sm"
                            className="text-white border-gray-600"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* QR Code Settings */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Payment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-gray-400">
                            Amount (₹) - Optional
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="Enter amount or leave blank for dynamic"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white"
                        />
                        <p className="text-xs text-gray-500">
                            Leave empty for customers to enter amount
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-gray-400">
                            Description - Optional
                        </Label>
                        <Input
                            id="description"
                            placeholder="e.g., Coffee and snacks"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-white mb-2">Business Info</h4>
                        <div className="space-y-1 text-sm text-gray-400">
                            <p><strong>Name:</strong> {businessName}</p>
                            <p><strong>ID:</strong> {businessId}</p>
                            {businessAddress && (
                                <p><strong>Address:</strong> {businessAddress.slice(0, 8)}...{businessAddress.slice(-6)}</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-medium text-white mb-2">How to Use</h4>
                        <ul className="text-xs text-gray-400 space-y-1">
                            <li>• Display QR code at your business</li>
                            <li>• Customers scan with S.P.A.R.K. app</li>
                            <li>• Payments go directly to your wallet</li>
                            <li>• Earn rewards for each transaction</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
export { QRCodeGenerator };
