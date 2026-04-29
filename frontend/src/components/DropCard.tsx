'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Badge } from '@/components/ui/badge.js';
import { Button } from '@/components/ui/button.js';
import { Drop, StockUpdate, NewPurchase } from '@/types/index.js';
import { useSocket } from '@/providers/socket-provider.js';
import { toast } from 'sonner';
import { Users, Timer, ShoppingCart } from 'lucide-react';

interface DropCardProps {
  drop: Drop;
}

export default function DropCard({ drop: initialDrop }: DropCardProps) {
  const [drop, setDrop] = useState<Drop>(initialDrop);
  const { socket } = useSocket();
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleStockUpdate = (data: StockUpdate) => {
      if (data.dropId === drop.id) {
        setDrop((prev) => ({ ...prev, availableStock: data.availableStock }));
      }
    };

    const handleNewPurchase = (data: NewPurchase) => {
      if (data.dropId === drop.id) {
        // Optimistically update purchasers list if needed, 
        // or just show a toast for feedback
        toast.info(`New purchase success: ${data.userName}`);
      }
    };

    socket.on('stockUpdate', handleStockUpdate);
    socket.on('newPurchase', handleNewPurchase);

    return () => {
      socket.off('stockUpdate', handleStockUpdate);
      socket.off('newPurchase', handleNewPurchase);
    };
  }, [socket, drop.id]);

  const handleReserve = async () => {
    setIsReserving(true);
    try {
      // Mocking reservation for now - we will implement the API call in next step
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: 'Reserving your spot...',
          success: 'Reserved! You have 60 seconds to checkout.',
          error: 'Sold out or error occurred',
        }
      );
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{drop.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{drop.description || 'Exclusive Sneaker Drop'}</p>
          </div>
          <Badge variant={drop.availableStock > 0 ? "default" : "destructive"} className="px-3 py-1">
            ${drop.price}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span>Available Stock</span>
          </div>
          <span className={`text-2xl font-bold ${drop.availableStock < 10 ? 'text-destructive animate-pulse' : ''}`}>
            {drop.availableStock}
          </span>
        </div>

        {/* Activity Feed */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Users className="w-3 h-3" />
            <span>Recent Purchasers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {drop.purchases && drop.purchases.length > 0 ? (
              drop.purchases.slice(0, 3).map((p, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                  {p.user.name}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No purchases yet</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 border-t flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Timer className="w-3 h-3" />
          <span>Next Drop: {new Date(drop.startTime).toLocaleString()}</span>
        </div>
        <Button 
          className="w-full font-bold transition-all" 
          size="lg"
          disabled={drop.availableStock <= 0 || isReserving}
          onClick={handleReserve}
        >
          {drop.availableStock <= 0 ? 'SOLD OUT' : isReserving ? 'RESERVING...' : 'RESERVE NOW'}
        </Button>
      </CardFooter>
    </Card>
  );
}
