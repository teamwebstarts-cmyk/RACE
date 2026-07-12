import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { TextField } from '../../components/ui/TextField';

export function SelectLocationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('Patia, Bhubaneswar');

  return (
    <PageShell narrow>
      <ScreenHeader title="Select location" />
      <TextField
        label="Search area"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search locality"
      />
      <div className="list">
        {['Patia Square', 'Infocity', 'Saheed Nagar', 'Chandrasekharpur'].map((place) => (
          <button
            key={place}
            type="button"
            className="list-row"
            onClick={() => setQuery(`${place}, Bhubaneswar`)}
          >
            <div className="meta">
              <strong>{place}</strong>
              <span>Bhubaneswar, Odisha</span>
            </div>
          </button>
        ))}
      </div>
      <div className="form-actions">
        <Button block onClick={() => navigate('/app/home')}>
          Use “{query}”
        </Button>
      </div>
    </PageShell>
  );
}
