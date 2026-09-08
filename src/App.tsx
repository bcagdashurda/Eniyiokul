import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import SponsorTicker from './components/SponsorTicker';
import Hero from './components/Hero';
import Sponsored from './components/Sponsored';
import SchoolBrowser from './components/SchoolBrowser';
import TrustBand from './components/TrustBand';
import Footer from './components/Footer';
import ReviewDialog from './components/ReviewDialog';
import About from './pages/About';
import ForSchools from './pages/ForSchools';
import Legal from './pages/Legal';
import { useAtlas, useProvinceDetail } from './lib/useData';
import { useReviews } from './lib/reviews';
import { useRoute } from './lib/router';
import { refreshTriggers } from './lib/motion';
import { schoolId, type School } from './lib/types';

export default function App() {
  const route = useRoute();
  const { geo, summary, error, loading } = useAtlas();
  const [slug, setSlug] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [rating, setRating] = useState<{ school: School; province: string } | null>(null);
  const { detail, districts, loading: loadingDetail } = useProvinceDetail(slug);
  const { all: reviews, forSchool } = useReviews();

  /* İl değişince ilçe seçimi sıfırlanır. */
  useEffect(() => setDistrict(null), [slug]);

  /* Veri geldikçe bölüm yükseklikleri değişiyor; kaydırma tetikleyicileri
     eski ölçümlerle çalışmasın diye tazeleniyor. */
  useEffect(() => {
    if (!loading) window.setTimeout(refreshTriggers, 120);
  }, [loading, slug, district, route.name]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /**
   * Aramadan ya da vitrinden bir okulu doğrudan açar: ili seçer, il
   * dosyasını getirir ve okulun profilini gösterir.
   */
  const openSchool = useCallback(async (province: string, ilce: string, ad: string) => {
    if (window.location.hash.startsWith('#/')) window.location.hash = '#/';
    setSlug(province);
    try {
      const r = await fetch(`data/provinces/${province}.json`);
      const f = (await r.json()) as { okullar: School[] };
      const hit = f.okullar.find((s) => s.ad === ad && s.ilce === ilce);
      if (hit) setRating({ school: hit, province });
    } catch {
      /* açılamazsa il görünümünde kalır */
    }
  }, []);

  /** Logo ve "Türkiye" bağlantıları: sayfayı ve harita seçimini sıfırla. */
  const goHome = useCallback(() => {
    setSlug(null);
    setDistrict(null);
    setRating(null);
    if (window.location.hash.startsWith('#/')) window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const selectProvince = useCallback((s: string) => {
    if (window.location.hash.startsWith('#/')) window.location.hash = '#/';
    setSlug(s);
    window.setTimeout(
      () => document.getElementById('harita')?.scrollIntoView({ behavior: 'smooth' }),
      60,
    );
  }, []);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center p-8 text-center">
        <div className="max-w-md">
          <h1 className="display text-[28px] text-ink">Veri yüklenemedi</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{error}</p>
          <p className="mt-4 text-[13.5px] text-muted-2">
            Geliştirme sunucusunu <code className="plate">npm run dev</code> ile
            başlattığınızdan emin olun.
          </p>
        </div>
      </main>
    );
  }

  const onHome = route.name === 'home';

  return (
    <>
      <Navbar
        summary={summary}
        onSelectProvince={selectProvince}
        onOpenSchool={openSchool}
        onGoHome={goHome}
        onHome={onHome}
      />

      {/* Sponsor şeridi yalnızca ana sayfada */}
      {onHome && !loading && <SponsorTicker onOpen={openSchool} />}

      {route.name === 'about' && <About summary={summary} reviewCount={reviews.length} />}
      {route.name === 'schools' && <ForSchools summary={summary} />}
      {route.name === 'legal' && <Legal doc={route.doc} />}

      {onHome && (
        <main id="top">
          {loading || !geo || !summary ? (
            <div className="grid min-h-screen place-items-center" aria-live="polite">
              <div className="text-center">
                <span className="pulse-dot mx-auto block h-2.5 w-2.5 rounded-full bg-brand" />
                <p className="label mt-4 text-muted-2">Atlas yükleniyor</p>
              </div>
            </div>
          ) : (
            <>
              <Hero
                geo={geo}
                summary={summary}
                activeSlug={slug}
                detail={detail}
                districts={districts}
                loadingDetail={loadingDetail}
                activeDistrict={district}
                onSelectProvince={setSlug}
                onSelectDistrict={setDistrict}
                onBrowse={() => scrollTo('okullar')}
              />

              <SchoolBrowser
                slug={slug}
                detail={detail}
                loading={loadingDetail}
                activeDistrict={district}
                reviews={reviews}
                onSelectProvince={(s) => {
                  setSlug(s);
                  scrollTo('okullar');
                }}
                onSelectDistrict={setDistrict}
                onRate={(school) => slug && setRating({ school, province: slug })}
              />

              <Sponsored onOpen={openSchool} />
              <TrustBand />
            </>
          )}
        </main>
      )}

      {summary && <Footer summary={summary} onSelectProvince={selectProvince} />}

      {rating && (
        <ReviewDialog
          school={rating.school}
          provinceSlug={rating.province}
          reviews={forSchool(schoolId(rating.province, rating.school))}
          onClose={() => setRating(null)}
        />
      )}
    </>
  );
}
