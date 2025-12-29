import React, { useState, useEffect } from 'react'

/**
 * Dynamic Background Component
 * Shows rotating background images with smooth transitions
 * Uses Unsplash API for high-quality volunteer/community photos
 */
const DynamicBackground = ({ category = 'volunteer', overlay = 0.7, children }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Curated Unsplash photo collections for different page types
  const imageCollections = {
    volunteer: [
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80',
      'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80',
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&q=80',
      'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=1920&q=80',
    ],
    community: [
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1920&q=80',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&q=80',
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1920&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80',
    ],
    education: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80',
    ],
    environment: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80',
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=1920&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1920&q=80',
      'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1920&q=80',
    ],
    healthcare: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1920&q=80',
      'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1920&q=80',
    ],
    organization: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
    ],
    success: [
      'https://images.unsplash.com/photo-1513351732705-4f1e6c114bc9?w=1920&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80',
      'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=1920&q=80',
    ],
    minimal: [
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
      'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80',
      'https://images.unsplash.com/photo-1557682268-e3955ed5d83f?w=1920&q=80',
    ]
  }

  const images = imageCollections[category] || imageCollections.volunteer

  // Change image every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [images.length])

  // Preload next image
  useEffect(() => {
    const nextIndex = (currentImageIndex + 1) % images.length
    const img = new Image()
    img.src = images[nextIndex]
  }, [currentImageIndex, images])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Images Container */}
      <div className="fixed inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={image}
            className="absolute inset-0 transition-opacity duration-2000 ease-in-out"
            style={{
              opacity: index === currentImageIndex ? 1 : 0,
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Gradient Overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/50"
              style={{ opacity: overlay }}
            />
          </div>
        ))}

        {/* Animated Particles Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="particles-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 15}s`,
                  animationDuration: `${15 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Ken Burns Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 animate-pulse-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Image Counter/Indicators */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'w-8 bg-white' 
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .transition-opacity {
          transition: opacity 2s ease-in-out;
        }

        .duration-2000 {
          transition-duration: 2000ms;
        }

        .particles-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          animation: float-particle linear infinite;
          opacity: 0.6;
        }

        @keyframes float-particle {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) translateX(100px);
            opacity: 0;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}

export default DynamicBackground
