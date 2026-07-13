import { Award, Check, CreditCard, Sparkles, Star, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { getApiErrorMessage } from '../../services/api';
import {
  cancel,
  listMine,
  listPlans,
  subscribe,
  type SubscriptionPlan,
  type UserSubscription,
} from '../../services/subscriptionService';

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

const BENEFIT_ROWS: Array<{
  key: 'reducedCommission' | 'priorityLeads' | 'featuredListing' | 'performanceBadge';
  label: string;
  Icon: typeof Zap;
}> = [
  { key: 'reducedCommission', label: 'Reduced Commission', Icon: Zap },
  { key: 'priorityLeads', label: 'Priority Leads', Icon: Sparkles },
  { key: 'featuredListing', label: 'Featured Listing', Icon: Star },
  { key: 'performanceBadge', label: 'Performance Badge', Icon: Award },
];

export function SubscriptionsPage() {
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
        listPlans('vendor', 'partner'),
        listMine(),
      ]);
      setPlans(planList);
      setSubs(
        mine.filter(
          (s) => s.audience === 'vendor' || s.category === 'partner',
        ),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load partner plans'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = useMemo(
    () => subs.find((s) => s.status === 'active' && s.category === 'partner'),
    [subs],
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

  const onCancel = async () => {
    setBusySlug('cancel-partner');
    setError('');
    setSuccess('');
    try {
      await cancel('partner');
      setSuccess('Partner subscription cancelled.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to cancel'));
    } finally {
      setBusySlug(null);
    }
  };

  return (
    <div className="page-section">
      <ScreenHeader title="Partner plans" />
      <p className="muted" style={{ marginTop: -8, marginBottom: 20 }}>
        Unlock lower commission, priority leads, and featured listing for your fleet.
      </p>

      {error ? <div className="toast-error">{error}</div> : null}
      {success ? <div className="toast-success">{success}</div> : null}

      {loading ? (
        <div className="loading-inline">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {active ? (
            <div className="card sub-active-card" style={{ marginBottom: 24 }}>
              <div className="sub-active-main">
                <CreditCard size={18} color="#F5A800" />
                <div>
                  <strong>{active.planName}</strong>
                  <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                    Active · expires {formatDate(active.expiresAt)}
                  </p>
                </div>
              </div>
              <div className="sub-active-actions">
                <span className="chip">{active.status}</span>
                <Button
                  variant="outline"
                  disabled={busySlug === 'cancel-partner'}
                  onClick={() => void onCancel()}
                >
                  {busySlug === 'cancel-partner' ? 'Cancelling…' : 'Cancel'}
                </Button>
              </div>
            </div>
          ) : null}

          <div className="plan-grid">
            {plans.map((plan) => {
              const isCurrent = active?.planSlug === plan.slug;
              const hasActive = Boolean(active);
              const isContact = plan.actionType === 'contact';
              const busy = busySlug === plan.slug;
              const benefits = plan.benefits;

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

                  {benefits ? (
                    <ul className="plan-benefits">
                      {BENEFIT_ROWS.map(({ key, label, Icon }) => {
                        const on = Boolean(benefits[key]);
                        return (
                          <li key={key} className={on ? '' : 'excluded'}>
                            <Icon size={16} color={on ? '#F5A800' : '#999'} />
                            <span>
                              {label}
                              {key === 'reducedCommission' && benefits.commissionRate != null
                                ? ` (${benefits.commissionRate}%)`
                                : ''}
                            </span>
                            {on ? (
                              <Check size={14} color="#22C55E" />
                            ) : (
                              <X size={14} color="#999" />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
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
                  )}

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
                      disabled={busy || hasActive}
                      onClick={() => void onSubscribe(plan)}
                    >
                      {busy
                        ? 'Subscribing…'
                        : hasActive
                          ? 'Cancel current to switch'
                          : 'Subscribe'}
                    </Button>
                  )}
                </article>
              );
            })}
          </div>

          {plans.length === 0 ? (
            <p className="muted" style={{ marginTop: 16 }}>
              No partner plans available yet.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
