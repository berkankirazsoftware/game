import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import Dashboard from './pages/Dashboard'
import CouponsPage from './pages/CouponsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import SnakeGame from './pages/SnakeGame'
import IntegrationPage from './pages/IntegrationPage'
import WidgetPreviewPage from './pages/WidgetPreviewPage'
import MemoryGame from './pages/MemoryGame'
import CreateCampaign from './pages/CreateCampaign'
import MyBoostesPage from './pages/MyBoostesPage'
import PricingPage from './pages/PricingPage'
import WheelGame from './pages/WheelGame'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/game/snake-demo" element={<SnakeGame />} />
          <Route path="/game/wheel-demo" element={<WheelGame />} />
          <Route path="/game/:gameId" element={<SnakeGame />} />
          <Route path="/game-widget" element={<WidgetPreviewPage />} />
          <Route path="/memory/:gameId" element={<MemoryGame />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-boostes"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyBoostesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coupons"
            element={
              <ProtectedRoute>
                <Layout>
                  <CouponsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Layout>
                  <SubscriptionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateCampaign />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/integration"
            element={
              <ProtectedRoute>
                <Layout>
                  <IntegrationPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Ayarlar</h1>
                    <p className="text-gray-600">Bu sayfa henüz geliştirilmekte...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App