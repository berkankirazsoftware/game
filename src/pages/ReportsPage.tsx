import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Activity, MousePointer, Trophy, Eye, Smartphone, Globe, Ticket, Gamepad2, ShoppingCart } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsStat {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface AnalyticsData {
  impressions: number;
  opens: number;
  game_plays: number;
  conversions: number;
  daily_stats: {
    date: string;
    impressions: number;
    opens: number;
    conversions: number;
  }[];
  platform_stats?: { name: string; value: number; }[];
  language_stats?: { name: string; value: number; }[];
  coupon_stats?: { name: string; value: number; }[];
  game_stats?: { name: string; value: number; }[];
  cart_visits?: number;
  checkout_visits?: number;
  purchases?: number;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
      if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      if (dateRange === '90d') startDate.setDate(startDate.getDate() - 90);

      const { data, error } = await supabase.rpc('get_analytics_report', {
        p_user_id: user!.id,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString()
      });

      if (error) throw error;

      setData(data as unknown as AnalyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats: AnalyticsStat[] = [
    {
      label: 'Görüntülenme',
      value: data?.impressions || 0,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Widget Açılma',
      value: data?.opens || 0,
      icon: MousePointer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Oyun Oynanma',
      value: data?.game_plays || 0,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Kazanılan Kupon',
      value: data?.conversions || 0,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Helper to process and aggregate platform names
  const processPlatformStats = (stats: { name: string; value: number }[] | undefined) => {
    if (!stats) return [];

    const agg: Record<string, number> = {};

    stats.forEach(item => {
      let name = item.name.toLowerCase();
      let displayName = 'Diğer';

      if (name.includes('mac') || name.includes('iphone') || name.includes('ipad') || name.includes('ipod')) {
        displayName = 'Apple';
      } else if (name.includes('win')) {
        displayName = 'Windows';
      } else if (name.includes('android')) {
        displayName = 'Android';
      } else if (name.includes('linux')) {
        displayName = 'Linux';
      }

      agg[displayName] = (agg[displayName] || 0) + item.value;
    });

    return Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const platformData = processPlatformStats(data?.platform_stats);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-500">Widget performansınızı takip edin</p>
        </div>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 3 Ay</option>
        </select>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {dateRange === '7d' ? 'Son 7 Gün' : dateRange === '30d' ? 'Son 30 Gün' : 'Son 3 Ay'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Impressions vs Opens */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
             <Activity className="w-5 h-5 text-blue-600" />
             Etkileşim Trendi
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="impressions" name="Görüntülenme" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="opens" name="Açılma" stroke="#9333ea" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversions Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" />
            Kupon Kazanımları
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="conversions" name="Kupon Kazanan" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Secondary Charts: Platform & Language */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Cihaz Dağılımı</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
               {platformData && platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {platformData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               ) : (
                   <p className="text-gray-400">Veri bulunamadı</p>
               )}
            </div>
             {/* Legend */}
             <div className="flex flex-wrap gap-2 justify-center mt-4">
                 {platformData?.map((entry, index) => (
                     <div key={index} className="flex items-center text-xs text-gray-600">
                         <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                         {entry.name} ({entry.value})
                     </div>
                 ))}
             </div>
          </div>

          {/* Language Stats */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-cyan-600" />
                <h3 className="text-lg font-semibold text-gray-900">Dil Dağılımı</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
               {data?.language_stats && data.language_stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.language_stats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#82ca9d"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.language_stats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               ) : (
                   <p className="text-gray-400">Veri bulunamadı</p>
               )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
                 {data?.language_stats?.map((entry, index) => (
                     <div key={index} className="flex items-center text-xs text-gray-600">
                         <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}></div>
                         {entry.name} ({entry.value})
                     </div>
                 ))}
             </div>
          </div>
       </div>

       {/* Tertiary Charts: Coupons & Games */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coupon Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
                <Ticket className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-semibold text-gray-900">Kupon Performansı</h3>
            </div>
            <div className="h-64">
               {data?.coupon_stats && data.coupon_stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data.coupon_stats} margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={12} />
                      <YAxis type="category" dataKey="name" width={100} fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="value" name="Kazanılma" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
               ) : (
                   <div className="h-full flex items-center justify-center">
                     <p className="text-gray-400">Veri bulunamadı</p>
                   </div>
               )}
            </div>
          </div>

          {/* Game Popularity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-2 mb-6">
                <Gamepad2 className="w-5 h-5 text-violet-600" />
                <h3 className="text-lg font-semibold text-gray-900">Oyun Popülerliği</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
               {data?.game_stats && data.game_stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.game_stats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8b5cf6"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.game_stats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               ) : (
                   <p className="text-gray-400">Veri bulunamadı</p>
               )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
                 {data?.game_stats?.map((entry, index) => (
                     <div key={index} className="flex items-center text-xs text-gray-600">
                         <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                         {entry.name} ({entry.value})
                     </div>
                 ))}
             </div>
          </div>
       </div>

       {/* Funnel Chart */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dönüşüm Hunisi</h3>
          </div>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart 
                  layout="vertical" 
                  data={[
                    { name: 'Görüntülenme', value: data?.impressions || 0, fill: '#3b82f6' },
                    { name: 'Oyun Oynama', value: data?.game_plays || 0, fill: '#8b5cf6' },
                    { name: 'Kupon Kazanma', value: data?.conversions || 0, fill: '#10b981' },
                    { name: 'Sepete Ekleme', value: data?.cart_visits || 0, fill: '#f59e0b' },
                    { name: 'Ödeme Başlatma', value: data?.checkout_visits || 0, fill: '#ef4444' },
                    { name: 'Sipariş Tamamlama', value: data?.purchases || 0, fill: '#059669' }
                  ]} 
                  margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
               >
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                 <XAxis type="number" fontSize={12} />
                 <YAxis type="category" dataKey="name" width={120} fontSize={12} />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="value" name="Adet" radius={[0, 4, 4, 0]}>
                    {
                      [
                        { name: 'Görüntülenme', value: data?.impressions || 0, fill: '#3b82f6' },
                        { name: 'Oyun Oynama', value: data?.game_plays || 0, fill: '#8b5cf6' },
                        { name: 'Kupon Kazanma', value: data?.conversions || 0, fill: '#10b981' },
                        { name: 'Sepete Ekleme', value: data?.cart_visits || 0, fill: '#f59e0b' },
                        { name: 'Ödeme Başlatma', value: data?.checkout_visits || 0, fill: '#ef4444' },
                        { name: 'Sipariş Tamamlama', value: data?.purchases || 0, fill: '#059669' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
       </div>

    </div>
  );
}
