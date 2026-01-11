import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Save, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cooldownMinutes, setCooldownMinutes] = useState<number>(1440) // Default 24 hours
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('widget_config')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      if (data?.widget_config) {
        // @ts-ignore - JSON type handling
        setCooldownMinutes(data.widget_config.cooldown_minutes || 1440)
        // @ts-ignore
        setTimeLimitEnabled(data.widget_config.time_limit_enabled || false)
        // @ts-ignore
        setTimeLimitMinutes(data.widget_config.time_limit_minutes || 15)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      setMessage(null)

      const config = {
        cooldown_minutes: cooldownMinutes,
        time_limit_enabled: timeLimitEnabled,
        time_limit_minutes: timeLimitMinutes
      }

      const { error } = await supabase
        .from('profiles')
        .update({ widget_config: config })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi.' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="mt-2 text-gray-600">
          Widget davranışlarını ve genel tercihlerinizi buradan yapılandırabilirsiniz.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Section: Visitor Cooldown */}
          <div>
             <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                Tekil Kullanıcı Gösterim Sıklığı
             </h3>
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                   <AlertCircle className="h-5 w-5 text-blue-700 mr-3 mt-0.5" />
                   <p className="text-sm text-blue-800">
                      Bu ayar, bir ziyaretçinin oyunu oynadıktan veya widget'ı kapattıktan sonra tekrar ne zaman göreceğini belirler. 
                      Bu süre boyunca aynı ziyaretçi widget'ı göremez.
                   </p>
                </div>
             </div>

             <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                   Tekrar Gösterim Süresi (Dakika)
                </label>
                <div className="flex items-center space-x-4">
                   <input
                      type="number"
                      min="1"
                      value={cooldownMinutes}
                      onChange={(e) => setCooldownMinutes(parseInt(e.target.value) || 0)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                   />
                   <span className="text-gray-500 text-sm whitespace-nowrap">
                      {cooldownMinutes >= 60 
                        ? `≈ ${(cooldownMinutes / 60).toFixed(1)} saat` 
                        : `${cooldownMinutes} dakika`}
                   </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                   Örnek: 1440 dakika = 24 saat.
                </p>
             </div>
          </div>
          
          {/* Section: Widget Time Limit */}
          <div className="pt-6 border-t border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                Ziyaret Süresi Limiti
             </h3>
             <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex">
                   <AlertCircle className="h-5 w-5 text-purple-700 mr-3 mt-0.5" />
                   <p className="text-sm text-purple-800">
                      Bu özellik açıldığında, ziyaretçi siteye girdiği andan itibaren belirlenen süre boyunca widget'ı görebilir ve oyunu oynayabilir.
                      Süre dolduğunda oyun oynanamaz hale gelir.
                   </p>
                </div>
             </div>

             <div className="flex items-start space-x-3 mb-4">
               <div className="flex items-center h-5">
                 <input
                   id="timeLimitEnabled"
                   name="timeLimitEnabled"
                   type="checkbox"
                   checked={timeLimitEnabled}
                   onChange={(e) => setTimeLimitEnabled(e.target.checked)}
                   className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                 />
               </div>
               <div className="ml-3 text-sm">
                 <label htmlFor="timeLimitEnabled" className="font-medium text-gray-700">Süre Sınırını Aktif Et</label>
                 <p className="text-gray-500">Ziyaretçiler için geri sayım başlatır.</p>
               </div>
             </div>

             {timeLimitEnabled && (
                <div className="max-w-md animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Süre Limiti (Dakika)
                    </label>
                    <div className="flex items-center space-x-4">
                       <input
                          type="number"
                          min="1"
                          value={timeLimitMinutes}
                          onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 0)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                       />
                       <span className="text-gray-500 text-sm whitespace-nowrap">
                          dakika
                       </span>
                    </div>
                </div>
             )}
          </div>

          <div className="pt-6 border-t border-gray-200">
             <button
               onClick={handleSave}
               disabled={saving}
               className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
             >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Ayarları Kaydet
                  </>
                )}
             </button>

             {message && (
                <div className={`mt-4 p-4 rounded-md flex items-center ${
                   message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                   {message.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                   {message.text}
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  )
}
