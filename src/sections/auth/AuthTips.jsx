import { useEffect, useMemo, useState } from 'react'
import { useLottie } from 'lottie-react'
import chatAnimation from '../../assets/lottie/chat.json'
import gpsAnimation from '../../assets/lottie/gps.json'
import locationAnimation from '../../assets/lottie/location.json'
import portfolioAnimation from '../../assets/lottie/portfolio.json'

const ROTATE_MS = 5200

export default function AuthTips() {
  const tips = useMemo(
    () => [
      {
        title: 'Build trust with a real portfolio',
        text: 'Show your work, highlight your services, and help people choose confidently.',
        subText: 'Build a profile that helps clients choose confidently.',
        animationData: portfolioAnimation,
      },
      {
        title: 'Find skilled professionals fast',
        text: 'Search services, compare profiles, and connect with the right pro.',
        subText: 'Discover services around you with location-aware search.',
        animationData: locationAnimation,
      },
      {
        title: 'Chat in-app, keep everything in one place',
        text: 'Ask questions, share details, and agree on what you need—without leaving Servora.',
        subText: 'Send messages, share details, and keep it organized.',
        animationData: chatAnimation,
      },
      {
        title: 'Location-aware discovery (coming soon)',
        text: 'See nearby services and explore options around you with maps integration.',
        subText: 'Map + GPS features to help you find what’s nearby.',
        animationData: gpsAnimation,
      },
    ],
    [],
  )

  const [index, setIndex] = useState(0)

  // Rotate tips
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((v) => (v + 1) % tips.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [tips.length])

  const tip = tips[index]

  // Hook-based Lottie setup
  const options = {
    animationData: tip.animationData,
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet',
    },
    style: {
      width: '100%',
      height: '100%',
    },
  }
  const { View: LottieView } = useLottie(options)

  return (
    <div className="sv-auth-tips">
      <div className="sv-auth-tips__inner">
        <div key={index} className="sv-auth-tips__card">
          <div className="sv-auth-tips__media">
            <div className="sv-auth-tips__lottie">{LottieView}</div>
          </div>

          <div className="sv-auth-tips__content">
            <div className="sv-auth-tips__title">{tip.title}</div>
            <div className="sv-auth-tips__text">{tip.text}</div>
            <div className="sv-auth-tips__subtext">{tip.subText}</div>
          </div>
        </div>

        <div className="sv-auth-tips__dots" aria-hidden="true">
          {tips.map((_, i) => (
            <div
              key={i}
              className={`sv-auth-tips__dot${
                i === index ? ' sv-auth-tips__dot--active' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
