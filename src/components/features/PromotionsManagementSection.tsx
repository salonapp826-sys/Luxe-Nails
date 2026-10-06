import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, Ban, Loader2 } from 'lucide-react';
import { formatINR } from '@/lib/homeServiceCharges';

// ... (interface remains same)

export function PromotionsManagementSection() {
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  // ... (rest of component state remains same)

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('website_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load promotions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ... (handleSubmit, toggleActive, deletePromotion need website_id)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const promoData = {
      ...formData,
      website_id: tenant.id,
      discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null,
      discount_amount: formData.discount_amount ? parseInt(formData.discount_amount) : null,
      valid_until: formData.valid_until || null,
      is_active: true,
    };

    try {
      if (editingPromo) {
        const { error } = await supabase
          .from('promotions')
          .update(promoData)
          .eq('id', editingPromo.id)
          .eq('website_id', tenant.id);

        if (error) throw error;
        toast({ title: 'Promotion Updated' });
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert([promoData]);

        if (error) throw error;
        toast({ title: 'Promotion Created' });
      }

      resetForm();
      fetchPromotions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .eq('website_id', tenant.id);

      if (error) throw error;
      toast({ title: currentStatus ? 'Promotion Disabled' : 'Promotion Enabled' });
      fetchPromotions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update promotion',
        variant: 'destructive',
      });
    }
  };

  const deletePromotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id)
        .eq('website_id', tenant.id);

      if (error) throw error;
      toast({ title: 'Promotion Deleted' });
      fetchPromotions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete promotion',
        variant: 'destructive',
      });
    }
  };


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount_percentage: '',
      discount_amount: '',
      code: '',
      image_url: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      terms_conditions: '',
    });
    setEditingPromo(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promotions & Offers</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Promotion'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingPromo ? 'Edit Promotion' : 'Create New Promotion'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., 30% OFF on All Services"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="code">Promo Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., SALE30"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the offer..."
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                placeholder="e.g., 30"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount_amount">Discount Amount (₹)</Label>
              <Input
                id="discount_amount"
                type="number"
                min="0"
                value={formData.discount_amount}
                onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                placeholder="e.g., 500"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/promo-image.jpg"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="valid_from">Valid From *</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                min={formData.valid_from}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                placeholder="e.g., Valid on premium services only. Cannot be combined with other offers."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button type="submit" className="bg-gradient-to-r from-primary to-accent text-white">
              {editingPromo ? 'Update Promotion' : 'Create Promotion'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Valid Until</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No promotions yet. Create your first promotion!
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id} className="border-t hover:bg-secondary/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{promo.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {promo.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {promo.discount_percentage
                        ? `${promo.discount_percentage}%`
                        : promo.discount_amount
                        ? formatINR(promo.discount_amount)
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {promo.code ? (
                        <span className="font-mono bg-primary/10 px-2 py-1 rounded text-sm">
                          {promo.code}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {promo.valid_until
                        ? new Date(promo.valid_until).toLocaleDateString('en-IN')
                        : 'No expiry'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          promo.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(promo)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={promo.is_active ? 'secondary' : 'default'}
                          onClick={() => toggleActive(promo.id, promo.is_active)}
                        >
                          {promo.is_active ? <Ban className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePromotion(promo.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
