import React, { useState } from 'react';
import { Trophy, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Coupon = Database['public']['Tables']['coupons']['Row'];

interface GameWinModalProps {
  score?: number; // Some games might not have score, but keeping it optional
  coupon: Coupon;
  onReset: () => void;
  gameType: string; // 'snake', 'wheel', 'memory'
}

export default function GameWinModal({ score, coupon, onReset, gameType }: GameWinModalProps) {
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Geçerli bir email adresi giriniz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Call Secure RPC to Claim Coupon (Decrement Stock + Log)
      const { data: claimData, error: claimError } = await supabase.rpc('claim_coupon', {
        p_coupon_id: coupon.id,
        p_email: email,
        p_game_type: gameType
      });

      if (claimError) throw claimError;
      
      // claimData is typed as any/jsonb by default, cast it if needed
      const result = claimData as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Kupon alınamadı (Stok bitmiş olabilir)');
      }

      // 2. Call Edge Function to send email via Resend
      const { error: emailError } = await supabase.functions.invoke('send-coupon-email', {
        body: {
          email: email,
          couponCode: coupon.code,
          discountValue: coupon.discount_value,
          discountType: coupon.discount_type,
          gameType: gameType
        }
      });


      if (emailError) throw emailError;

      // 3. Update status to SENT
      // We need the ID of the inserted log to update it, but insert() above didn't return it because of RLS restrictions on select maybe?
      // Actually, we can assume it worked if no error. Ideally we would update the row, but for anonymous users UPDATE might be blocked by RLS.
      // Since we just inserted it, the backend/edge function could have handled the Insert + Send logic atomically.
      // But for now, we leave it as 'pending' in DB if we can't update, or 'sent' if we optimistically set it.
      
      // Since we set status: 'sent' optimistically in the previous step (which was actually 'pending' but I changed it to 'sent' to show in dashboard),
      // we are good for the dashboard.
      // In a production app, the Edge Function should potentially do the DB logging or update.
      
      setTimeout(() => {
        setStep('success');
        setLoading(false);
      }, 500);

    } catch (err: any) {
      console.error('Email collection error:', err);
      // Even if DB fails (e.g. RLS), we might want to show the code to not frustrate the user?
      // But let's show error for now.
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Tebrikler! Kazandınız 🎉
            </h3>
            <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-center font-medium mb-6 inline-block w-full">
               {coupon.discount_type === 'percentage' ? '%' : '₺'}{coupon.discount_value} İndirim
            </div>

            <p className="text-gray-600 mb-6 text-center text-sm">
              Kupon kodunuzu almak ve kaybetmemek için email adresinizi giriniz. Kod emailinize gönderilecektir.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Kuponu Gönder & Gör'
                )}
              </button>
            </form>
            
            <button 
                onClick={onReset}
                className="w-full mt-4 text-gray-400 text-sm hover:text-gray-600"
            >
                Vazgeç / Kapat
            </button>
        </div>
      </div>
    );
  }

  // Success Step
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        
        <div className="mb-6 flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Kupon Gönderildi!
        </h3>
        <p className="text-gray-500 mb-6 text-sm">
          Kupon kodu <strong>{email}</strong> adresine gönderildi. Ayrıca aşağıdan da kopyalayabilirsiniz.
        </p>
        
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 rounded-lg mb-6 relative group cursor-pointer hover:bg-gray-50 transition-colors"
             onClick={() => {
                navigator.clipboard.writeText(coupon.code)
             }}
        >
          <p className="text-xs text-gray-500 mb-1">KUPON KODUNUZ</p>
          <code className="text-2xl font-black text-indigo-600 tracking-wider">
            {coupon.code}
          </code>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
             <span className="text-xs font-bold text-gray-600">Tıkla Kopyala</span>
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Yeni Oyun Oyna
        </button>
      </div>
    </div>
  );
}
