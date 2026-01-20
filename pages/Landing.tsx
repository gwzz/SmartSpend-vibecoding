import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const LandingPage: React.FC = () => {
  const { t } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-ink pt-safe pb-16">
      {/* Hero */}
      <section className="px-4 md:px-6 pt-8">
        <div className="bg-gradient-to-br from-brand-primary to-brand-accent text-white rounded-2xl shadow-glass overflow-hidden relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.18),_transparent_35%)]" />
          <div className="p-6 md:p-10 relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="space-y-4 md:w-3/5">
              <p className="text-sm uppercase tracking-[0.2em] font-semibold text-white/80">{t('heroTagline')}</p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ fontFamily: 'Poppins, Nunito, system-ui, sans-serif' }}>
                {t('heroTitle')}
              </h1>
              <p className="text-white/85 text-base md:text-lg max-w-2xl">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-pill bg-white text-brand-primary font-semibold shadow-card hover:-translate-y-0.5 hover:shadow-glass transition-all"
                >
                  <UserPlus size={18} />
                  <span className="ml-2">{t('signUp')}</span>
                </button>
                <button
                  onClick={() => navigate('/auth', { state: { mode: 'login' } })}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-pill border border-white/60 text-white font-semibold hover:bg-white/10 transition-all"
                >
                  <LogIn size={18} className="mr-2" />
                  {t('login')}
                </button>
              </div>
            </div>
            <div className="md:w-2/5 bg-white/10 border border-white/15 rounded-xl p-4 shadow-soft">
              <div className="text-sm uppercase text-white/70 font-semibold mb-2">{t('today')}</div>
              <p className="text-white/80 text-sm">{t('heroTodayHelper')}</p>
              <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-4 md:px-6 mt-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted bg-brand-surface rounded-xl px-4 py-3 border border-brand-border">
          <span className="font-semibold text-brand-ink">{t('socialProofTrusted')}</span>
          <span className="inline-flex items-center gap-1 text-amber-500">★★★★★</span>
          <span className="text-brand-muted">{t('socialProofSecure')}</span>
        </div>
      </section>

      {/* Access note */}
      <section className="px-4 md:px-6 mt-4">
        <div className="flex items-center gap-3 text-sm text-brand-muted bg-brand-card border border-brand-border rounded-lg px-4 py-3 shadow-soft flex-wrap">
          <span className="text-brand-primary text-base">🔒</span>
          <span className="flex-1 min-w-[200px]">{t('authRequiredNote')}</span>
          <button
            onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
            className="text-brand-primary font-semibold hover:underline"
          >
            {t('authRequiredCta')}
          </button>
        </div>
      </section>

      {/* Pain points */}
      <section className="px-4 md:px-6 mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-ink">{t('painTitle')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{
            title: t('painGroceriesTitle'),
            body: t('painGroceriesBody'),
            icon: '🧺'
          }, {
            title: t('painVacationTitle'),
            body: t('painVacationBody'),
            icon: '🏖️'
          }, {
            title: t('painRecapTitle'),
            body: t('painRecapBody'),
            icon: '🧘'
          }].map((item, idx) => (
            <div key={idx} className="bg-brand-card rounded-xl p-5 shadow-soft border border-brand-border/70">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-brand-ink mb-2">{item.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature zig-zag */}
      <section className="px-4 md:px-6 mt-10 space-y-10">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-soft">
            <p className="text-sm uppercase tracking-wide text-brand-muted font-semibold">{t('featureOneLabel')}</p>
            <h3 className="text-2xl font-bold text-brand-ink mt-2">{t('featureOneTitle')}</h3>
            <p className="text-brand-muted mt-3">{t('featureOneBody')}</p>
            <ul className="mt-4 space-y-2 text-brand-ink text-sm">
              <li>• {t('featureOneBullet1')}</li>
              <li>• {t('featureOneBullet2')}</li>
              <li>• {t('featureOneBullet3')}</li>
            </ul>
          </div>
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-card">
            <div className="text-sm font-semibold text-brand-primary mb-2">{t('featureSnapshotLabel')}</div>
            <div className="h-48 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-xl flex items-center justify-center text-brand-primary font-semibold">Dashboard preview</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center md:flex-row-reverse">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-card">
            <div className="text-sm font-semibold text-brand-primary mb-2">{t('featureGoalsLabel')}</div>
            <div className="h-48 bg-gradient-to-br from-brand-warm/10 to-brand-accent/10 rounded-xl flex items-center justify-center text-brand-ink font-semibold">Shared goal preview</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-soft">
            <p className="text-sm uppercase tracking-wide text-brand-muted font-semibold">{t('featureTwoLabel')}</p>
            <h3 className="text-2xl font-bold text-brand-ink mt-2">{t('featureTwoTitle')}</h3>
            <p className="text-brand-muted mt-3">{t('featureTwoBody')}</p>
            <ul className="mt-4 space-y-2 text-brand-ink text-sm">
              <li>• {t('featureTwoBullet1')}</li>
              <li>• {t('featureTwoBullet2')}</li>
              <li>• {t('featureTwoBullet3')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-4 md:px-6 mt-12">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 md:p-8 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-card shadow-card border border-brand-border flex items-center justify-center text-2xl">👨‍👩‍👧</div>
            <div className="flex-1">
              <p className="text-lg md:text-xl font-semibold text-brand-ink" style={{ fontFamily: 'Poppins, Nunito, system-ui, sans-serif' }}>
                “{t('testimonialQuote')}”
              </p>
              <p className="text-brand-muted text-sm mt-2">{t('testimonialAttribution')}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500">★★★★★</div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 md:px-6 mt-8">
        <div className="bg-gradient-to-r from-brand-accent to-brand-primary rounded-2xl p-6 md:p-8 text-white shadow-glass flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, Nunito, system-ui, sans-serif' }}>{t('ctaBannerTitle')}</h3>
            <p className="text-white/85 mt-2">{t('ctaBannerSubtitle')}</p>
          </div>
          <button
            onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
            className="inline-flex items-center justify-center px-6 py-3 rounded-pill bg-white text-brand-primary font-semibold shadow-card hover:-translate-y-0.5 hover:shadow-glass transition-all"
          >
            <UserPlus size={18} className="mr-2" />
            {t('signUp')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
