'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Download, Printer } from 'lucide-react';

interface CertificateData {
  certificateNumber: string;
  studentName: string;
  companyName: string;
  title: string;
  startDate: string;
  endDate: string;
  issuedAt: string;
}

export function CertificateViewer({ certificate }: { certificate: CertificateData }) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (certRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Certificate - ${certificate.certificateNumber}</title>
              <style>
                body { margin: 0; padding: 40px; font-family: Georgia, serif; }
                .certificate {
                  border: 8px double #059669;
                  padding: 60px;
                  text-align: center;
                  max-width: 800px;
                  margin: 0 auto;
                  min-height: 500px;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  position: relative;
                }
                .certificate::before {
                  content: '';
                  position: absolute;
                  top: 12px; left: 12px; right: 12px; bottom: 12px;
                  border: 2px solid #059669;
                }
                .header { color: #059669; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 10px; }
                .title { font-size: 36px; font-weight: bold; color: #1a1a1a; margin-bottom: 30px; }
                .body-text { font-size: 16px; color: #333; line-height: 1.8; margin-bottom: 20px; }
                .name { font-size: 28px; font-weight: bold; color: #059669; margin: 15px 0; border-bottom: 2px solid #059669; display: inline-block; padding-bottom: 5px; }
                .details { margin: 20px 0; }
                .signature-section { display: flex; justify-content: space-around; margin-top: 50px; }
                .signature { text-align: center; }
                .signature-line { width: 200px; border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 12px; color: #666; }
                .footer { margin-top: 30px; font-size: 12px; color: #999; }
                .seal { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #059669; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 10px; color: #059669; }
              </style>
            </head>
            <body>
              ${certRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-CM', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Certificate Preview */}
      <div ref={certRef}>
        <Card className="border-4 border-double border-primary/30 overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            {/* Seal */}
            <div className="w-20 h-20 rounded-full border-4 border-primary mx-auto flex items-center justify-center">
              <Award className="w-10 h-10 text-primary" />
            </div>

            {/* Header */}
            <div className="text-primary text-sm tracking-[4px] uppercase font-medium">
              InternLink Cameroon
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Certificate of Internship
            </h2>

            {/* Divider */}
            <div className="w-32 h-1 bg-primary mx-auto rounded-full" />

            {/* Body */}
            <div className="space-y-4 text-muted-foreground max-w-lg mx-auto">
              <p>This is to certify that</p>
              <p className="text-2xl font-bold text-primary border-b-2 border-primary inline-block pb-1">
                {certificate.studentName}
              </p>
              <p>
                has successfully completed an internship as <strong>{certificate.title}</strong> at
              </p>
              <p className="text-2xl font-bold text-foreground">
                {certificate.companyName}
              </p>
              <p className="text-sm">
                from <strong>{formatDate(certificate.startDate)}</strong> to{' '}
                <strong>{formatDate(certificate.endDate)}</strong>
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-around pt-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-40 border-t border-muted-foreground/30 mt-12 pt-2 text-xs text-muted-foreground">
                  Company Supervisor
                  <br />
                  Signature
                </div>
              </div>
              <div className="text-center">
                <div className="w-40 border-t border-muted-foreground/30 mt-12 pt-2 text-xs text-muted-foreground">
                  InternLink Admin
                  <br />
                  Signature
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 text-xs text-muted-foreground">
              <p>Certificate No: {certificate.certificateNumber}</p>
              <p>Issued on: {formatDate(certificate.issuedAt)}</p>
              <p className="mt-1">Verify at: internlink.cm/verify/{certificate.certificateNumber}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
