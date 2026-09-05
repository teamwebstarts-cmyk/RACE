import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { images } from '../../assets';
import { BrandMark } from '../../components/ui/BrandMark';
import { Button } from '../../components/ui/Button';

const SLIDES = [
  {
    title: 'Towing in minutes',
    body: 'Request verified tow trucks with live tracking and transparent fares.',
    image: images.towingHero,
  },
  {
    title: 'Driver on demand',
    body: 'Hire professional drivers for trips, airport runs, and overnight duty.',
    image: images.driverHero,
  },
  {
    title: 'SOS always ready',
    body: 'One tap emergency help with your vehicle and contact details attached.',
    image: images.roadsideHero,
  },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  return (
    <div className="page auth-page">
      <div className="auth-split">
        <div className="auth-visual">
          <img src={slide.image} alt="" />
          <div className="auth-visual-overlay">
            <BrandMark variant="dark" size="lg" />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 8 }}>
                Step {index + 1} of {SLIDES.length}
              </p>
              <h2 style={{ fontSize: 'clamp(30px, 4vw, 42px)' }}>{slide.title}</h2>
            </div>
          </div>
        </div>
        <div className="auth-panel">
          <div className="auth-panel-inner">
            <h1>{slide.title}</h1>
            <p className="muted" style={{ marginBottom: 28, marginTop: 8 }}>
              {slide.body}
            </p>
            <div className="dots" style={{ justifyContent: 'flex-start', margin: '0 0 28px' }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`dot ${i === index ? 'active' : ''}`}
                  style={{ border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="form-actions" style={{ gap: 12 }}>
              {index < SLIDES.length - 1 ? (
                <Button block onClick={() => setIndex((v) => v + 1)}>
                  Next
                </Button>
              ) : (
                <Button block onClick={() => navigate('/login')}>
                  Continue to login
                </Button>
              )}
              <Button variant="outline" block onClick={() => navigate('/login')}>
                Skip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
