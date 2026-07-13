import { Check, CreditCard, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PageShell } from '../../components/layout/PageShell';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { getApiErrorMessage } from '../../services/api';
import {
  cancel,
  listMine,
  listPlans,
  subscribe,
  type SubscriptionCategory,
  type SubscriptionPlan,
  type UserSubscription,
} from '../../services/subscriptionService';

type TabId = 'towing' | 'driver';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'towing', label: 'Towing Plans' },
  { id: 'driver', label: 'Driver Service Plans' },
];

function formatPrice(price: number, currency: string, cycle: string) {
  const symbol = currency === 'INR' || currency === '₹' ? '₹' : `${currency} `;
  const period = cycle === 'yearly' ? 'yr' : 'mo';
  return `${symbol}${price.toLocaleString('en-IN')}/${period}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function SubscriptionsPage() {
  const [tab, setTab] = useState<TabId>('towing');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [planList, mine] = await Promise.all([
        listPlans('customer'),
        listMine(),
      ]);
      setPlans(planList);
      setSubs(mine.filter((s) => s.audience === 'customer' || !s.audience));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load subscriptions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeForCategory = useMemo(() => {
    const map = new Map<string, UserSubscription>();
    for (const sub of subs) {
      if (sub.status === 'active') map.set(sub.category, sub);
    }
    return map;
  }, [subs]);

  const visiblePlans = useMemo(
    () => plans.filter((p) => p.category === tab),
    [plans, tab],
  );

  const onSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.actionType === 'contact') return;
    setBusySlug(plan.slug);
    setError('');
    setSuccess('');
    try {
      await subscribe(plan.slug);
      setSuccess(`${plan.name} is now active.`);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to subscribe'));
    } finally {
      setBusySlug(null);
    }
  };

  const onCancel = async (category: SubscriptionCategory) => {
    setBusySlug(`cancel-${category}`);
    setError('');
    setSuccess('');
    try {
      await cancel(category);
      setSuccess('Subscription cancelled.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to cancel'));
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <PageShell>
      <ScreenHeader title="Subscriptions" />
      <p className="muted" style={{ marginTop: -8, marginBottom: 20 }}>
        Save with monthly towing and driver packages tailored for your trips.
      </p>

      {error ? <div className="toast-error">{error}</div> : null}
      {success ? <div className="toast-success">{success}</div> : null}

      {loading ? (
        <div className="loading-inline">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {subs.length > 0 ? (
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ marginBottom: 12 }}>Active subscriptions</h3>
              <div className="list">
                {subs.map((sub) => (
                  <div key={sub.id} className="card sub-active-card">
                    <div className="sub-active-main">
                      <CreditCard size={18} color="#F5A800" />
                      <div>
                        <strong>{sub.planName}</strong>
                        <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                          {sub.category} · renews / expires {formatDate(sub.expiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="sub-active-actions">
                      <span className="chip">{sub.status}</span>
                      <Button
                        variant="outline"
                        disabled={busySlug === `cancel-${sub.category}`}
                        onClick={() =>
                          void onCancel(sub.category as SubscriptionCategory)
                        }
                      >
                        {busySlug === `cancel-${sub.category}`
                          ? 'Cancelling…'
                          : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="sub-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`sub-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="plan-grid">
            {visiblePlans.map((plan) => {
              const active = activeForCategory.get(plan.category);
              const isCurrent = active?.planSlug === plan.slug;
              const hasActiveCategory = Boolean(active);
              const isContact = plan.actionType === 'contact';
              const busy = busySlug === plan.slug;

              return (
                <article
                  key={plan.id}
                  className={`card plan-card ${plan.isMostPopular ? 'popular' : ''}`}
                >
                  {plan.isMostPopular ? (
                    <span className="plan-badge">Most Popular</span>
                  ) : null}
                  <h3>{plan.name}</h3>
                  <p className="plan-price">
                    {formatPrice(plan.price, plan.currency, plan.billingCycle)}
                  </p>
                  <ul className="plan-features">
                    {plan.features.map((f) => (
                      <li key={f.text} className={f.included ? '' : 'excluded'}>
                        {f.included ? (
                          <Check size={16} color="#22C55E" />
                        ) : (
                          <X size={16} color="#999" />
                        )}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button variant="outline" block disabled>
                      Current plan
                    </Button>
                  ) : isContact ? (
                    <Button variant="outline" block disabled>
                      Contact sales
                    </Button>
                  ) : (
                    <Button
                      block
                      disabled={busy || hasActiveCategory}
                      onClick={() => void onSubscribe(plan)}
                    >
                      {busy
                        ? 'Subscribing…'
                        : hasActiveCategory
                          ? 'Cancel current to switch'
                          : 'Subscribe'}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>

          {visiblePlans.length === 0 ? (
            <p className="muted" style={{ marginTop: 16 }}>
              No plans available in this category yet.
            </p>
          ) : null}
        </>
      )}
    </PageShell>
  );
}
