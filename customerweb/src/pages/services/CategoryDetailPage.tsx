import { ArrowRight } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import {
  getCategoryById,
  getCategoryHero,
  getCategoryTheme,
  getServiceIcon,
  isFutureCategory,
  type CategoryId,
} from '../../data/catalog';

export function CategoryDetailPage() {
  const { categoryId = '' } = useParams();
  const navigate = useNavigate();
  const category = getCategoryById(categoryId);

  if (!category) {
    return <Navigate to="/app/services" replace />;
  }

  const theme = getCategoryTheme(category.id as CategoryId);
  const future = isFutureCategory(category.id);

  return (
    <div className="page">
      <div className="content-wrap">
        <ScreenHeader title={category.title} />

        <div className="category-detail-hero">
          <img src={getCategoryHero(category.id)} alt={category.title} />
          <div className="category-detail-copy">
            <span className="chip" style={{ background: theme.background, color: theme.accent }}>
              {future ? 'Coming soon' : 'Available'}
            </span>
            <h1>{category.title}</h1>
            <p>{category.description}</p>
          </div>
        </div>

        <div className="section-head" style={{ marginTop: 28 }}>
          <div>
            <h2>Choose a service</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              {category.services.length} options in this category
            </p>
          </div>
        </div>

        <div className="service-cards-grid dense">
          {category.services.map((service) => {
            const Icon = getServiceIcon(service.id);
            return (
              <button
                key={service.id}
                type="button"
                className="service-card"
                onClick={() => navigate(`/app/services/${category.id}/${service.id}`)}
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

        <div style={{ marginTop: 24 }}>
          <Button variant="outline" onClick={() => navigate('/app/home')}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}
