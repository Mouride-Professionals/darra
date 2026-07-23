import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { daaraApi, quartierApi } from '../api';
import { useAuth } from '../context/AuthContext';

// ─── STYLES ───────────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById('dr-css')) return;
  const s = document.createElement('style');
  s.id = 'dr-css';
  s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
.dr{font-family:'Tajawal',system-ui,sans-serif;}
.dr *{box-sizing:border-box;}
.dr button,.dr input,.dr select{font-family:inherit;}

/* ── Tabs ── */
.tab-btn{padding:10px 20px;border:none;background:transparent;font-size:14px;font-weight:500;
  color:#6B8070;cursor:pointer;border-bottom:2.5px solid transparent;transition:all .18s;}
.tab-btn.on{color:#0C3B2E;border-bottom-color:#C5A028;font-weight:700;}
.tab-btn:hover:not(.on){color:#0C3B2E;}

/* ── Cards ── */
.dc{background:#fff;border-radius:10px;padding:14px;border:1px solid #d9ead6ff;
  transition:box-shadow .18s,transform .18s;position:relative;overflow:hidden;}
.dc::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--qc,#0C3B2E);}
.dc:hover{box-shadow:0 4px 18px rgba(12,59,46,.12);transform:translateY(-2px);}
.edit-ic{position:absolute;top:9px;right:9px;width:26px;height:26px;border-radius:50%;
  border:1.5px solid #EAE4D6;background:#fff;display:flex;align-items:center;justify-content:center;
  font-size:12px;transition:all .15s;opacity:0;cursor:pointer;}
.dc:hover .edit-ic{opacity:1;}
.edit-ic:hover{background:#0C3B2E;color:#fff;border-color:#0C3B2E;}

/* ── Chips ── */
.q-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;
  font-size:12px;font-weight:600;border:1.5px solid transparent;cursor:pointer;transition:all .15s;white-space:nowrap;}
.q-chip:hover{transform:translateY(-1px);}

/* ── Inputs ── */
.inp{width:100%;padding:10px 14px;border:1.5px solid #DDD5C0;border-radius:8px;
  font-family:inherit;font-size:14px;background:#fff;color:#1A2B22;outline:none;transition:border .15s;}
.inp:focus{border-color:#0C3B2E;box-shadow:0 0 0 3px rgba(12,59,46,.07);}
.inp.err{border-color:#E53935;}
.si{position:relative;} /* search wrapper */
.si .icon{position:absolute;top:50%;transform:translateY(-50%);color:#B0B8B2;font-size:15px;pointer-events:none;}

/* ── Form fields ── */
.fi{display:flex;flex-direction:column;gap:5px;margin-bottom:14px;}
.fi label{font-size:12px;font-weight:700;color:#4A5568;}
.fi .emsg{font-size:11px;color:#E53935;margin-top:1px;}

/* ── Modal ── */
.mo{position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:9999;
  display:flex;align-items:center;justify-content:center;padding:16px;animation:mfo .15s ease;}
.mb{background:#fff;border-radius:14px;width:100%;max-width:480px;
  box-shadow:0 24px 64px rgba(0,0,0,.22);overflow:hidden;animation:msu .2s ease;}
.mh{background:linear-gradient(135deg,#0C3B2E 0%,#174D3B 100%);
  padding:16px 20px;display:flex;align-items:center;justify-content:space-between;}
.mc{padding:20px;max-height:78vh;overflow-y:auto;}
@keyframes mfo{from{opacity:0}to{opacity:1}}
@keyframes msu{from{transform:translateY(14px);opacity:0}to{transform:none;opacity:1}}

/* ── Buttons ── */
.bp{padding:10px 20px;background:#0C3B2E;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s;}
.bp:hover{background:#174D3B;}
.bs{padding:10px 20px;background:#F0EDE5;color:#4A5568;border:1.5px solid #DDD5C0;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;}
.bs:hover{background:#E5E0D8;}
.bg{padding:10px 20px;background:#C5A028;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;}
.bg:hover{background:#A88620;}
.bd{padding:10px 20px;background:#FFF0F0;color:#C62828;border:1.5px solid #FFCDD2;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;}

/* ── Counter ── */
.cb{width:40px;height:40px;border-radius:8px;border:1.5px solid #DDD5C0;background:#F9F6EE;
  font-size:16px;font-weight:700;cursor:pointer;transition:all .15s;}
.cb:hover{background:#0C3B2E;color:#fff;border-color:#0C3B2E;}
.cb.lg{width:48px;height:48px;}

/* ── Toast ── */
.toast-wrap{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;
  display:flex;flex-direction:column;gap:8px;align-items:center;}
.toast{background:#1A2B22;color:#fff;padding:11px 22px;border-radius:10px;font-size:14px;
  box-shadow:0 4px 20px rgba(0,0,0,.25);white-space:nowrap;
  animation:tin .25s ease,tout .3s ease 2.7s forwards;}
.toast.warn{background:#7B3F00;}
.toast.err{background:#B71C1C;}
@keyframes tin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes tout{to{opacity:0;transform:translateY(6px)}}

/* ── Map overlay ── */
.map-ov{position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:1000;
  background:rgba(255,255,255,.97);border:1.5px solid #DDD5C0;border-radius:10px;
  padding:12px 14px;width:340px;max-width:90vw;box-shadow:0 4px 20px rgba(0,0,0,.15);}

/* ── Stat pills ── */
.sp{display:flex;flex-direction:column;align-items:center;padding:9px 16px;
  background:#F0F7F4;border:1px solid #DDE7E0;border-radius:10px;min-width:76px;}

/* ── Section watermark ── */
.swm{position:absolute;right:-6px;top:-6px;font-size:52px;font-weight:800;
  color:var(--qc);opacity:.05;pointer-events:none;line-height:1;overflow:hidden;
  direction:rtl;white-space:nowrap;max-width:80%;}

/* ── Gender bar ── */
.gbar{display:flex;height:4px;border-radius:4px;overflow:hidden;margin-top:6px;}

@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.fad{animation:fi .22s ease both;}

/* ── User menu ── */
.user-menu{position:relative;}
.user-dd{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border:1.5px solid #EAE4D6;
  border-radius:10px;min-width:200px;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:200;
  overflow:hidden;animation:msu .15s ease;}
.user-dd-item{padding:11px 16px;font-size:13px;cursor:pointer;transition:background .12s;
  display:flex;align-items:center;gap:8px;color:#1A2B22;}
.user-dd-item:hover{background:#F0F7F4;}
.user-dd-item.danger{color:#C62828;}
.user-dd-item.danger:hover{background:#FFF0F0;}
.role-badge{padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;}
  `;
  document.head.appendChild(s);
};

// ─── I18N ─────────────────────────────────────────────────────────────────────
const TR = {
  fr: {
    title:'Daara de Touba', subtitle:'Répertoire des Daara',
    tabs:{ liste:'☰ Liste', carte:'🗺 Carte' },
    stats:{ daara:'Daara', garcons:'Garçons', filles:'Filles', quartiers:'Quartiers' },
    search:'Nom, téléphone ou quartier…', mapSearch:'Nom ou téléphone…',
    all:'Tous', clearFilters:'Effacer', addDaara:'+ Daara', addQuartier:'+ Quartier',
    eleves:'élèves', garcons:'Garçons', filles:'Filles', total:'Total',
    noResults:'Aucun résultat', noResultsSub:'Aucun daara ne correspond',
    addDaaraTitle:'Nouveau Daara', editDaaraTitle:'Modifier le Daara',
    addQuartierTitle:'Nouveau Quartier',
    fProp:'Responsable', fQuartier:'Quartier', fTel:'Téléphone',
    fGarcons:'Garçons', fFilles:'Filles',
    fNomAr:'Nom arabe', fNomFr:'Nom français',
    fColor:'Couleur', fLat:'Latitude', fLng:'Longitude',
    save:'Enregistrer', cancel:'Annuler', delete:'Supprimer',
    confirmDel:'Confirmer ?', required:'Champ requis',
    adjustTitle:'Ajuster les effectifs',
    logout:'Se déconnecter', myAccount:'Mon compte', role:'Rôle',
    selectQ:'— Choisir un quartier —',
    mapModePoints:'Points individuels', mapModeConc:'Concentration',
    toastAdded:' Daara ajouté', toastUpdated:' Daara modifié',
    toastDeleted:'🗑 Daara supprimé', toastQAdded:' Quartier créé',
    loading:'Chargement…', daara:'daara', in:'dans', actif:'Actif', inactif:'Inactif',
  },
  ar: {
    title:'دارات طوبى', subtitle:'سجل الدارات',
    tabs:{ liste:'☰ القائمة', carte:'🗺 الخريطة' },
    stats:{ daara:'دارة', garcons:'أولاد', filles:'بنات', quartiers:'حي' },
    search:'الاسم أو الهاتف أو الحي…', mapSearch:'الاسم أو الهاتف…',
    all:'الكل', clearFilters:'مسح', addDaara:'+ دارة', addQuartier:'+ حي',
    eleves:'تلميذ', garcons:'أولاد', filles:'بنات', total:'المجموع',
    noResults:'لا توجد نتائج', noResultsSub:'لا تتوافق أي دارة مع بحثك',
    addDaaraTitle:'دارة جديدة', editDaaraTitle:'تعديل الدارة',
    addQuartierTitle:'حي جديد',
    fProp:'المسؤول', fQuartier:'الحي', fTel:'الهاتف',
    fGarcons:'أولاد', fFilles:'بنات',
    fNomAr:'الاسم بالعربية', fNomFr:'الاسم بالفرنسية',
    fColor:'اللون', fLat:'خط العرض', fLng:'خط الطول',
    save:'حفظ', cancel:'إلغاء', delete:'حذف',
    confirmDel:'تأكيد الحذف؟', required:'حقل مطلوب',
    adjustTitle:'تعديل الأعداد',
    logout:'تسجيل الخروج', myAccount:'حسابي', role:'الدور',
    selectQ:'— اختر الحي —',
    mapModePoints:'نقاط فردية', mapModeConc:'التركيز',
    toastAdded:' تمت الإضافة', toastUpdated:' تم التعديل',
    toastDeleted:'🗑 تم الحذف', toastQAdded:' تم إنشاء الحي',
    loading:'جارٍ التحميل…', daara:'دارة', in:'في', actif:'نشط', inactif:'غير نشط',
  },
};

const ROLE_LABELS = { SUPER_ADMIN:'Super Admin', ADMIN:'Admin', LECTEUR:'Lecteur' };
const ROLE_COLORS = { SUPER_ADMIN:'#C5A028', ADMIN:'#0C3B2E', LECTEUR:'#6B8070' };

// ─── UTILS ────────────────────────────────────────────────────────────────────
const djitter = (id) => {
  const h1 = ((id * 2654435761) >>> 0) / 0xFFFFFFFF;
  const h2 = ((id * 13 * 2654435761) >>> 0) / 0xFFFFFFFF;
  return { dlat: (h1 - 0.5) * 0.004, dlng: (h2 - 0.5) * 0.004 };
};

// ─── MODAL SHELL ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb" style={{ maxWidth }}>
        <div className="mh">
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 20, cursor: 'pointer', width: 30, height: 30, borderRadius: '50%' }}>✕</button>
        </div>
        <div className="mc">{children}</div>
      </div>
    </div>
  );
}

function FF({ label, error, children }) {
  return (
    <div className="fi">
      <label>{label}</label>
      {children}
      {error && <span className="emsg">{error}</span>}
    </div>
  );
}

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────
function ToastStack({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || ''}`}>{t.message}</div>
      ))}
    </div>
  );
}

// ─── ADD/EDIT DAARA MODAL ─────────────────────────────────────────────────────
function DaaraModal({ open, onClose, onSave, onDelete, daara, quartiers, lang }) {
  const t  = TR[lang];
  const isEdit = !!daara;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const emptyForm = { proprietaire: '', quartierId: '', tel: '', garcons: 0, filles: 0, statut: 'ACTIF' };
  const [form, setForm] = useState(emptyForm);
  const [errs, setErrs] = useState({});
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    if (!open) { setForm(emptyForm); setErrs({}); setConfirmDel(false); return; }
    if (daara) {
      setForm({
        proprietaire: daara.proprietaire || '',
        quartierId: daara.quartier?._id || daara.quartierId || '',
        tel: daara.tel || '',
        garcons: daara.garcons ?? 0,
        filles: daara.filles ?? 0,
        statut: daara.statut || 'ACTIF',
      });
    }
  }, [open, daara]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: null })); };
  const adj = (key, delta) => set(key, Math.max(0, (form[key] || 0) + delta));
  const total = (form.garcons || 0) + (form.filles || 0);

  const validate = () => {
    const e = {};
    if (!form.proprietaire.trim()) e.proprietaire = t.required;
    if (!form.quartierId)          e.quartierId   = t.required;
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    onSave({ ...form, quartier: form.quartierId, garcons: +form.garcons, filles: +form.filles });
  };

  const q = quartiers.find(q => q._id === form.quartierId || q.id === form.quartierId);
  const qColor = q?.color || '#0C3B2E';

  return (
    <Modal open={open} onClose={onClose}
      title={`${isEdit ? '✏️' : '🕌'} ${isEdit ? t.editDaaraTitle : t.addDaaraTitle}`}>
      <div dir={dir}>
        {/* Quartier badge (edit only) */}
        {isEdit && q && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{
              background: `${qColor}18`, color: qColor,
              border: `1.5px solid ${qColor}44`, borderRadius: 20,
              padding: '4px 14px', fontSize: 13, fontWeight: 700,
            }}>
              📍 {lang === 'ar' ? q.nomAr : q.nomFr}
            </span>
          </div>
        )}

        {/* ── Effectifs counter (prominent) ── */}
        <div style={{
          background: '#F0F7F4', border: `1.5px solid ${qColor}33`,
          borderRadius: 12, padding: 16, marginBottom: 18,
        }}>
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 14 }}>
            {t.adjustTitle}
          </div>

          {/* Garçons row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1565C0', minWidth: 60 }}>👦 {t.garcons}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="cb" onClick={() => adj('garcons', -10)}>-10</button>
              <button className="cb" onClick={() => adj('garcons', -1)}>-</button>
              <input type="text" inputMode="numeric" dir="ltr"
                value={form.garcons}
                onChange={e => set('garcons', Math.max(0, parseInt(e.target.value.replace(/\D/g,''))||0))}
                style={{ width: 64, padding: '6px', border: '1.5px solid #DDD5C0', borderRadius: 6, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#1565C0' }} />
              <button className="cb" onClick={() => adj('garcons', 1)}>+</button>
              <button className="cb" onClick={() => adj('garcons', 10)}>+10</button>
            </div>
          </div>

          {/* Filles row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#880E4F', minWidth: 60 }}>👧 {t.filles}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="cb" onClick={() => adj('filles', -10)}>-10</button>
              <button className="cb" onClick={() => adj('filles', -1)}>-</button>
              <input type="text" inputMode="numeric" dir="ltr"
                value={form.filles}
                onChange={e => set('filles', Math.max(0, parseInt(e.target.value.replace(/\D/g,''))||0))}
                style={{ width: 64, padding: '6px', border: '1.5px solid #DDD5C0', borderRadius: 6, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#880E4F' }} />
              <button className="cb" onClick={() => adj('filles', 1)}>+</button>
              <button className="cb" onClick={() => adj('filles', 10)}>+10</button>
            </div>
          </div>

          {/* Total + gender bar */}
          <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: '#6B8070' }}>{t.total} </span>
            <span style={{ fontSize: 24, fontWeight: 800, color: qColor }}>{total}</span>
            {total > 0 && (
              <div className="gbar" style={{ marginTop: 8 }}>
                <div style={{ width: `${((form.garcons||0)/total*100).toFixed(1)}%`, background: '#1565C0' }} />
                <div style={{ flex: 1, background: '#880E4F' }} />
              </div>
            )}
            {total > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#6B8070' }}>
                <span>👦 {total > 0 ? Math.round(form.garcons/total*100) : 0}%</span>
                <span>👧 {total > 0 ? Math.round(form.filles/total*100) : 0}%</span>
              </div>
            )}
          </div>
        </div>

        <FF label={t.fProp} error={errs.proprietaire}>
          <input className={`inp ${errs.proprietaire ? 'err' : ''}`} value={form.proprietaire}
            onChange={e => set('proprietaire', e.target.value)} dir="rtl" />
        </FF>

        <FF label={t.fQuartier} error={errs.quartierId}>
          <select className={`inp ${errs.quartierId ? 'err' : ''}`} value={form.quartierId}
            onChange={e => set('quartierId', e.target.value)} dir="rtl">
            <option value="">{t.selectQ}</option>
            {quartiers.map(q => (
              <option key={q._id || q.id} value={q._id || q.id}>
                {lang === 'ar' ? q.nomAr : q.nomFr} — {lang === 'ar' ? q.nomFr : q.nomAr}
              </option>
            ))}
          </select>
        </FF>

        <FF label={t.fTel}>
          <input className="inp" value={form.tel} onChange={e => set('tel', e.target.value)}
            type="tel" dir="ltr" placeholder="7X XXX XX XX" />
        </FF>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 8 }}>
          {isEdit && !confirmDel && (
            <button className="bd" onClick={() => setConfirmDel(true)}>{t.delete}</button>
          )}
          {isEdit && confirmDel && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#C62828', fontWeight: 600 }}>{t.confirmDel}</span>
              <button className="bd" onClick={() => onDelete(daara._id || daara.id)}>✓</button>
              <button className="bs" onClick={() => setConfirmDel(false)}>✕</button>
            </div>
          )}
          {!isEdit && <span />}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="bs" onClick={onClose}>{t.cancel}</button>
            <button className="bg" onClick={handleSave}>💾 {t.save}</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── ADD QUARTIER MODAL ───────────────────────────────────────────────────────
function AddQuartierModal({ open, onClose, onSave, lang }) {
  const t = TR[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const empty = { nomAr: '', nomFr: '', color: '#0C3B2E', lat: '14.865', lng: '-15.885' };
  const [form, setForm] = useState(empty);
  const [errs, setErrs] = useState({});

  useEffect(() => { if (!open) { setForm(empty); setErrs({}); } }, [open]);

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: null })); };

  const handleSave = () => {
    const e = {};
    if (!form.nomAr.trim()) e.nomAr = t.required;
    if (!form.nomFr.trim()) e.nomFr = t.required;
    if (!form.lat || isNaN(+form.lat)) e.lat = t.required;
    if (!form.lng || isNaN(+form.lng)) e.lng = t.required;
    if (Object.keys(e).length) { setErrs(e); return; }
    onSave({ ...form, lat: +form.lat, lng: +form.lng });
  };

  return (
    <Modal open={open} onClose={onClose} title={`🏘 ${t.addQuartierTitle}`} maxWidth={420}>
      <div dir={dir}>
        <FF label={t.fNomAr} error={errs.nomAr}>
          <input className={`inp ${errs.nomAr ? 'err' : ''}`} value={form.nomAr}
            onChange={e => set('nomAr', e.target.value)} dir="rtl" placeholder="مثال: حي الجديد" />
        </FF>
        <FF label={t.fNomFr} error={errs.nomFr}>
          <input className={`inp ${errs.nomFr ? 'err' : ''}`} value={form.nomFr}
            onChange={e => set('nomFr', e.target.value)} placeholder="Ex: Quartier Nord" />
        </FF>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <FF label={t.fColor}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="color" value={form.color}
                onChange={e => set('color', e.target.value)}
                style={{ width: 40, height: 36, border: '1.5px solid #DDD5C0', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
              <input className="inp" value={form.color}
                onChange={e => set('color', e.target.value)} dir="ltr"
                style={{ fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </FF>
          <FF label={t.fLat} error={errs.lat}>
            <input className={`inp ${errs.lat ? 'err' : ''}`} value={form.lat}
              onChange={e => set('lat', e.target.value)} type="text" dir="ltr" />
          </FF>
          <FF label={t.fLng} error={errs.lng}>
            <input className={`inp ${errs.lng ? 'err' : ''}`} value={form.lng}
              onChange={e => set('lng', e.target.value)} type="text" dir="ltr" />
          </FF>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button className="bs" onClick={onClose}>{t.cancel}</button>
          <button className="bp" onClick={handleSave}>{t.save}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── DAARA CARD ───────────────────────────────────────────────────────────────
function DaaraCard({ d, onEdit, lang, canWrite }) {
  const t   = TR[lang];
  const q   = d.quartier || {};
  const qc  = q.color || '#0C3B2E';
  const tot = (d.garcons || 0) + (d.filles || 0);
  const qName = lang === 'ar' ? q.nomAr : q.nomFr;

  return (
    <div className="dc fad" style={{ '--qc': qc }}>
      {canWrite && (
        <button className="edit-ic" onClick={() => onEdit(d)} title={t.editDaaraTitle}>✏️</button>
      )}
      <div style={{ direction: 'rtl', paddingRight: canWrite ? 28 : 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2B22', marginBottom: 1 }}>{d.proprietaire}</div>
        <div style={{ fontSize: 11, color: '#6B8070' }}>
          {qName && `${qName} · `}#{d._id?.slice(-4) || d.id}
        </div>
      </div>

      {/* Gender breakdown */}
      {(d.garcons > 0 || d.filles > 0) && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: '#1565C0', fontWeight: 600 }}>👦 {d.garcons}</span>
            <span style={{ color: '#1A2B22', fontWeight: 800, fontSize: 16 }}>{tot}</span>
            <span style={{ color: '#880E4F', fontWeight: 600 }}>{d.filles} 👧</span>
          </div>
          {tot > 0 && (
            <div className="gbar" style={{ marginTop: 4 }}>
              <div style={{ width: `${((d.garcons||0)/tot*100).toFixed(1)}%`, background: '#1565C0' }} />
              <div style={{ flex: 1, background: '#880E4F' }} />
            </div>
          )}
        </div>
      )}

      {d.tel && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F0EDE5' }}>
          <a href={`tel:+221${d.tel}`}
            style={{ color: '#0C3B2E', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            📞 {d.tel}
          </a>
        </div>
      )}
    </div>
  );
}

// ─── QUARTIER SECTION ─────────────────────────────────────────────────────────
function QuartierSection({ q, items, onEdit, lang, canWrite }) {
  const t = TR[lang];
  const qc = q.color || '#0C3B2E';
  const totalG = items.reduce((s, d) => s + (d.garcons || 0), 0);
  const totalF = items.reduce((s, d) => s + (d.filles  || 0), 0);
  const tot    = totalG + totalF;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
        padding: '10px 16px',
        background: `linear-gradient(90deg,${qc}14 0%,transparent 100%)`,
        borderRadius: 8, borderLeft: `4px solid ${qc}`,
      }}>
        <div className="swm" style={{ '--qc': qc }}>{lang === 'ar' ? q.nomAr : q.nomFr}</div>
        <div style={{ flex: 1, direction: 'rtl' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: qc }}>
            {lang === 'ar' ? q.nomAr : q.nomFr}
          </div>
          <div style={{ fontSize: 11, color: '#6B8070', marginTop: 1, direction: 'ltr' }}>
            {lang === 'ar' ? q.nomFr : q.nomAr} · {items.length} {t.daara}
            {tot > 0 && ` · 👦${totalG} 👧${totalF} = ${tot}`}
          </div>
        </div>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: qc, flexShrink: 0 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 10 }}>
        {items.map(d => (
          <DaaraCard key={d._id || d.id} d={d} onEdit={onEdit} lang={lang} canWrite={canWrite} />
        ))}
      </div>
    </div>
  );
}

// ─── USER MENU ────────────────────────────────────────────────────────────────
function UserMenu({ lang }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const t = TR[lang];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div className="user-menu" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F0F7F4', border: '1px solid #DDE7E0',
          borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#0C3B2E',
        }}>
        <span style={{ fontSize: 20 }}>👤</span>
        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left', lineHeight: 1.2 }}>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{user.nom}</div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>{ROLE_LABELS[user.role]}</div>
        </div>
        <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="user-dd" style={{ [lang === 'ar' ? 'left' : 'right']: 0, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #EAE4D6', background: '#F9F6EE' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{user.nom}</div>
            <div style={{ fontSize: 11, color: '#6B8070' }}>{user.email}</div>
            <span className="role-badge" style={{ background: `${ROLE_COLORS[user.role]}18`, color: ROLE_COLORS[user.role], display: 'inline-block', marginTop: 4 }}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <button className="user-dd-item danger" onClick={() => { setOpen(false); logout(); }}>
            🚪 {t.logout}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DaaraListPage({ lang: propLang = 'fr', onLangChange }) {
  const { canWrite, canManageQuartiers } = useAuth();
  const [lang, setLang]       = useState(propLang);
  const [activeTab, setActiveTab] = useState('liste');
  const [quartiers, setQuartiers] = useState([]);
  const [daara, setDaara]     = useState([]);
  const [stats, setStats]     = useState({ totalDaara: 0, totalGarcons: 0, totalFilles: 0, totalEleves: 0 });
  const [listSearch, setListSearch] = useState('');
  const [mapSearch, setMapSearch]   = useState('');
  const [selectedQ, setSelectedQ]   = useState('');
  const [mapMode, setMapMode]   = useState('concentration'); // 'concentration' | 'daara'
  const [showAdd, setShowAdd]   = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toasts, setToasts]     = useState([]);
  const [leafletOk, setLeafletOk] = useState(false);
  const [loading, setLoading]   = useState(true);

  const t = TR[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const concLayersRef  = useRef([]);

  /* ── Init styles ── */
  useEffect(() => { injectStyles(); }, []);

  /* ── Fetch ALL daara across pages (handles any dataset size) ── */
  const fetchAllDaara = async () => {
    const PAGE_SIZE = 100;
    let page = 1;
    let totalPages = 1; 
    let all  = [];

    while (page <= totalPages) {
      const res = await daaraApi.getAll({ page, limit: PAGE_SIZE });
      /* Backend spreads result: { status, data:[...], total, page, totalPages } */
      const items = Array.isArray(res?.data) ? res.data : [];

      all = [...all, ...items];
      totalPages = res?.totalPages ?? 1;
      if (page >= totalPages) break;
      page += 1;
    }
    return all;
  };

  /* ── Fetch data from API ── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [qRes, allDaara, sRes] = await Promise.all([
          quartierApi.getAll(),
          fetchAllDaara(),
          daaraApi.getStats(),
        ]);

        setQuartiers(qRes?.data?.quartiers ?? []);
        setDaara(allDaara);
        setStats(sRes?.data?.stats ?? { totalDaara: 0, totalGarcons: 0, totalFilles: 0, totalEleves: 0 });
      } catch (err) {
        toast(`⚠ ${err.message}`, 'err');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── Toast helper ── */
  const toast = useCallback((message, type = '') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 3200);
  }, []);

  /* ── Language ── */
  const handleLang = (l) => { setLang(l); onLangChange?.(l); };

  /* ── Leaflet load ── */
  useEffect(() => {
    if (window.L) { setLeafletOk(true); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    sc.onload = () => setLeafletOk(true);
    document.body.appendChild(sc);
  }, []);

  /* ── Init map ── */
  useEffect(() => {
    if (!leafletOk || !mapRef.current || mapInstance.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([14.865, -15.885], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);
    mapInstance.current = map;
  }, [leafletOk]);

  /* ── Render map layers ── */
  const renderMap = useCallback(() => {
    const map = mapInstance.current;
    if (!map || !window.L) return;
    const L = window.L;

    /* Clear previous layers */
    [...markersRef.current, ...concLayersRef.current].forEach(l => l.remove());
    markersRef.current = []; concLayersRef.current = [];

    const sq = mapSearch.trim();
    const filtered = sq
      ? daara.filter(d => d.proprietaire?.includes(sq) || d.tel?.includes(sq))
      : daara;

    if (mapMode === 'concentration') {
      /* One circle per quartier sized by count */
      const countByQ = {};
      filtered.forEach(d => {
        const qId = d.quartier?._id || d.quartier;
        countByQ[qId] = (countByQ[qId] || 0) + 1;
      });
      const maxCount = Math.max(...Object.values(countByQ), 1);

      quartiers.forEach(q => {
        const qId  = q._id || q.id;
        const count = countByQ[qId] || 0;
        if (!count) return;
        const radius = 80 + (count / maxCount) * 350;
        const circle = L.circle([q.lat, q.lng], {
          radius, color: q.color, fillColor: q.color,
          fillOpacity: 0.18, weight: 2, opacity: 0.5,
        }).addTo(map);

        const qDaara = filtered.filter(d => (d.quartier?._id || d.quartier) === qId);
        const totG = qDaara.reduce((s, d) => s + (d.garcons || 0), 0);
        const totF = qDaara.reduce((s, d) => s + (d.filles  || 0), 0);

        const labelIcon = L.divIcon({
          className: '',
          html: `<div style="
            background:${q.color};color:#fff;border-radius:50%;
            width:36px;height:36px;display:flex;align-items:center;justify-content:center;
            font-weight:800;font-size:13px;border:2.5px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer;">
            ${count}</div>`,
          iconSize: [36, 36], iconAnchor: [18, 18],
        });
        const marker = L.marker([q.lat, q.lng], { icon: labelIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:Tajawal,sans-serif;direction:rtl;min-width:180px">
            <div style="font-weight:800;font-size:15px;color:#1A2B22;margin-bottom:2px">${q.nomAr}</div>
            <div style="color:#6B8070;font-size:12px;margin-bottom:8px">${q.nomFr}</div>
            <div style="display:flex;justify-content:space-between;font-size:13px">
              <span>🕌 <b>${count}</b> داراس</span>
              <span>👦 <b style="color:#1565C0">${totG}</b> · 👧 <b style="color:#880E4F">${totF}</b></span>
            </div>
          </div>`, { maxWidth: 240 });

        concLayersRef.current.push(circle, marker);
      });

    } else {
      /* Individual markers */
      filtered.forEach(d => {
        const q = quartiers.find(x => x._id === (d.quartier?._id || d.quartier));
        if (!q) return;
        const j = djitter(d._id?.charCodeAt(0) || d.id || 0);
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;background:${q.color};border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6],
        });
        const tot = (d.garcons || 0) + (d.filles || 0);
        const marker = L.marker([q.lat + j.dlat, q.lng + j.dlng], { icon }).addTo(mapInstance.current);
        marker.bindPopup(`
          <div style="font-family:Tajawal,sans-serif;direction:rtl;min-width:170px">
            <div style="font-weight:800;font-size:14px;margin-bottom:4px">${d.proprietaire}</div>
            <span style="background:${q.color}22;color:${q.color};border-radius:12px;padding:2px 8px;font-size:11px;font-weight:600">${q.nomFr}</span>
            ${d.tel ? `<div style="font-size:12px;margin-top:6px">📞 ${d.tel}</div>` : ''}
            ${tot > 0 ? `<div style="margin-top:4px;font-size:12px">👦${d.garcons} + 👧${d.filles} = <b>${tot}</b></div>` : ''}
          </div>`, { maxWidth: 230 });
        markersRef.current.push(marker);
      });
    }
  }, [daara, quartiers, mapSearch, mapMode]);

  useEffect(() => { renderMap(); }, [renderMap]);

  useEffect(() => {
    if (activeTab === 'carte' && mapInstance.current) {
      setTimeout(() => { mapInstance.current.invalidateSize(); renderMap(); }, 80);
    }
  }, [activeTab, renderMap]);

  /* ── CRUD ── */
  const handleSaveDaara = async (formData) => {
    try {
      const isEdit = !!editTarget;
      if (isEdit) {
        const res = await daaraApi.update(editTarget._id, formData);
        setDaara(p => p.map(d => d._id === editTarget._id ? res.data.daara : d));
        toast(t.toastUpdated);
      } else {
        const res = await daaraApi.create(formData);
        setDaara(p => [...p, res.data.daara]);
        setStats(s => ({ ...s,
          totalDaara:   s.totalDaara + 1,
          totalGarcons: s.totalGarcons + (formData.garcons || 0),
          totalFilles:  s.totalFilles  + (formData.filles  || 0),
          totalEleves:  s.totalEleves  + (formData.garcons || 0) + (formData.filles || 0),
        }));
        toast(t.toastAdded);
      }
      setEditTarget(null); setShowAdd(false);
    } catch (err) { toast(err.message, 'err'); }
  };

  const handleDeleteDaara = async (id) => {
    try {
      await daaraApi.remove(id);
      const d = daara.find(x => x._id === id);
      setDaara(p => p.filter(x => x._id !== id));
      if (d) setStats(s => ({ ...s,
        totalDaara:   s.totalDaara - 1,
        totalGarcons: s.totalGarcons - (d.garcons || 0),
        totalFilles:  s.totalFilles  - (d.filles  || 0),
        totalEleves:  s.totalEleves  - (d.garcons || 0) - (d.filles || 0),
      }));
      setEditTarget(null);
      toast(t.toastDeleted, 'warn');
    } catch (err) { toast(err.message, 'err'); }
  };

  const handleSaveQuartier = async (formData) => {
    try {
      const res = await quartierApi.create(formData);
      setQuartiers(p => [...p, res.data.quartier]);
      setShowAddQ(false);
      toast(t.toastQAdded);
    } catch (err) { toast(err.message, 'err'); }
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const q = listSearch.trim();
    return daara.filter(d => {
      const ms = !q || d.proprietaire?.includes(q) || d.tel?.includes(q);
      const mq = !selectedQ || (d.quartier?._id || d.quartier) === selectedQ;
      return ms && mq;
    });
  }, [daara, listSearch, selectedQ]);

  const byQuartier = useMemo(() => {
    const map = {};
    filtered.forEach(d => {
      const qId = d.quartier?._id || d.quartier || 'unknown';
      if (!map[qId]) map[qId] = [];
      map[qId].push(d);
    });
    return map;
  }, [filtered]);

  const quartiersSorted = useMemo(() =>
    [...quartiers].sort((a, b) => {
      const ca = daara.filter(d => (d.quartier?._id || d.quartier) === a._id).length;
      const cb = daara.filter(d => (d.quartier?._id || d.quartier) === b._id).length;
      return cb - ca;
    }), [quartiers, daara]);

  /* ── Render ── */
  return (
    <div className="dr" style={{ background: '#FFFFFF', minHeight: '100vh', direction: dir }}>
      <ToastStack toasts={toasts} />

      {/* ── HEADER ── */}
      <div style={{
        background: '#FFFFFF',
        padding: '14px 18px 0',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid #EAE4D6',
        boxShadow: '0 2px 12px rgba(12,59,46,.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>

          {/* Title */}
          <div style={{ direction: 'rtl' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0C3B2E' }}>🕌 {t.title}</div>
            <div style={{ fontSize: 11, color: '#6B8070', marginTop: 1 }}>{t.subtitle}</div>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Lang */}
            <div style={{ display: 'flex', gap: 3 }}>
              {['fr','ar'].map(l => (
                <button key={l}
                  onClick={() => handleLang(l)}
                  style={{
                    padding: '4px 10px', borderRadius: 16, border: '1.5px solid',
                    borderColor: lang === l ? '#C5A028' : '#DDD5C0',
                    background: lang === l ? '#C5A028' : 'transparent',
                    color: lang === l ? '#fff' : '#6B8070',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  }}>
                  {l === 'fr' ? '🇫🇷 FR' : '🇸🇳 AR'}
                </button>
              ))}
            </div>

            {/* Stats */}
            {[
              [daara.length.toLocaleString(), t.stats.daara],
              [stats.totalGarcons?.toLocaleString() || 0, t.stats.garcons],
              [stats.totalFilles?.toLocaleString()  || 0, t.stats.filles],
              [quartiers.length, t.stats.quartiers],
            ].map(([v, l]) => (
              <div key={l} className="sp">
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0C3B2E', lineHeight: 1.1, letterSpacing: '-.02em' }}>{v}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#4A7A63', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.03em' }}>{l}</span>
              </div>
            ))}

            {/* Action buttons */}
            {canWrite && (
              <button className="bg" onClick={() => setShowAdd(true)} style={{ fontSize: 13, padding: '8px 14px' }}>
                {t.addDaara}
              </button>
            )}
            {canManageQuartiers && (
              <button onClick={() => setShowAddQ(true)} style={{ fontSize: 13, padding: '8px 14px', fontWeight: 700, borderRadius: 8, cursor: 'pointer', background: '#fff', color: '#0C3B2E', border: '1.5px solid #0C3B2E' }}>
                {t.addQuartier}
              </button>
            )}

            {/* User menu */}
            <UserMenu lang={lang} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {Object.entries(t.tabs).map(([id, label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? 'on' : ''}`} onClick={() => setActiveTab(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAP — always in DOM ── */}
      <div style={{ display: activeTab === 'carte' ? 'block' : 'none', position: 'relative', height: 'calc(100vh - 118px)' }}>
        <div className="map-ov">
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <span style={{ position: 'absolute', left: lang === 'ar' ? 'auto' : 12, right: lang === 'ar' ? 12 : 'auto', top: '50%', transform: 'translateY(-50%)', color: '#B0B8B2' }}>🔍</span>
            <input className="inp" value={mapSearch} onChange={e => setMapSearch(e.target.value)}
              placeholder={t.mapSearch} dir="rtl"
              style={{ paddingLeft: lang === 'ar' ? 12 : 38, paddingRight: lang === 'ar' ? 38 : 12 }} />
          </div>
          {/* Map mode toggle */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {[['concentration', t.mapModeConc], ['daara', t.mapModePoints]].map(([m, l]) => (
              <button key={m}
                onClick={() => setMapMode(m)}
                style={{
                  flex: 1, padding: '5px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  border: `1.5px solid ${mapMode === m ? '#0C3B2E' : '#DDD5C0'}`,
                  background: mapMode === m ? '#0C3B2E' : '#F9F6EE',
                  color: mapMode === m ? '#fff' : '#4A5568', cursor: 'pointer',
                }}>
                {l}
              </button>
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', maxHeight: 90, overflowY: 'auto' }}>
            {quartiers.map(q => (
              <div key={q._id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4A5568' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: q.color, display: 'inline-block' }} />
                {lang === 'ar' ? q.nomAr : q.nomFr}
              </div>
            ))}
          </div>
        </div>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* ── LIST ── */}
      {activeTab === 'liste' && (
        <div style={{ padding: '18px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#6B8070', fontSize: 16 }}>
              ⏳ {t.loading}
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#B0B8B2', zIndex: 1 }}>🔍</span>
                <input className="inp" value={listSearch} onChange={e => setListSearch(e.target.value)}
                  placeholder={t.search} dir="rtl" style={{ paddingLeft: 40 }} />
                {listSearch && (
                  <button onClick={() => setListSearch('')}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B8070', fontSize: 16 }}>✕</button>
                )}
              </div>

              {/* Quartier filter chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                <button className="q-chip"
                  onClick={() => setSelectedQ('')}
                  style={{ background: !selectedQ ? '#0C3B2E' : '#fff', color: !selectedQ ? '#fff' : '#4A5568', borderColor: !selectedQ ? '#0C3B2E' : '#DDD5C0' }}>
                  {t.all} · {daara.length}
                </button>
                {quartiersSorted.map(q => {
                  const c = daara.filter(d => (d.quartier?._id || d.quartier) === q._id).length;
                  if (!c) return null;
                  const act = selectedQ === q._id;
                  return (
                    <button key={q._id} className="q-chip"
                      onClick={() => setSelectedQ(act ? '' : q._id)}
                      style={{ background: act ? q.color : '#fff', color: act ? '#fff' : q.color, borderColor: q.color }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: act ? 'rgba(255,255,255,.7)' : q.color, display: 'inline-block' }} />
                      {lang === 'ar' ? q.nomAr : q.nomFr} · {c}
                    </button>
                  );
                })}
              </div>

              {/* Result count */}
              <div style={{ fontSize: 12, color: '#6B8070', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span><b style={{ color: '#0C3B2E' }}>{filtered.length}</b> {t.daara}</span>
                {(listSearch || selectedQ) && (
                  <button onClick={() => { setListSearch(''); setSelectedQ(''); }}
                    style={{ padding: '2px 10px', background: '#FFE9E9', border: '1px solid #FFCDD2', borderRadius: 12, cursor: 'pointer', color: '#C62828', fontSize: 11, fontFamily: 'inherit' }}>
                    {t.clearFilters} ✕
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6B8070' }}>
                  <div style={{ fontSize: 42, marginBottom: 12 }}>🕌</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{t.noResults}</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>{t.noResultsSub}</div>
                </div>
              ) : (
                quartiersSorted
                  .filter(q => byQuartier[q._id]?.length > 0)
                  .map(q => (
                    <QuartierSection key={q._id}
                      q={q} items={byQuartier[q._id]}
                      onEdit={setEditTarget} lang={lang} canWrite={canWrite} />
                  ))
              )}
            </>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      <DaaraModal
        open={showAdd || !!editTarget}
        daara={editTarget}
        quartiers={quartiers}
        onClose={() => { setShowAdd(false); setEditTarget(null); }}
        onSave={handleSaveDaara}
        onDelete={handleDeleteDaara}
        lang={lang}
      />
      <AddQuartierModal
        open={showAddQ}
        onClose={() => setShowAddQ(false)}
        onSave={handleSaveQuartier}
        lang={lang}
      />
    </div>
  );
}