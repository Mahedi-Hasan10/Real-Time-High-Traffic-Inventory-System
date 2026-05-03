'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Drop } from '@/types/index';
import DropCard from '@/components/DropCard';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingBag, 
  RefreshCw, 
  LayoutDashboard, 
  LogOut, 
  User as UserIcon, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Mail,
  TrendingUp,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';

export default function Dashboard() {
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['drops'],
    queryFn: async () => {
      const { data } = await api.get('/drops');
      return data;
    },
  });

  const { user, logout } = useAuth();
  const drops: Drop[] = response?.data || [];

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary p-1.5 rounded-lg transition-transform group-hover:scale-105 duration-300">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">SneakerDrop</h1>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Drops</Link>
            <Link href="#" className="hover:text-primary transition-colors">Upcoming</Link>
            <Link href="#" className="hover:text-primary transition-colors">Community</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 hidden lg:flex h-8 rounded-full text-xs">
              <RefreshCw className="w-3 h-3" />
              Sync
            </Button>
            {user ? (
              <div className="flex items-center gap-2 bg-muted/50 p-1 pl-3 rounded-full border border-border">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-[10px] font-bold leading-none">{user.name}</span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">{user.role}</span>
                </div>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full bg-primary/10 text-primary">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="secondary" size="sm" className="h-7 px-2.5 rounded-full text-[10px]">Admin</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="h-8 gap-2 rounded-full px-4 text-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-70" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20 text-[10px]">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                </span>
                New Drop arriving in 24h
              </span>
            </Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
              The Future of <span className="text-primary italic">Exclusive</span> Merch.
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Experience the adrenaline of high-demand drops with real-time tracking and bot protection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="sm" className="h-10 px-6 rounded-full text-sm group">
                Explore Drops
                <ArrowRight className="ml-2 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="sm" variant="outline" className="h-10 px-6 rounded-full text-sm">
                How it works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card border rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Instant Sync</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Powered by WebSockets for sub-millisecond stock updates.
              </p>
            </div>
            <div className="p-6 bg-card border rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Atomic Reservations</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Distributed locking mechanism ensures double-spending is impossible.
              </p>
            </div>
            <div className="p-6 bg-card border rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Bot Protection</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Advanced behavioral analysis keeps sneakers in the hands of real people.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content (Drops) */}
      <section id="drops" className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-8 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Active Drops</h2>
            <p className="text-sm text-muted-foreground">Limited quantities. High demand.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <span>1.2k users browsing now</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[140px] w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-destructive/5 rounded-2xl border border-destructive/20 border-dashed">
            <div className="bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-destructive">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-destructive">Connection Lost</h3>
            <p className="text-xs text-muted-foreground mb-4">We couldn't connect to inventory servers.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-full px-6">
              Reconnect
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {drops.length > 0 ? (
              drops.map((drop) => (
                <DropCard key={drop.id} drop={drop} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-muted-foreground text-base">No active drops available.</p>
                <Button variant="link" size="sm" className="text-primary text-xs">View calendar</Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">50k+</div>
              <div className="text-primary-foreground/70 text-[10px] font-medium uppercase tracking-wider">Drops</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-primary-foreground/70 text-[10px] font-medium uppercase tracking-wider">Uptime</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">120+</div>
              <div className="text-primary-foreground/70 text-[10px] font-medium uppercase tracking-wider">Brands</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">0.5s</div>
              <div className="text-primary-foreground/70 text-[10px] font-medium uppercase tracking-wider">Sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-card border rounded-3xl p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[60px] -mr-24 -mt-24" />
            
            <div className="flex-1 space-y-4 text-center lg:text-left relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                Never miss a drop again.
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Get notified 15 minutes before any major drop happens.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input placeholder="Your email" className="pl-9 h-9 rounded-full text-xs" />
                </div>
                <Button size="sm" className="h-9 px-6 rounded-full text-xs">Subscribe</Button>
              </div>
            </div>
            
            <div className="flex-1 hidden lg:flex justify-center relative">
               <div className="relative group">
                 <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                 <div className="w-48 h-48 bg-card border-2 border-muted rounded-2xl rotate-6 flex items-center justify-center p-3 relative z-10 shadow-xl">
                    <div className="space-y-2 w-full">
                      <div className="h-3 bg-muted rounded-full w-3/4" />
                      <div className="h-3 bg-muted rounded-full w-1/2" />
                      <div className="h-20 bg-primary/5 rounded-xl w-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-primary/20" />
                      </div>
                      <div className="h-7 bg-primary/80 rounded-lg w-full" />
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <ShoppingBag className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold tracking-tight">SneakerDrop</h1>
              </div>
              <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
                The world's most reliable high-traffic inventory management system. Built for scale, designed for fairness.
              </p>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-card border hover:text-primary">
                <Globe className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-xs">Platform</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">How it works</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Brands</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-xs">Support</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Status</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">API Docs</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground">
            <p>© 2026 SneakerDrop System. Engineering Demo.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-primary">Privacy</Link>
              <Link href="#" className="hover:text-primary">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}


