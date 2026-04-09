import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { MdSearch, MdClose, MdLayers, MdPerson, MdPlace } from 'react-icons/md'

export default function QuickDiscoveryWidget() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Auto-open on landing page load
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleDiscovery = (tab) => {
    navigate(`/core?tab=${tab}`)
  }

  return (
    <div className="sv-quick-discovery position-fixed bottom-0 start-0 m-4 z-index-100" style={{ zIndex: 1050 }}>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="sv-card backdrop-blur shadow-lg border border-white-10 p-0 overflow-hidden mb-3"
            style={{ 
              width: '320px', 
              background: 'rgba(11, 21, 16, 0.92)',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-white-05">
              <div className="d-flex align-items-center gap-2">
                <div className="p-2 rounded-circle bg-primary-gradient shadow-sm">
                  <MdSearch className="text-white" size={18} />
                </div>
                <span className="fw-bold text-white small" style={{ letterSpacing: '0.5px' }}>Quick Discovery</span>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className="btn btn-sm p-1 text-white-50 hover-white transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h5 className="text-white fw-bold mb-3" style={{ fontSize: '1.1rem' }}>
                What are you looking for today?
              </h5>
              
              <div className="d-flex flex-column gap-2">
                <button 
                  onClick={() => handleDiscovery('services')}
                  className="sv-discovery-option"
                >
                  <MdLayers className="icon" />
                  <span>Explore Services</span>
                </button>

                <button 
                  onClick={() => handleDiscovery('professionals')}
                  className="sv-discovery-option"
                >
                  <MdPerson className="icon" />
                  <span>Find Professionals</span>
                </button>

                <button 
                  onClick={() => handleDiscovery('places')}
                  className="sv-discovery-option"
                >
                  <MdPlace className="icon" />
                  <span>Discover Venues</span>
                </button>
              </div>
            </div>

            <div className="p-2 bg-white-05 text-center">
              <span className="text-white-30" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Servora Industrial Engine
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={`btn sv-quick-discovery__trigger border-0 p-0 shadow-lg ${isMinimized ? 'sv-pulse' : ''}`}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #3fbf5a 0%, #00d2ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 32px rgba(63, 191, 90, 0.4)'
        }}
      >
        <MdSearch size={28} />
      </motion.button>

      <style>{`
        .sv-discovery-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
        }

        .sv-discovery-option:hover {
          background: rgba(63, 191, 90, 0.1);
          border-color: rgba(63, 191, 90, 0.3);
          color: #3fbf5a;
          transform: translateX(4px);
        }

        .sv-discovery-option .icon {
          font-size: 20px;
          opacity: 0.7;
        }

        .sv-discovery-option:hover .icon {
          opacity: 1;
        }

        .sv-pulse {
          animation: svKiloPulse 2s infinite;
        }

        @keyframes svKiloPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(63, 191, 90, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(63, 191, 90, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(63, 191, 90, 0); }
        }

        .bg-primary-gradient {
          background: linear-gradient(135deg, #3fbf5a 0%, #00d2ff 100%);
        }

        .text-white-05 { color: rgba(255, 255, 255, 0.05); }
        .text-white-10 { color: rgba(255, 255, 255, 0.1); }
        .text-white-30 { color: rgba(255, 255, 255, 0.3); }
        .text-white-50 { color: rgba(255, 255, 255, 0.5); }
        .bg-white-05 { background: rgba(255, 255, 255, 0.05); }
        .border-white-05 { border-color: rgba(255, 255, 255, 0.05) !important; }
        .border-white-10 { border-color: rgba(255, 255, 255, 0.1) !important; }

        .hover-white:hover { color: white !important; }
        .transition { transition: all 0.2s; }
      `}</style>
    </div>
  )
}
