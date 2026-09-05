import { ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { images } from '../../assets';
import { Button } from '../../components/ui/Button';
import {
  SERVICE_CATEGORIES,
  getCategoryHero,
  getCategoryImage,
  getCategoryTheme,
  getServiceIcon,
  type CategoryId,
} from '../../data/catalog';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const name = profile?.fullName || user?.fullName || 'there';

  return (
    <div className="page">
      <div className="content-wrap">
        <div className="home-top">
          <div>
            <p className="muted" style={{ fontSize: 14, fontWeight: 600 }}>
              Welcome back
            </p>
            <h1>{name.split(' ')[0]}</h1>
          </div>
          <button
            type="button"
            className="location-pill"
            onClick={() => navigate('/app/home/location')}
          >
            <MapPin size={16} color="#F5A800" />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ display: 'block', fontSize: 13 }}>Bhubaneswar</strong>
              <span className="muted" style={{ fontSize: 12 }}>
                Serviceable area
              </span>
            </div>
          </button>
        </div>

        <section className="hero-banner">
          <img src={images.homeHero} alt="RACE roadside assistance truck" />
          <div className="hero-banner-copy">
            <h2>All services in one place</h2>
            <p>
              Towing, drivers, roadside help, and upcoming services — pick what you need and get
              moving.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/app/services')}>View all services</Button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/app/call')}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.25)',
                }}
              >
                Emergency SOS
              </button>
            </div>
          </div>
        </section>

        <div className="section-head">
          <div>
            <h2>Available services</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              Browse every category and sub-service on your dashboard
            </p>
          </div>
        </div>

        <div className="category-overview-grid">
          {SERVICE_CATEGORIES.map((category) => {
            const theme = getCategoryTheme(category.id);
            return (
              <button
                key={category.id}
                type="button"
                className="category-overview-card"
                style={{ borderColor: `${theme.accent}33` }}
                onClick={() => navigate(`/app/services/${category.id}`)}
              >
                <img src={getCategoryImage(category.id)} alt="" />
                <div className="category-overview-body">
                  <strong style={{ color: theme.accent }}>{category.title}</strong>
                  <span>{category.services.length} services</span>
                </div>
              </button>
            );
          })}
        </div>

        {SERVICE_CATEGORIES.map((category) => {
          const theme = getCategoryTheme(category.id as CategoryId);
          const comingSoon = category.id === 'future';

          return (
            <section key={category.id} className="service-section" id={`home-${category.id}`}>
              <div className="service-section-head">
                <div className="service-section-copy">
                  <div className="service-section-kicker" style={{ color: theme.accent }}>
                    {comingSoon ? 'Coming soon' : 'Bookable soon'}
                  </div>
                  <h2>{category.title}</h2>
                  <p className="muted">{category.description}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/app/services/${category.id}`)}
                >
                  View category
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="service-section-hero">
                <img src={getCategoryHero(category.id)} alt={category.title} />
              </div>

              <div
                className={`service-cards-grid ${category.services.length > 4 ? 'dense' : ''}`}
              >
                {category.services.map((service) => {
                  const Icon = getServiceIcon(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      className="service-card"
                      onClick={() =>
                        navigate(`/app/services/${category.id}/${service.id}`)
                      }
                    >
                      <div
                        className="service-card-icon"
                        style={{ background: theme.background, color: theme.accent }}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="service-card-body">
                        <strong>{service.label}</strong>
                        <span>{service.description}</span>
                      </div>
                      <ArrowRight size={16} color="#999" />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="sos-panel">
          <div className="sos-panel-copy">
            <h2>Need help right now?</h2>
            <p>
              Use SOS for emergency towing, ambulance coordination, location share, and contact
              alerts.
            </p>
            <Button className="btn-danger" onClick={() => navigate('/app/call')}>
              Open emergency SOS
            </Button>
          </div>
          <div className="sos-panel-visual">
            <img src={images.roadsideHero} alt="Roadside assistance" />
          </div>
        </section>
      </div>
    </div>
  );
}
