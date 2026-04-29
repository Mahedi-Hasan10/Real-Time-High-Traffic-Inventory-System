'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api.js';
import { Drop } from '@/types/index.js';
import DropCard from '@/components/DropCard.js';
import { Skeleton } from '@/components/ui/skeleton.js';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button.js';

export default function Dashboard() {
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['drops'],
    queryFn: async () => {
      const { data } = await api.get('/drops');
      return data;
    },
  });

  const drops: Drop[] = response?.data || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">SneakerDrop</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Exclusive Merch Drops</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            High-demand items with real-time stock tracking. Reserve your spot before it's gone!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/20">
            <h3 className="text-lg font-semibold text-destructive">Failed to load drops</h3>
            <p className="text-muted-foreground">Please check your backend connection and try again.</p>
            <Button onClick={() => refetch()} variant="link" className="mt-2">Try again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drops.length > 0 ? (
              drops.map((drop) => (
                <DropCard key={drop.id} drop={drop} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                <p className="text-muted-foreground">No active drops available right now.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 SneakerDrop Inventory System. Professional Engineering Demonstration.
        </div>
      </footer>
    </main>
  );
}
