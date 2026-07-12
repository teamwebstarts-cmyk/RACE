import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  SERVICE_CATEGORIES,
  getCategoryHero,
  getCategoryTheme,
  getServiceIcon,
  type CategoryId,
} from '../../data/catalog';

export function ServicesPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="content-wrap">
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 36 }}>All services</h1>
            <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
              Towing, drivers, roadside assistance, and future offerings — everything available on
              RACE.
            </p>
          </div>
        </div>

        <div className="services-catalog">
          {SERVICE_CATEGORIES.map((category) => {
            const theme = getCategoryTheme(category.id as CategoryId);
            return (
              <article key={category.id} className="catalog-category">
                <div className="catalog-category-media">
                  <img src={getCategoryHero(category.id)} alt={category.title} />
                  <div className="catalog-category-overlay">
                    <span className="chip" style={{ background: theme.background, color: theme.accent }}>
                      {category.services.length} services
                    </span>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => navigate(`/app/services/${category.id}`)}
                    >
                      Open category
                    </button>
                  </div>
                </div>

                <div className="service-cards-grid">
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
                          <Icon size={20} />
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
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
