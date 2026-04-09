import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts'
import { logoutAdmin } from '../../store/adminSlice.js'
import { places as seedPlaces } from '../core/places/placesData.js'
import { seedPros } from '../core/professionals/prosData.js'
import { seedServices } from '../core/services/servicesData.js'
import { supabase } from '../../lib/supabaseClient.js'
import logoIcon from '../../assets/servora-logo-icon.png'

export default function AdminOverview() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const admin = useSelector((state) => state.admin.adminData)

  const [realStats, setRealStats] = useState({ pros: 0, services: 0, places: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRealData = async () => {
      if (!supabase) return
      try {
        const [
          { count: proCount },
          { count: svcCount },
          { count: plcCount }
        ] = await Promise.all([
          supabase.from('sv_professional_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('sv_services').select('*', { count: 'exact', head: true }),
          supabase.from('sv_places').select('*', { count: 'exact', head: true })
        ])

        setRealStats({
          pros: proCount || 0,
          services: svcCount || 0,
          places: plcCount || 0
        })
      } catch (err) {
        console.error("Citadel Data Sync Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchRealData()
  }, [])

  const stats = useMemo(() => ({
    seeded: [
      { name: 'Professionals', value: seedPros.length, color: '#3fbf5a' },
      { name: 'Places', value: seedPlaces.length, color: '#00d2ff' },
      { name: 'Services', value: seedServices.length, color: '#f8f9fa' }
    ],
    real: [
      { name: 'Professionals', value: realStats.pros, color: '#3fbf5a' },
      { name: 'Places', value: realStats.places, color: '#00d2ff' },
      { name: 'Services', value: realStats.services, color: '#f8f9fa' }
    ]
  }), [realStats])

  const chartData = useMemo(() => [
    { name: 'Professionals', seeded: seedPros.length, live: realStats.pros },
    { name: 'Places', seeded: seedPlaces.length, live: realStats.places },
    { name: 'Services', seeded: seedServices.length, live: realStats.services }
  ], [realStats])

  const handleLogout = () => {
    dispatch(logoutAdmin())
    navigate('/admin/login')
  }

  return (
    <div className="sv-admin-dashboard min-vh-100 pb-5" style={{ background: '#0b1510', color: '#fff' }}>
      {/* Sidebar / Header */}
      <nav className="border-bottom border-emerald-10 p-4 bg-black-20 sticky-top shadow-lg" style={{ backdropFilter: 'blur(16px)', zIndex: 1020 }}>
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <img src={logoIcon} width="36" height="36" alt="Servora" />
            <div>
              <h5 className="mb-0 fw-bold text-white">Admin Command Center</h5>
              <p className="extra-small mb-0 text-emerald-light fw-mono">{admin?.email} | AUTHORIZED ACCESS</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-danger px-4 rounded-3 fw-bold btn-sm">
            Terminate Session
          </button>
        </div>
      </nav>

      <main className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="row g-4 mb-5"
        >
          <div className="col-12 col-md-4">
            <div className="sv-card p-4 h-100 border-emerald-30 position-relative overflow-hidden">
              <div className="position-absolute top-0 end-0 p-3 opacity-10">
                <i className="bi bi-people-fill display-1"></i>
              </div>
              <div className="text-muted-light small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Professionals</div>
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="display-4 fw-bold text-emerald mb-0">{seedPros.length + realStats.pros}</h1>
                <span className="text-muted-light fw-bold small">Total Assets</span>
              </div>
              <div className="mt-3 extra-small d-flex gap-3">
                <div className="text-muted-light"><span className="text-white fw-bold">{seedPros.length}</span> Seeded</div>
                <div className="text-emerald fw-bold"><span>{realStats.pros}</span> Live Growth</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="sv-card p-4 h-100 border-white-05 position-relative overflow-hidden">
              <div className="position-absolute top-0 end-0 p-3 opacity-10">
                <i className="bi bi-geo-alt-fill display-1"></i>
              </div>
              <div className="text-muted-light small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Mapped Places</div>
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="display-4 fw-bold mb-0" style={{ color: '#00d2ff' }}>{seedPlaces.length + realStats.places}</h1>
                <span className="text-muted-light fw-bold small">Total Mapped</span>
              </div>
              <div className="mt-3 extra-small d-flex gap-3">
                <div className="text-muted-light"><span className="text-white fw-bold">{seedPlaces.length}</span> Seeded</div>
                <div className="text-info fw-bold"><span>{realStats.places}</span> Live Map</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="sv-card p-4 h-100 border-white-05 position-relative overflow-hidden">
              <div className="position-absolute top-0 end-0 p-3 opacity-10">
                <i className="bi bi-grid-fill display-1"></i>
              </div>
              <div className="text-muted-light small fw-bold text-uppercase mb-2" style={{ letterSpacing: '1px' }}>Services</div>
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="display-4 fw-bold mb-0 text-white">{seedServices.length + realStats.services}</h1>
                <span className="text-muted-light fw-bold small">Marketplace</span>
              </div>
              <div className="mt-3 extra-small d-flex gap-3">
                <div className="text-muted-light"><span className="text-white fw-bold">{seedServices.length}</span> Seeded</div>
                <div className="text-white fw-bold"><span>{realStats.services}</span> Inbound</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row g-4 mb-5">
          <div className="col-12 col-lg-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="sv-card p-4 h-100"
            >
              <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                <span className="p-2 bg-emerald-10 rounded-2 text-emerald"><i className="bi bi-bar-chart-fill"></i></span>
                Marketplace Composition
              </h5>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1a2a22', border: '2px solid rgba(63, 191, 90, 0.4)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="seeded" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} name="Industrial Seed" />
                    <Bar dataKey="live" fill="#3fbf5a" radius={[4, 4, 0, 0]} name="Organic Growth" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
          <div className="col-12 col-lg-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="sv-card p-4 h-100"
            >
              <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                <span className="p-2 bg-emerald-10 rounded-2 text-emerald"><i className="bi bi-pie-chart-fill"></i></span>
                Metric Density
              </h5>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[...stats.seeded, ...stats.real]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[...stats.seeded, ...stats.real].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={index > 2 ? 1 : 0.3} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1a2a22', border: '2px solid rgba(63, 191, 90, 0.4)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 extra-small text-muted-light">
                <div className="d-flex justify-content-between mb-2">
                  <span>Live Professionals:</span>
                  <span className="text-emerald fw-bold">{realStats.pros}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Live Places:</span>
                  <span className="text-info fw-bold">{realStats.places}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="sv-card p-5 text-center bg-emerald-05 border-emerald-20 shadow-lg"
        >
          <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
            <span className="sv-refresh-pill animate-pulse"></span>
            <h3 className="fw-bold mb-0 text-white">Citadel Status: Synchronized</h3>
          </div>
          <p className="text-muted-light mx-auto mb-0 fw-medium" style={{ maxWidth: '600px', lineHeight: '1.6' }}>
            The Servora Administrative Citadel is currently monitoring the **Industrial Pulse** of the marketplace.
            All graphic layers are actively synchronized with the organic user growth in your high-fidelity database.
          </p>
        </motion.div>
      </main>

      <style>{`
        .bg-black-20 { background: rgba(0,0,0,0.2); }
        .bg-emerald-05 { background: rgba(63, 191, 90, 0.05); }
        .bg-emerald-10 { background: rgba(63, 191, 90, 0.1); }
        .border-emerald-10 { border-color: rgba(63, 191, 90, 0.1) !important; }
        .border-emerald-20 { border-color: rgba(63, 191, 90, 0.2) !important; }
        .border-emerald-30 { border-color: rgba(63, 191, 90, 0.3) !important; }
        .text-emerald { color: #3fbf5a !important; }
        .text-emerald-light { color: #5ef37e !important; }
        .text-muted-light { color: #a0aec0 !important; }
        .extra-small { font-size: 0.75rem; }
        .fw-mono { font-family: 'JetBrains Mono', monospace; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
