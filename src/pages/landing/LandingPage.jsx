import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer.jsx'
import LandingNav from '../../components/landing/LandingNav.jsx'
import AudienceSplitSection from '../../components/landing/sections/AudienceSplitSection.jsx'
import FaqSection from '../../components/landing/sections/FaqSection.jsx'
import FinalCtaSection from '../../components/landing/sections/FinalCtaSection.jsx'
import HeroSection from '../../components/landing/sections/HeroSection.jsx'
import HowItWorksSection from '../../components/landing/sections/HowItWorksSection.jsx'
import PlacesSection from '../../components/landing/sections/PlacesSection.jsx'
import './landing.css'

export default function LandingPage() {
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => Boolean(state.auth.user))

  const scrollToSection = (id) => {
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-sv-reveal]'))
    if (nodes.length === 0) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      for (const n of nodes) n.classList.add('sv-reveal--in')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('sv-reveal--in')
          io.unobserve(entry.target)
        }
      },
      { threshold: 0.12 },
    )

    for (const n of nodes) io.observe(n)
    return () => io.disconnect()
  }, [])

  return (
    <div className="sv-landing">
      <LandingNav
        onSection={scrollToSection}
        isLoggedIn={isLoggedIn}
        onPrimaryCta={() => navigate('/core?tab=services')}
        onSecondaryCta={() => navigate('/login')}
      />

      <main>
        <HeroSection
          onPrimaryCta={() => navigate('/core?tab=services')}
          onSecondaryCta={() => navigate('/signup')}
        />
        <HowItWorksSection />
        <AudienceSplitSection
          onClientCta={() => navigate('/core?tab=services')}
          onProCta={() => navigate('/core?tab=professionals')}
        />
        <PlacesSection onCta={() => navigate('/core?tab=places')} />
        <FaqSection />
        <FinalCtaSection
          onPrimaryCta={() => navigate('/core?tab=services')}
          onSecondaryCta={() => navigate('/signup')}
        />
      </main>

      <Footer />
    </div>
  )
}
