import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Gift, Tag, TrendingUp, Send, CheckCircle, Clock, XCircle, AlertCircle,
  BarChart3, Settings, RefreshCw, Copy, Search, ChevronDown, Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IncentiveSetting {
  setting_key: string;
  setting_value: any;
  description: string;
}

interface ReviewCoupon {
  id: string;
  coupon_code: string;
  phone: string;
  customer_name: string;
  coupon_type: string;
  discount_type: string;
  discount_value: number;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  email_sent: boolean;
  created_at: string;
}

interface Analytics {
  coupons: {
    total: number;
    used: number;
    active: number;
    expired: number;
    redemptionRate: number;
  };
  byType: {
    reviewIncentive: number;
    photoBonus: number;
  };
  reminders: {
    total: number;
    sent: number;
    skipped: number;
    pending: number;
    conversionRate: number;
  };
}

export function ReviewIncentiveAdminSection() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<IncentiveSetting[]>([]);
  const [coupons, setCoupons] = useState<ReviewCoupon[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Editable settings state
  const [incentiveSettings, setIncentiveSettings] = useState({
    first_review_enabled: true,
    first_review_type: 'percentage',
    first_review_value: 15,
    first_review_min_order: 500,
    first_review_expiry: 30,
    photo_bonus_enabled: true,
    photo_bonus_type: 'fixed',
    photo_bonus_value: 100,
    photo_bonus_min_order: 300,
    photo_bonus_expiry: 45,
    reminder_enabled: true,
    reminder_days: 7,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadSettings(), loadCoupons(), loadAnalytics()]);
    setLoading(false);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('review_incentive_settings')
      .select('*');
    if (error) return;

    const settingsMap: Record<string, any> = {};
    (data || []).forEach((s) => { settingsMap[s.setting_key] = s.setting_value; });

    const ri = settingsMap['first_review_incentive'] || {};
    const pb = settingsMap['photo_review_bonus'] || {};
    const rs = settingsMap['reminder_schedule'] || {};

    setIncentiveSettings({
      first_review_enabled: ri.enabled ?? true,
      first_review_type: ri.discount_type ?? 'percentage',
      first_review_value: ri.discount_value ?? 15,
      first_review_min_order: ri.min_order_amount ?? 500,
      first_review_expiry: ri.expiry_days ?? 30,
      photo_bonus_enabled: pb.enabled ?? true,
      photo_bonus_type: pb.discount_type ?? 'fixed',
      photo_bonus_value: pb.discount_value ?? 100,
      photo_bonus_min_order: pb.min_order_amount ?? 300,
      photo_bonus_expiry: pb.expiry_days ?? 45,
      reminder_enabled: rs.enabled ?? true,
      reminder_days: rs.days_after_delivery ?? 7,
    });

    setSettings(data || []);
  };

  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from('review_coupons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error) setCoupons(data || []);
  };

  const loadAnalytics = async () => {
    const { data, error } = await supabase.functions.invoke('review-incentive-engine', {
      body: { action: 'get_analytics' },
    });
    if (!error && data?.analytics) setAnalytics(data.analytics);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const updates = [
        {
          setting_key: 'first_review_incentive',
          setting_value: {
            enabled: incentiveSettings.first_review_enabled,
            discount_type: incentiveSettings.first_review_type,
            discount_value: incentiveSettings.first_review_value,
            min_order_amount: incentiveSettings.first_review_min_order,
            expiry_days: incentiveSettings.first_review_expiry,
          },
        },
        {
          setting_key: 'photo_review_bonus',
          setting_value: {
            enabled: incentiveSettings.photo_bonus_enabled,
            discount_type: incentiveSettings.photo_bonus_type,
            discount_value: incentiveSettings.photo_bonus_value,
            min_order_amount: incentiveSettings.photo_bonus_min_order,
            expiry_days: incentiveSettings.photo_bonus_expiry,
          },
        },
        {
          setting_key: 'reminder_schedule',
          setting_value: {
            enabled: incentiveSettings.reminder_enabled,
            days_after_delivery: incentiveSettings.reminder_days,
          },
        },
      ];

      for (const update of updates) {
        await supabase
          .from('review_incentive_settings')
          .update({ setting_value: update.setting_value, updated_at: new Date().toISOString() })
          .eq('setting_key', update.setting_key);
      }

      toast({ title: 'Settings Saved', description: 'Incentive program updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSavingSettings(false);
    }
  };

  const processReminders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('review-incentive-engine', {
        body: { action: 'process_reminders' },
      });
      if (error) throw error;
      toast({ title: 'Reminders Processed', description: `${data?.processed || 0} reminders sent` });
      loadAll();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: `Code ${code} copied to clipboard` });
  };

  const filteredCoupons = searchPhone
    ? coupons.filter(c => c.phone.includes(searchPhone) || c.customer_name.toLowerCase().includes(searchPhone.toLowerCase()))
    : coupons;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Review Incentive Program</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAll} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={processReminders} className="gap-2 bg-gradient-to-r from-primary to-accent text-white">
            <Send className="w-4 h-4" />
            Process Reminders
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList className="mb-6">
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="coupons" className="gap-2">
            <Tag className="w-4 h-4" /> Coupons
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {analytics ? (
            <div className="space-y-6">
              {/* Coupon Metrics */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Coupon Performance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnalyticsCard
                    label="Total Generated"
                    value={analytics.coupons.total}
                    icon={Tag}
                    color="blue"
                  />
                  <AnalyticsCard
                    label="Redeemed"
                    value={analytics.coupons.used}
                    icon={CheckCircle}
                    color="green"
                    sub={`${analytics.coupons.redemptionRate}% rate`}
                  />
                  <AnalyticsCard
                    label="Active"
                    value={analytics.coupons.active}
                    icon={Clock}
                    color="yellow"
                  />
                  <AnalyticsCard
                    label="Expired"
                    value={analytics.coupons.expired}
                    icon={XCircle}
                    color="red"
                  />
                </div>
              </div>

              {/* Coupon Type Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="font-semibold mb-4">Coupon Type Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm">Review Incentives</span>
                      </div>
                      <span className="font-bold">{analytics.byType.reviewIncentive}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: analytics.coupons.total > 0 ? `${(analytics.byType.reviewIncentive / analytics.coupons.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <span className="text-sm">Photo Bonuses</span>
                      </div>
                      <span className="font-bold">{analytics.byType.photoBonus}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: analytics.coupons.total > 0 ? `${(analytics.byType.photoBonus / analytics.coupons.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h3 className="font-semibold mb-4">Email Reminder Stats</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Sent', value: analytics.reminders.sent, color: 'text-blue-600' },
                      { label: 'Already Reviewed (Skipped)', value: analytics.reminders.skipped, color: 'text-green-600', note: `${analytics.reminders.conversionRate}% conversion` },
                      { label: 'Pending', value: analytics.reminders.pending, color: 'text-yellow-600' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                        </div>
                        <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Redemption Rate Visual */}
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Overall Redemption Rate</h3>
                  <span className="text-3xl font-bold text-primary">{analytics.coupons.redemptionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-4 rounded-full transition-all"
                    style={{ width: `${analytics.coupons.redemptionRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>Target: 25%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-xl text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No analytics data yet. Start by enabling the incentive program.</p>
            </div>
          )}
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone or name..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Summary */}
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Total: <strong>{filteredCoupons.length}</strong></span>
              <span className="text-green-600">Active: <strong>{filteredCoupons.filter(c => !c.is_used && c.expires_at && new Date(c.expires_at) > new Date()).length}</strong></span>
              <span className="text-blue-600">Used: <strong>{filteredCoupons.filter(c => c.is_used).length}</strong></span>
            </div>

            {/* Coupons Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Discount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Expires</th>
                      <th className="px-4 py-3 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          No coupons found
                        </td>
                      </tr>
                    ) : (
                      filteredCoupons.map((coupon) => {
                        const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                        const isActive = !coupon.is_used && !isExpired;
                        return (
                          <tr key={coupon.id} className="border-t hover:bg-secondary/30">
                            <td className="px-4 py-3">
                              <p className="font-medium">{coupon.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{coupon.phone}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                  {coupon.coupon_code}
                                </span>
                                <button
                                  onClick={() => copyCode(coupon.coupon_code)}
                                  className="p-1 hover:text-primary transition-colors"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                coupon.coupon_type === 'photo_review_bonus'
                                  ? 'bg-accent/20 text-accent-foreground'
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {coupon.coupon_type === 'photo_review_bonus' ? 'Photo Bonus' : 'Review Incentive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-primary">
                              {coupon.discount_type === 'percentage'
                                ? `${coupon.discount_value}%`
                                : `₹${coupon.discount_value}`}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                coupon.is_used ? 'bg-blue-100 text-blue-700' :
                                isExpired ? 'bg-gray-100 text-gray-600' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {coupon.is_used ? 'Used' : isExpired ? 'Expired' : 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {coupon.expires_at
                                ? new Date(coupon.expires_at).toLocaleDateString('en-IN')
                                : 'No expiry'}
                            </td>
                            <td className="px-4 py-3">
                              {coupon.email_sent ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* First Review Incentive */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">First Review Incentive</h3>
                  <p className="text-sm text-muted-foreground">Coupon sent to encourage customers to write their first review</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incentiveSettings.first_review_enabled}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, first_review_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {incentiveSettings.first_review_enabled && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Discount Type</Label>
                    <select
                      value={incentiveSettings.first_review_type}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, first_review_type: e.target.value })}
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      value={incentiveSettings.first_review_value}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, first_review_value: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Min Order Amount (₹)</Label>
                    <Input
                      type="number"
                      value={incentiveSettings.first_review_min_order}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, first_review_min_order: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Coupon Valid For (Days)</Label>
                    <Input
                      type="number"
                      value={incentiveSettings.first_review_expiry}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, first_review_expiry: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Photo Review Bonus */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Photo Review Bonus</h3>
                  <p className="text-sm text-muted-foreground">Extra bonus for reviews that include photos or videos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incentiveSettings.photo_bonus_enabled}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, photo_bonus_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {incentiveSettings.photo_bonus_enabled && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Discount Type</Label>
                    <select
                      value={incentiveSettings.photo_bonus_type}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, photo_bonus_type: e.target.value })}
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <Label>Bonus Value</Label>
                    <Input
                      type="number"
                      value={incentiveSettings.photo_bonus_value}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, photo_bonus_value: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Min Order Amount (₹)</Label>
                    <Input
                      type="number"
                      value={incentiveSettings.photo_bonus_min_order}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, photo_bonus_min_order: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Coupon Valid For (Days)</Label>
                    <Input
                      type="number"
                      value={incentiveSettings.photo_bonus_expiry}
                      onChange={(e) => setIncentiveSettings({ ...incentiveSettings, photo_bonus_expiry: Number(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reminder Schedule */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Review Reminder Schedule</h3>
                  <p className="text-sm text-muted-foreground">Automatically remind customers to review after service</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incentiveSettings.reminder_enabled}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, reminder_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {incentiveSettings.reminder_enabled && (
                <div className="max-w-xs">
                  <Label>Send Reminder After (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={incentiveSettings.reminder_days}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, reminder_days: Number(e.target.value) })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reminder sent {incentiveSettings.reminder_days} days after booking confirmation
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={saveSettings}
              disabled={savingSettings}
              className="bg-gradient-to-r from-primary to-accent text-white gap-2"
              size="lg"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
              Save All Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsCard({ label, value, icon: Icon, color, sub }: {
  label: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'yellow' | 'red';
  sub?: string;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {sub && <p className="text-xs font-medium text-primary mt-1">{sub}</p>}
    </div>
  );
}
