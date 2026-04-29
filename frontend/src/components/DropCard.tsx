'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drop, StockUpdate, NewPurchase } from '@/types/index';
import { useSocket } from '@/providers/socket-provider';
import { toast } from 'sonner';
import { Users, Timer, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';

interface DropCardProps {
  drop: Drop;
  userId?: string;
}

export default function DropCard({ drop: initialDrop, userId }: DropCardProps) {
  const [drop, setDrop] = useState<Drop>(initialDrop);
  const { socket } = useSocket();
  const [isReserving, setIsReserving] = useState(false);
  const [reservation, setReservation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && reservation) {
      setReservation(null);
      toast.error('Reservation expired!');
    }
    return () => clearInterval(timer);
  }, [timeLeft, reservation]);

  const handleReserve = async () => {
    if (!userId) {
      toast.error('Please wait for demo user to load');
      return;
    }
    setIsReserving(true);
    try {
      const response = await api.post('/drops/reserve', {
        dropId: drop.id,
        userId: userId,
      });
      setReservation(response.data.data);
      setTimeLeft(60);
      toast.success('Reserved! You have 60 seconds to checkout.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reserve');
    } finally {
      setIsReserving(false);
    }
  };

  const handlePurchase = async () => {
    if (!reservation) return;
    setIsPurchasing(true);
    try {
      await api.post('/drops/purchase', {
        reservationId: reservation.id,
        userId: userId,
      });
      setReservation(null);
      setTimeLeft(0);
      toast.success('Purchase successful! Thank you.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
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
        {reservation ? (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-orange-500 animate-pulse">
              <span>RESERVATION ACTIVE</span>
              <span>{timeLeft}s remaining</span>
            </div>
            <Button 
              className="w-full font-bold bg-orange-600 hover:bg-orange-700" 
              size="lg"
              disabled={isPurchasing}
              onClick={handlePurchase}
            >
              {isPurchasing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full font-bold transition-all" 
            size="lg"
            disabled={drop.availableStock <= 0 || isReserving}
            onClick={handleReserve}
          >
            {drop.availableStock <= 0 ? 'SOLD OUT' : isReserving ? 'RESERVING...' : 'RESERVE NOW'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
