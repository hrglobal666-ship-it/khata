import React, { useState, useEffect, useMemo } from 'react';
import { Menu, X, BookOpen, TrendingUp, Check, ArrowRight, ChevronLeft, User, LogOut, Wallet, Phone } from 'lucide-react';

const COURSES = [
  { id: 'f1', category: 'Finance', title: 'Budgeting That Actually Sticks', desc: 'Build a budget around the 50/30/20 method — and adjust it when real life gets in the way.', price: 39, modules: ['Where your money actually goes', 'The 50/30/20 split', 'Building in room for surprises', 'A habit that survives a bad month'] },
  { id: 'f2', category: 'Finance', title: 'Understanding Your Credit Score', desc: "What moves the number, what doesn't, and how to fix a score that's stuck.", price: 39, modules: ['How the score is calculated', 'Common myths, cleared up', 'Fixing errors on your report', 'Building credit from zero'] },
  { id: 'f3', category: 'Finance', title: 'Building Your Emergency Fund', desc: 'How much is enough, where to park it, and how to build it without feeling the pinch.', price: 49, modules: ['How many months you actually need', 'Liquid fund vs savings account', 'Automating the habit', "When it's okay to dip in"] },
  { id: 'f4', category: 'Finance', title: 'Tax-Saving Basics (80C & Beyond)', desc: 'A plain-language walk through the deductions most salaried earners miss.', price: 59, modules: ['Section 80C, explained simply', 'Beyond 80C: 80D, HRA, NPS', 'Old regime vs new regime', 'A checklist for March'] },
  { id: 'i1', category: 'Investing', title: 'Stock Market Basics', desc: 'How exchanges work, how to read a quote, and what actually happens when you place an order.', price: 59, modules: ['NSE, BSE, and how trading works', 'Reading a stock quote', 'Placing your first order', 'Common beginner mistakes'] },
  { id: 'i2', category: 'Investing', title: 'Mutual Funds 101', desc: 'Active vs index, direct vs regular, and how to actually compare two funds.', price: 59, modules: ['Active vs index funds', 'Understanding expense ratio', 'Direct vs regular plans', 'Reading a fund factsheet'] },
  { id: 'i3', category: 'Investing', title: 'SIPs & the Power of Compounding', desc: 'Why showing up every month matters more than trying to time the market.', price: 49, modules: ['What compounding really means', 'SIP vs lump sum', 'Staying invested through a dip', "Setting a SIP you won't cancel"] },
  { id: 'i4', category: 'Investing', title: 'Reading a Balance Sheet', desc: 'The basics of fundamental analysis — assets, liabilities, and what they tell you.', price: 79, modules: ['Assets vs liabilities', 'What equity really means', 'Debt-to-equity, simply explained', 'Red flags to watch for'] },
];

const PLANS = [
  { id: 'starter', name: 'Starter', price: 39, cycle: '/month', features: ['2 beginner courses', 'Community forum access', 'Mobile-friendly lessons'], highlight: false },
  { id: 'growth', name: 'Growth', price: 199, cycle: '/month', features: ['All Finance + Investing courses', 'Downloadable notes', 'Monthly live Q&A'], highlight: true },
  { id: 'pro', name: 'Pro', price: 499, cycle: '/month', features: ['Everything in Growth', 'Completion certificates', '1:1 doubt-clearing session'], highlight: false },
];

function generateId() {
  return 'u_' + Math.random().toString(36).slice(2, 10);
}

function CourseCard({ course, onOpen, owned }) {
  const Icon = course.category === 'Finance' ? BookOpen : TrendingUp;
  return (
    <button onClick={onOpen} type="button" className="text-left bg-card rounded-2xl p-5 card-shadow flex flex-col focus-ring hover:-translate-y-0.5 transition-transform">
      <div className="flex items-center justify-between mb-4">
        <Icon size={18} className="text-ledger" />
        <span className="font-mono text-xs uppercase tracking-widest text-stone-400">{course.category}</span>
      </div>
      <h3 className="font-display text-base font-semibold text-ink mb-2 leading-snug">{course.title}</h3>
      <p className="text-sm text-stone-500 mb-4 flex-1 leading-relaxed">{course.desc}</p>
      <div className="flex items-center justify-between pt-3 border-t border-line">
        <span className="font-mono text-sm font-semibold text-ledger">{owned ? 'Enrolled' : `\u20B9${course.price}`}</span>
        {owned && <Check size={16} className="text-ledger" />}
      </div>
    </button>
  );
}

export default function Khaata() {
  const [view, setView] = useState('home');
  const [navOpen, setNavOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [ready, setReady] = useState(false);
  const [authMethod, setAuthMethod] = useState(null);
  const [authName, setAuthName] = useState('');
  const [authContact, setAuthContact] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await window.storage.get('khaata-current-user', false);
        if (mounted && res && res.value) {
          const u = JSON.parse(res.value);
          setUser(u);
          try {
            const p = await window.storage.get(`khaata-purchases-${u.id}`, false);
            if (mounted && p && p.value) setPurchases(JSON.parse(p.value));
          } catch (e) {}
        }
      } catch (e) {}
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function goTo(v) {
    setView(v);
    setNavOpen(false);
    window.scrollTo(0, 0);
  }

  async function handleLogin() {
    if (!authName.trim() || !authContact.trim()) return;
    const u = { id: generateId(), name: authName.trim(), contact: authContact.trim(), method: authMethod };
    try {
      await window.storage.set('khaata-current-user', JSON.stringify(u), false);
    } catch (err) {}
    setUser(u);
    setAuthName('');
    setAuthContact('');
    setAuthMethod(null);
    showToast(`Welcome, ${u.name}`);
    goTo('dashboard');
  }

  async function handleLogout() {
    setUser(null);
    setPurchases([]);
    try { await window.storage.delete('khaata-current-user', false); } catch (e) {}
    goTo('home');
  }

  async function handleEnroll(course) {
    if (!user) {
      setSelectedCourseId(course.id);
      goTo('login');
      return;
    }
    if (purchases.includes(course.id)) {
      goTo('dashboard');
      return;
    }
    const next = [...purchases, course.id];
    setPurchases(next);
    try {
      await window.storage.set(`khaata-purchases-${user.id}`, JSON.stringify(next), false);
    } catch (e) {}
    showToast(`Enrolled in ${course.title}`);
    goTo('dashboard');
  }

  const selectedCourse = useMemo(() => COURSES.find(c => c.id === selectedCourseId), [selectedCourseId]);
  const filteredCourses = useMemo(() => filter === 'All' ? COURSES : COURSES.filter(c => c.category === filter), [filter]);

  return (
    <div className="khaata-root min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .khaata-root {
          --ink: #14231C; --ledger: #1B4332; --ledger-light: #2D6A4F;
          --paper: #F1F4EC; --card: #FFFFFF; --gold: #BD8F2E; --line: #D7DECD;
          font-family: 'Inter', sans-serif; color: var(--ink); background: var(--paper);
        }
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .bg-ledger { background: var(--ledger); } .bg-ledger-light { background: var(--ledger-light); }
        .bg-gold { background: var(--gold); } .bg-card { background: var(--card); } .bg-paper { background: var(--paper); }
        .text-ledger { color: var(--ledger); } .text-gold { color: var(--gold); } .text-ink { color: var(--ink); }
        .border-line { border-color: var(--line); }
        .dotted-leader { flex: 1; border-bottom: 2px dotted var(--line); margin: 0 8px; transform: translateY(-4px); }
        .stamp { border: 2px solid var(--gold); border-radius: 9999px; transform: rotate(-8deg); color: var(--gold); }
        .card-shadow { box-shadow: 0 1px 2px rgba(20,35,28,0.06), 0 8px 24px rgba(20,35,28,0.06); }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
        .focus-ring:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
      `}</style>

      <nav className="sticky top-0 z-20 border-b border-line" style={{ background: 'rgba(241,244,236,0.92)', backdropFilter: 'blur(6px)' }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-16">
          <button onClick={() => goTo('home')} type="button" className="flex items-center gap-2 focus-ring">
            <Wallet size={22} className="text-ledger" />
            <span className="font-display text-xl font-semibold text-ledger">Khaata</span>
          </button>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => goTo('home')} type="button" className={`text-sm font-medium focus-ring ${view === 'home' ? 'text-ledger' : 'text-stone-500'}`}>Home</button>
            <button onClick={() => goTo('courses')} type="button" className={`text-sm font-medium focus-ring ${view === 'courses' ? 'text-ledger' : 'text-stone-500'}`}>Courses</button>
            <button onClick={() => goTo('pricing')} type="button" className={`text-sm font-medium focus-ring ${view === 'pricing' ? 'text-ledger' : 'text-stone-500'}`}>Pricing</button>
            {user ? (
              <button onClick={() => goTo('dashboard')} type="button" className="flex items-center gap-2 text-sm font-medium bg-ledger text-white px-4 py-2 rounded-full focus-ring">
                <User size={15} /> {user.name.split(' ')[0]}
              </button>
            ) : (
              <button onClick={() => goTo('login')} type="button" className="text-sm font-medium bg-ledger text-white px-4 py-2 rounded-full focus-ring">Log in</button>
            )}
          </div>
          <button className="md:hidden focus-ring" type="button" onClick={() => setNavOpen(!navOpen)} aria-label="Menu">
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {navOpen && (
          <div className="md:hidden border-t border-line px-5 py-4 flex flex-col gap-4">
            <button onClick={() => goTo('home')} type="button" className="text-left text-sm font-medium">Home</button>
            <button onClick={() => goTo('courses')} type="button" className="text-left text-sm font-medium">Courses</button>
            <button onClick={() => goTo('pricing')} type="button" className="text-left text-sm font-medium">Pricing</button>
            {user ? (
              <button onClick={() => goTo('dashboard')} type="button" className="text-left text-sm font-medium text-ledger">My dashboard</button>
            ) : (
              <button onClick={() => goTo('login')} type="button" className="text-left text-sm font-medium text-ledger">Log in</button>
            )}
          </div>
        )}
      </nav>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-ledger text-white text-sm px-4 py-2 rounded-full card-shadow">{toast}</div>
      )}

      {view === 'home' && (
        <div>
          <section className="max-w-6xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-xs tracking-widest uppercase text-gold mb-4">Personal Finance · Investing</p>
              <h1 className="font-display text-4xl md:text-5xl leading-tight font-semibold text-ledger mb-5">Every rupee tells a story. Learn to read yours.</h1>
              <p className="text-stone-600 text-base md:text-lg mb-8 max-w-md">Practical courses on budgeting, saving, and investing — built for real incomes, taught in plain language. No jargon, no guesswork.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => goTo('courses')} type="button" className="bg-ledger text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 focus-ring">Browse courses <ArrowRight size={16} /></button>
                <button onClick={() => goTo('pricing')} type="button" className="border border-line px-6 py-3 rounded-full text-sm font-medium focus-ring">Plans from ₹39/mo</button>
              </div>
            </div>
            <div className="relative">
              <div className="stamp bg-paper absolute -top-6 -right-2 md:right-4 w-20 h-20 flex items-center justify-center text-xs font-mono uppercase font-semibold text-center leading-tight z-10">Khaata<br />Verified</div>
              <div className="bg-card card-shadow rounded-2xl p-6 md:p-8">
                <p className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-4">Your ledger</p>
                {[
                  { name: 'Budgeting That Actually Sticks', status: '✓ Enrolled' },
                  { name: 'SIPs & Compounding', status: '₹49' },
                  { name: 'Stock Market Basics', status: '₹59' },
                  { name: 'Emergency Fund Building', status: '₹49' },
                ].map((row, i) => (
                  <div key={i} className="flex items-baseline py-3 border-b border-line last:border-0">
                    <span className="text-sm text-ink">{row.name}</span>
                    <span className="dotted-leader"></span>
                    <span className="font-mono text-sm text-ledger font-medium">{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-5 md:px-8 pb-16">
            <div className="grid grid-cols-3 gap-4 md:gap-8 border-t border-b border-line py-6">
              <div><p className="font-display text-2xl md:text-3xl text-ledger font-semibold">{COURSES.length}</p><p className="text-xs md:text-sm text-stone-500 mt-1">Courses live</p></div>
              <div><p className="font-display text-2xl md:text-3xl text-ledger font-semibold">2</p><p className="text-xs md:text-sm text-stone-500 mt-1">Categories</p></div>
              <div><p className="font-display text-2xl md:text-3xl text-ledger font-semibold">₹39</p><p className="text-xs md:text-sm text-stone-500 mt-1">To start learning</p></div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-5 md:px-8 pb-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl md:text-3xl text-ledger font-semibold">Start here</h2>
              <button onClick={() => goTo('courses')} type="button" className="text-sm font-medium text-ledger flex items-center gap-1 focus-ring">View all <ArrowRight size={14} /></button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {COURSES.slice(0, 4).map(c => (
                <CourseCard key={c.id} course={c} onOpen={() => { setSelectedCourseId(c.id); goTo('course'); }} owned={purchases.includes(c.id)} />
              ))}
            </div>
          </section>
        </div>
      )}

      {view === 'courses' && (
        <section className="max-w-6xl mx-auto px-5 md:px-8 py-12">
          <h1 className="font-display text-3xl md:text-4xl text-ledger font-semibold mb-2">All courses</h1>
          <p className="text-stone-600 mb-8">Pick a category, or browse everything.</p>
          <div className="flex gap-2 mb-8">
            {['All', 'Finance', 'Investing'].map(f => (
              <button key={f} onClick={() => setFilter(f)} type="button" className={`px-4 py-2 rounded-full text-sm font-medium focus-ring ${filter === f ? 'bg-ledger text-white' : 'border border-line text-stone-600'}`}>{f}</button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map(c => (
              <CourseCard key={c.id} course={c} onOpen={() => { setSelectedCourseId(c.id); goTo('course'); }} owned={purchases.includes(c.id)} />
            ))}
          </div>
        </section>
      )}

      {view === 'course' && selectedCourse && (
        <section className="max-w-3xl mx-auto px-5 md:px-8 py-12">
          <button onClick={() => goTo('courses')} type="button" className="flex items-center gap-1 text-sm text-stone-500 mb-6 focus-ring"><ChevronLeft size={16} /> Back to courses</button>
          <p className="font-mono text-xs uppercase tracking-widest text-gold mb-3">{selectedCourse.category}</p>
          <h1 className="font-display text-3xl md:text-4xl text-ledger font-semibold mb-4">{selectedCourse.title}</h1>
          <p className="text-stone-600 text-lg mb-8">{selectedCourse.desc}</p>
          <div className="bg-card card-shadow rounded-2xl p-6 mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-stone-400 mb-4">What's inside</p>
            {selectedCourse.modules.map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-line last:border-0">
                <span className="font-mono text-xs text-stone-400 w-5">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm text-ink">{m}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-ledger text-white rounded-2xl p-6">
            <div><p className="text-xs text-white opacity-70 mb-1">One-time enrollment</p><p className="font-mono text-2xl font-semibold">₹{selectedCourse.price}</p></div>
            {purchases.includes(selectedCourse.id) ? (
              <span className="flex items-center gap-2 text-sm font-medium bg-white bg-opacity-10 px-4 py-2 rounded-full"><Check size={16} /> Enrolled</span>
            ) : (
              <button onClick={() => handleEnroll(selectedCourse)} type="button" className="bg-white text-ledger px-6 py-3 rounded-full text-sm font-semibold focus-ring">Enroll now</button>
            )}
          </div>
        </section>
      )}

      {view === 'pricing' && (
        <section className="max-w-5xl mx-auto px-5 md:px-8 py-12">
          <h1 className="font-display text-3xl md:text-4xl text-ledger font-semibold mb-2 text-center">Plans</h1>
          <p className="text-stone-600 mb-10 text-center">Start small. Upgrade when you're ready.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map(p => (
              <div key={p.id} className={`rounded-2xl p-6 card-shadow flex flex-col ${p.highlight ? 'bg-ledger text-white' : 'bg-card'}`}>
                {p.highlight && <span className="font-mono text-xs uppercase tracking-widest bg-gold text-ledger self-start px-3 py-1 rounded-full mb-4 font-semibold">Most popular</span>}
                <h3 className={`font-display text-xl font-semibold mb-1 ${p.highlight ? 'text-white' : 'text-ledger'}`}>{p.name}</h3>
                <p className="font-mono text-3xl font-semibold mb-1">₹{p.price}<span className="text-sm font-normal opacity-70">{p.cycle}</span></p>
                <div className={`h-px my-4 ${p.highlight ? 'bg-white bg-opacity-20' : 'border-line'}`} style={!p.highlight ? { background: 'var(--line)' } : {}}></div>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={16} className={p.highlight ? 'text-gold shrink-0 mt-0.5' : 'text-ledger shrink-0 mt-0.5'} />
                      <span className={p.highlight ? 'text-white' : 'text-stone-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => goTo(user ? 'dashboard' : 'login')} type="button" className={`w-full py-3 rounded-full text-sm font-semibold focus-ring ${p.highlight ? 'bg-white text-ledger' : 'bg-ledger text-white'}`}>Choose {p.name}</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === 'login' && (
        <section className="max-w-md mx-auto px-5 py-16">
          <h1 className="font-display text-3xl text-ledger font-semibold mb-2 text-center">Welcome to Khaata</h1>
          <p className="text-stone-600 mb-8 text-center text-sm">Log in to enroll and track your courses.</p>
          {!authMethod ? (
            <div className="flex flex-col gap-3">
              <button onClick={() => setAuthMethod('google')} type="button" className="flex items-center justify-center gap-3 border border-line rounded-full py-3 text-sm font-medium bg-card focus-ring">
                <span className="w-4 h-4 rounded-full" style={{ background: 'conic-gradient(#4285F4 0 25%, #34A853 25% 50%, #FBBC05 50% 75%, #EA4335 75% 100%)' }}></span>
                Continue with Google
              </button>
              <button onClick={() => setAuthMethod('mobile')} type="button" className="flex items-center justify-center gap-3 border border-line rounded-full py-3 text-sm font-medium bg-card focus-ring">
                <Phone size={16} /> Continue with mobile number
              </button>
              <p className="text-xs text-stone-400 text-center mt-3 leading-relaxed">This is a working prototype — sign-in is simulated locally, not a real Google or SMS login.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Your name</label>
                <input value={authName} onChange={e => setAuthName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring bg-card" placeholder="Priya Sharma" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">{authMethod === 'google' ? 'Email address' : 'Mobile number'}</label>
                <input value={authContact} onChange={e => setAuthContact(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }} type={authMethod === 'google' ? 'email' : 'tel'} className="w-full border border-line rounded-xl px-4 py-3 text-sm focus-ring bg-card" placeholder={authMethod === 'google' ? 'priya@email.com' : '98765 43210'} />
              </div>
              <button onClick={handleLogin} type="button" disabled={!authName.trim() || !authContact.trim()} className="bg-ledger text-white py-3 rounded-full text-sm font-semibold mt-2 focus-ring disabled:opacity-40">Continue</button>
              <button onClick={() => setAuthMethod(null)} type="button" className="text-xs text-stone-400 focus-ring">← Choose a different method</button>
            </div>
          )}
        </section>
      )}

      {view === 'dashboard' && (
        <section className="max-w-4xl mx-auto px-5 md:px-8 py-12">
          {user ? (
            <>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">Your ledger</p>
                  <h1 className="font-display text-3xl text-ledger font-semibold">Welcome, {user.name.split(' ')[0]}</h1>
                </div>
                <button onClick={handleLogout} type="button" className="flex items-center gap-2 text-sm text-stone-500 focus-ring"><LogOut size={15} /> Log out</button>
              </div>
              <h2 className="font-display text-xl text-ledger font-semibold mb-4">My courses</h2>
              {purchases.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 text-center card-shadow">
                  <p className="text-stone-500 mb-4">Nothing enrolled yet — your ledger's empty page is waiting.</p>
                  <button onClick={() => goTo('courses')} type="button" className="bg-ledger text-white px-5 py-2.5 rounded-full text-sm font-medium focus-ring">Browse courses</button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {COURSES.filter(c => purchases.includes(c.id)).map(c => (
                    <CourseCard key={c.id} course={c} onOpen={() => { setSelectedCourseId(c.id); goTo('course'); }} owned />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-stone-500 mb-4">You're not logged in.</p>
              <button onClick={() => goTo('login')} type="button" className="bg-ledger text-white px-5 py-2.5 rounded-full text-sm font-medium focus-ring">Log in</button>
            </div>
          )}
        </section>
      )}

      <footer className="border-t border-line mt-12">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-stone-500">
          <div className="flex items-center gap-2"><Wallet size={16} className="text-ledger" /><span className="font-display text-ledger font-semibold">Khaata</span></div>
          <p>Personal finance & investing, in plain language.</p>
        </div>
      </footer>
    </div>
  );
}
