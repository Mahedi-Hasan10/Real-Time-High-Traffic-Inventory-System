'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ShoppingBag, LayoutDashboard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchMyReservations();
      }
    }
  }, [user, authLoading, router]);

  const fetchMyReservations = async () => {
    try {
      const { data } = await api.get('/drops/my-reservations');
      setReservations(data.data);
    } catch (err) {
      toast.error('Failed to fetch your reservations');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'EXPIRED': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">SneakerDrop</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden md:inline">Logged in as {user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-extrabold tracking-tight">My Dashboard</h2>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle>My Reservation History</CardTitle>
              <CardDescription>Track your drops and purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-20 text-center">Loading your history...</div>
              ) : reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {getStatusIcon(res.status)}
                        </div>
                        <div>
                          <h4 className="font-bold">{res.drop.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(res.createdAt).toLocaleDateString()} at {new Date(res.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold">${res.drop.price}</span>
                        <Badge variant={
                          res.status === 'COMPLETED' ? 'default' : 
                          res.status === 'PENDING' ? 'secondary' : 'destructive'
                        }>
                          {res.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground">You haven't made any reservations yet.</p>
                  <Link href="/">
                    <Button variant="link" className="mt-2">Browse active drops</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
