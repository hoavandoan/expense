import { Card } from 'heroui-native';
import React, { FC } from 'react';
import { Image, Text } from 'react-native';

interface VietQRProps {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  description?: string;
  className?: string;
}

/**
 * Component to display VietQR code based on bank information.
 * Utilizes vietqr.io API for generation.
 */
export const VietQR: FC<VietQRProps> = ({
  bankName,
  accountNumber,
  accountName,
  amount,
  description,
  className,
}) => {
  // Example API: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<ACCOUNT_NAME>
  // Note: This is an example, in real app, bankName should be BANK_ID (e.g., mbbank, vcb)
  const qrUrl = `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.png?amount=${amount || ''}&addInfo=${encodeURIComponent(description || '')}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <Card variant="secondary" className={className}>
      <Card.Body className="items-center p-6">
        <Image
          source={{ uri: qrUrl }}
          className="w-64 h-64 mb-4 rounded-lg"
          resizeMode="contain"
        />
        <Text className="text-foreground font-bold text-lg">{accountName}</Text>
        <Text className="text-muted text-sm">{bankName.toUpperCase()} - {accountNumber}</Text>
        {amount && (
          <Text className="text-accent font-bold mt-2 text-xl">
            {amount.toLocaleString()}đ
          </Text>
        )}
      </Card.Body>
    </Card>
  );
};
