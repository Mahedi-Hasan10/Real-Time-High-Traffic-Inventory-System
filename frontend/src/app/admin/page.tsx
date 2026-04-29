'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Users, PlusCircle, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDrop, setNewDrop] = useState({
    name: '',
    price: '',
    totalStock: '',
    startTime: '',
    description: ''
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      } else {
        fetchReservations();
      }
    }
  }, [user, authLoading, router]);

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/drops/admin/reservations');
      setReservations(data.data);
    } catch (err) {
      toast.error('Failed to fetch reservations');
    }
  };

  const handleCreateDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/drops/initialize', {
        ...newDrop,
        price: parseFloat(newDrop.price),
        totalStock: parseInt(newDrop.totalStock),
      });
      toast.success('New drop initialized successfully!');
      setNewDrop({ name: '', price: '', totalStock: '', startTime: '', description: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create drop');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user || user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Hello, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add New Item */}
          <Card className="lg:col-span-1 shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                Add New Merch Drop
              </CardTitle>
              <CardDescription>Initialize a new high-demand sneaker drop</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateDrop}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input 
                    id="name" 
                    required 
                    value={newDrop.name}
                    onChange={(e) => setNewDrop({ ...newDrop, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newDrop.price}
                    onChange={(e) => setNewDrop({ ...newDrop, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Total Stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    required 
                    value={newDrop.totalStock}
                    onChange={(e) => setNewDrop({ ...newDrop, totalStock: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input 
                    id="startTime" 
                    type="datetime-local" 
                    required 
                    value={newDrop.startTime}
                    onChange={(e) => setNewDrop({ ...newDrop, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input 
                    id="desc" 
                    value={newDrop.description}
                    onChange={(e) => setNewDrop({ ...newDrop, description: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <Button className="w-full font-bold" disabled={isSubmitting}>
                  {isSubmitting ? 'INITIALIZING...' : 'INITIALIZE DROP'}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Reserved User List */}
          <Card className="lg:col-span-2 shadow-lg border-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Reserved User List
                </CardTitle>
                <CardDescription>All active and expired reservations</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchReservations}>Refresh</Button>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto rounded-lg border">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Reserved At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.length > 0 ? (
                      reservations.map((res) => (
                        <tr key={res.id} className="bg-card border-b hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="font-medium">{res.user.name}</div>
                            <div className="text-[10px] text-muted-foreground">{res.user.email}</div>
                          </td>
                          <td className="px-4 py-3">{res.drop.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant={
                              res.status === 'COMPLETED' ? 'default' : 
                              res.status === 'PENDING' ? 'secondary' : 'destructive'
                            }>
                              {res.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(res.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                          No reservations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
