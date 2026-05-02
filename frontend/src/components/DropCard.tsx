'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drop, StockUpdate, NewPurchase } from '@/types/index';
import { useSocket } from '@/providers/socket-provider';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import { Users, Timer, ShoppingBag, Zap, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface DropCardProps {
  drop: Drop;
}

export default function DropCard({ drop: initialDrop }: DropCardProps) {
  const [drop, setDrop] = useState<Drop>(initialDrop);
  const { user } = useAuth();
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
        toast.info(`New purchase: ${data.userName}`, {
          icon: <ShoppingBag className="w-3.5 h-3.5 text-primary" />,
        });
        
        // Add new purchase to the list
        setDrop((prev) => ({
          ...prev,
          purchases: [
            {
              id: Math.random().toString(), // Temporary ID for UI
              userId: '',
              dropId: data.dropId,
              amount: prev.price,
              createdAt: new Date().toISOString(),
              user: { name: data.userName }
            },
            ...(prev.purchases || [])
          ].slice(0, 3) // Keep only top 3
        }));
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
    if (!user) {
      toast.error('Please login to reserve');
      return;
    }
    setIsReserving(true);
    try {
      const response = await api.post('/drops/reserve', {
        dropId: drop.id,
        userId: user.id,
      });
      setReservation(response.data.data);
      setTimeLeft(60);
      toast.success('Spot secured!');
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
        userId: user?.id,
      });
      setReservation(null);
      setTimeLeft(0);
      toast.success('Confirmed!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  const stockPercentage = (drop.availableStock / drop.totalStock) * 100;
  const isLowStock = drop.availableStock < 10 && drop.availableStock > 0;

  return (
    <Card className="group relative overflow-hidden border-none bg-background shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Visual Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted/40">
        <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent z-10" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap className="w-16 h-16 text-primary scale-90 group-hover:scale-100 transition-transform duration-500" />
        </div>
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-background/90 text-foreground backdrop-blur-md border-none shadow-xs px-2 py-0.5 text-[9px] font-bold">
            ${drop.price}
          </Badge>
        </div>
        
        {isLowStock && (
          <div className="absolute top-3 right-3 z-20">
            <Badge variant="destructive" className="animate-pulse shadow-sm px-2 py-0.5 text-[9px] font-bold border-none uppercase">
              Low
            </Badge>
          </div>
        )}

        {reservation && (
          <div className="absolute inset-0 z-30 bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center text-primary-foreground p-4 animate-in fade-in duration-200">
            <Timer className="w-6 h-6 mb-2 animate-pulse" />
            <h4 className="text-sm font-black uppercase mb-0.5">Secured</h4>
            <p className="text-[9px] opacity-80 mb-4 uppercase">{timeLeft}s</p>
            <Button 
              className="w-full bg-white text-primary hover:bg-white/90 rounded-lg font-bold h-9 text-[10px] uppercase shadow-lg" 
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? '...' : 'Checkout'}
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors line-clamp-1">
            {drop.name}
          </h3>
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
            {drop.description || 'Premium limited edition release with exceptional design.'}
          </p>
        </div>

        {/* Stock Status */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              Stock
            </span>
            <span className={`text-[9px] font-black ${isLowStock ? 'text-destructive' : 'text-primary'}`}>
              {drop.availableStock}/{drop.totalStock}
            </span>
          </div>
          <div className="relative h-1 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isLowStock ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        {/* Community Proof & Activity Feed */}
        <div className="space-y-3 pt-0.5">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {(drop.purchases?.length || 0) > 0 ? (
                    drop.purchases?.slice(0, 3).map((p, i) => (
                      <div key={p.id} className="h-5 w-5 rounded-full border border-background bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                        {p.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))
                  ) : (
                    [1, 2].map((i) => (
                      <div key={i} className="h-5 w-5 rounded-full border border-background bg-muted flex items-center justify-center">
                        <Users className="w-2 h-2 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
                <span className="text-[9px] font-semibold text-muted-foreground">
                  {drop.purchases?.length || 0} secured
                </span>
             </div>
          </div>

          {/* Activity Feed (Top 3 Purchasers) */}
          {drop.purchases && drop.purchases.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-2 space-y-1.5">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest px-1">Recent Buyers</p>
              <div className="space-y-1">
                {drop.purchases.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-1 animate-in slide-in-from-left-1 duration-300">
                    <div className="w-1 h-1 rounded-full bg-primary/40" />
                    <span className="text-[10px] font-medium text-foreground/80">{p.user.name}</span>
                    <span className="text-[8px] text-muted-foreground ml-auto">just now</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {!reservation && (
          user ? (
            <Button 
              className={`w-full rounded-lg h-9 font-bold transition-all uppercase text-[9px] ${drop.availableStock <= 0 ? 'bg-muted' : 'bg-primary hover:bg-primary/90'}`} 
              disabled={drop.availableStock <= 0 || isReserving}
              onClick={handleReserve}
            >
              {drop.availableStock <= 0 ? 'Sold Out' : isReserving ? '...' : 'Reserve Spot'}
            </Button>
          ) : (
            <Link href="/login" className="w-full">
              <Button 
                className="w-full rounded-lg h-9 font-bold transition-all uppercase text-[9px] group/btn" 
                variant="outline"
                disabled={drop.availableStock <= 0}
              >
                {drop.availableStock <= 0 ? 'Sold Out' : (
                  <span className="flex items-center gap-1">
                    Login
                    <ChevronRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </Button>
            </Link>
          )
        )}
      </CardFooter>
    </Card>
  );
}




