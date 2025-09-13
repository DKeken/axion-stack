'use client';

import { useCallback } from 'react';

import { Copy, ExternalLink, PlugZap, Power, Wallet } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import { useWallet } from '~/hooks/use-wallet';
import { useWalletUtils } from '~/utils/wallet';

interface WalletCardProps {
  onError: (error: string | null) => void;
  className?: string;
}

export function WalletCard({ onError, className }: WalletCardProps) {
  const walletHook = useWallet();
  const walletUtils = useWalletUtils(walletHook, onError);

  const walletStatus = walletUtils.getWalletStatus();
  const actionButtonText = walletUtils.getActionButtonText();

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address).catch((error) => {
      console.error('Failed to copy address:', error);
    });
    toast.success('Адрес скопирован');
  }, []);

  const handleExploreAddress = useCallback((address: string) => {
    const explorerUrl = `https://trywagmi.xyz/address/${address}`;
    window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    toast.success('Адрес открыт в explorer');
  }, []);

  const renderWalletContent = () => {
    if (walletStatus.isConnected && walletStatus.walletAddress) {
      return (
        <div className='space-y-3'>
          <div className='p-3 bg-chart-4/10 rounded-lg border border-chart-4/30'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-2 h-2 rounded-full bg-chart-4' />
              <span className='text-xs font-medium text-muted-foreground'>АКТИВНЫЙ КОШЕЛЕК</span>
              <Badge
                className='ml-auto bg-chart-4/20 text-chart-4 border-chart-4/40'
                variant='default'
              >
                Подключен
              </Badge>
            </div>
            <p className='font-mono text-sm bg-background/60 p-2 rounded border'>
              {walletUtils.formatWalletAddress(walletStatus.walletAddress)}
            </p>
            <div className='flex gap-2 mt-2'>
              <Button
                className='flex-1 h-8 cursor-pointer'
                size='sm'
                variant='outline'
                onClick={() => {
                  if (walletStatus.walletAddress) {
                    handleCopyAddress(walletStatus.walletAddress);
                  }
                }}
              >
                <Copy className='h-3 w-3 mr-1' />
                Копировать
              </Button>
              <Button
                className='h-8 px-2 cursor-pointer'
                size='sm'
                variant='outline'
                onClick={() => {
                  if (walletStatus.walletAddress) {
                    handleExploreAddress(walletStatus.walletAddress);
                  }
                }}
              >
                <ExternalLink className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='text-center py-4'>
        <div className='p-6 border-2 border-dashed border-border/50 rounded-lg bg-muted/10'>
          <Wallet className='h-6 w-6 text-muted-foreground mx-auto mb-2' />
          <p className='text-sm font-medium mb-1'>Кошелек не подключен</p>
          <p className='text-xs text-muted-foreground'>Подключите для доступа к DeFi функциям</p>
        </div>
      </div>
    );
  };

  const handleButtonClick = () => {
    if (walletStatus.isConnected) {
      void walletUtils.onDisconnectWallet();
    } else {
      void walletUtils.onConnectWallet();
    }
  };

  return (
    <Card className={`border-border/50 ${className || ''}`}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Wallet className='h-4 w-4' />
          Кошелек
        </CardTitle>
        <CardDescription className='text-xs'>Управление криптокошельком</CardDescription>
      </CardHeader>

      <CardContent className='pt-0 space-y-4'>
        {renderWalletContent()}

        <Button
          className='w-full h-9'
          disabled={walletStatus.isLoading}
          variant={walletStatus.isConnected ? 'destructive' : 'default'}
          onClick={handleButtonClick}
        >
          {walletStatus.isLoading && <Spinner className='mr-2' size='sm' />}
          {walletStatus.isConnected ? (
            <Power className='mr-2 h-4 w-4' />
          ) : (
            <PlugZap className='mr-2 h-4 w-4' />
          )}
          {actionButtonText}
        </Button>
      </CardContent>
    </Card>
  );
}
