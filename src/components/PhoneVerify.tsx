import { useEffect, useRef, useState } from 'react';
import { formatPhone, isValidPhone, verify } from '../lib/auth';
import { PATHS } from '../lib/router';

/**
 * SMS doğrulama adımı.
 *
 * Puan vermeden önce bir kez istenir. Numara yalnızca maskelenmiş biçimde
 * saklanır, hiçbir ekranda tam hâliyle gösterilmez.
 */
export default function PhoneVerify({
  onDone,
  onSkip,
}: {
  onDone: () => void;
  /** Prototipte doğrulama akışı durdurmuyor; canlıda bu seçenek kalkacak. */
  onSkip?: () => void;
}) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (left <= 0) return;
    const t = window.setInterval(() => setLeft((v) => v - 1), 1000);
    return () => window.clearInterval(t);
  }, [left]);

  const send = () => {
    if (!isValidPhone(phone)) {
      setError('Geçerli bir cep telefonu numarası girin (5xx ile başlar).');
      return;
    }
    setError(null);
    setStep('code');
    setLeft(90);
  };

  const check = () => {
    if (code.replace(/\D/g, '').length !== 6) {
      setError('Doğrulama kodu 6 hanelidir.');
      return;
    }
    setError(null);
    verify(phone);
    onDone();
  };

  return (
    <div className="rounded-2xl border border-line bg-bg p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
            <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
            <path d="M10.5 18.5h3" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="display-sm text-[16px] text-ink">Puan vermek için telefonunuzu doğrulayın</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
            Sahte ve toplu puanlamayı engellemenin en pratik yolu bu. Bir numara
            bir hesaptır ve bir okula yalnızca bir kez puan verebilir.
          </p>
        </div>
      </div>

      {step === 'phone' ? (
        <div className="mt-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">Cep telefonu</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="0 5xx xxx xx xx"
              className="field plate"
            />
          </label>

          {error && (
            <p role="alert" className="mt-2.5 text-[13px] text-danger">
              {error}
            </p>
          )}

          <button type="button" onClick={send} className="btn btn-primary mt-3.5 w-full">
            Doğrulama kodu gönder
          </button>

          <p className="mt-3 text-[12px] leading-relaxed text-muted-2">
            Numaranız yalnızca doğrulama için kullanılır, hiçbir ekranda tam
            hâliyle gösterilmez ve pazarlama amacıyla kullanılmaz.{' '}
            <a href={PATHS.kvkk} className="underline underline-offset-2 hover:text-ink">
              Aydınlatma metni
            </a>
          </p>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="mt-3 w-full text-[12.5px] text-muted-2 underline underline-offset-2 hover:text-ink"
            >
              Doğrulamadan devam et (yalnızca prototipte)
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">
              {phone} numarasına gönderilen 6 haneli kod
            </span>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="field plate text-center text-[20px] tracking-[0.4em]"
            />
          </label>

          {error && (
            <p role="alert" className="mt-2.5 text-[13px] text-danger">
              {error}
            </p>
          )}

          <button type="button" onClick={check} className="btn btn-primary mt-3.5 w-full">
            Doğrula ve devam et
          </button>

          <div className="mt-3 flex items-center justify-between gap-3 text-[12.5px]">
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError(null);
              }}
              className="text-muted underline underline-offset-2 hover:text-ink"
            >
              Numarayı değiştir
            </button>
            <span className="text-muted-2 tnum">
              {left > 0 ? `Yeniden gönder (${left} sn)` : 'Kodu yeniden gönder'}
            </span>
          </div>

          <p className="mt-3 rounded-lg border border-amber/30 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-700">
            Prototip: SMS sağlayıcısı henüz bağlanmadı, gerçek mesaj gitmiyor.
            6 haneli herhangi bir sayı kabul edilir.
          </p>
        </div>
      )}
    </div>
  );
}
