/**
 * js/script.js — Public Portfolio View & Controller
 * Renders all 9 sections in exact navigation order from `window.portfolioData`.
 * Uses consistent inline SVG icons (no emoji icons except the permitted
 * sun/moon on the theme toggle). Implements IntersectionObserver active nav
 * highlighting and safe DOM construction (createElement + textContent).
 */

(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'orpa_theme_pref_v1';
  const DRAFT_STORAGE_KEY = 'orpa_portfolio_draft_v1';

  // --- SVG ICON HELPER (No general-purpose emojis) ---
  const SVG_ICONS = {
    mail: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    github: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
    linkedin: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    external: '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    download: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    code: '<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    cpu: '<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
    clock: '<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    award: '<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    shield: '<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    location: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    copy: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    arrowRight: '<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
  };

  window.OrpaSvgIcon = function (name) {
    return SVG_ICONS[name] || SVG_ICONS.code;
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function isSafeHref(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('assets/') || trimmed === 'resume.pdf') return true;
    try {
      const parsed = new URL(trimmed, window.location.origin);
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch (e) {
      return false;
    }
  }

  // --- STATE MANAGEMENT ---
  let activePortfolioData = cloneData(window.portfolioData);
  let activeSkillGroup = 'All';

  function cloneData(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
  }

  function loadInitialPortfolioData() {
    const base = cloneData(window.portfolioData);
    try {
      const draftRaw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftRaw) {
        const parsed = JSON.parse(draftRaw);
        if (parsed && parsed.personal && Array.isArray(parsed.navigation)) {
          return parsed;
        }
      }
    } catch (e) {}
    return base;
  }

  window.OrpaPortfolioApp = {
    getData: () => activePortfolioData,
    setData: (newData, persistDraft = false) => {
      activePortfolioData = cloneData(newData);
      if (persistDraft) {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(activePortfolioData));
        } catch (e) {}
      }
      renderPortfolioPage();
    },
    clearLocalDraft: () => {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      activePortfolioData = cloneData(window.portfolioData);
      renderPortfolioPage();
    },
    renderPortfolioPage
  };

  // --- TOAST NOTIFICATION ---
  window.showOrpaToast = function (msg) {
    const toast = document.getElementById('toastBanner');
    const text = document.getElementById('toastText');
    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(window.showOrpaToast._timer);
    window.showOrpaToast._timer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3200);
  };

  // --- THEME INITIALIZATION & TOGGLE (Permitted emoji: ☀️ / 🌙) ---
  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme, savePref = true) {
    const normalized = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', normalized);
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (normalized === 'light') {
      if (icon) icon.textContent = '🌙';
      if (label) label.textContent = 'Dark';
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Switch to dark theme');
    } else {
      if (icon) icon.textContent = '☀️';
      if (label) label.textContent = 'Light';
      if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Switch to light theme');
    }
    if (savePref) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, normalized);
      } catch (e) {}
    }
    if (window.OrpaLampController && typeof window.OrpaLampController.updateThemeColors === 'function') {
      window.OrpaLampController.updateThemeColors(normalized);
    }
  }

  // --- NAVIGATION & INTERSECTION OBSERVER ---
  let sectionObserver = null;
  let currentActiveSectionId = 'about';

  function renderNavigation() {
    const desktopNav = document.getElementById('desktopPrimaryNav');
    const mobileNav = document.getElementById('mobilePrimaryNav');
    const navItems = Array.isArray(activePortfolioData.navigation) ? activePortfolioData.navigation : [];

    if (desktopNav) {
      desktopNav.textContent = '';
      navItems.forEach((item) => {
        const a = el('a', 'nav-link px-2.5 py-1.5 text-xs sm:text-sm font-medium transition relative', item.label);
        a.href = `#${item.id}`;
        a.dataset.navSection = item.id;
        a.addEventListener('click', () => setActiveNavItem(item.id));
        desktopNav.appendChild(a);
      });
    }

    if (mobileNav) {
      mobileNav.textContent = '';
      navItems.forEach((item) => {
        const a = el('a', 'mobile-nav-link nav-link px-3 py-2 rounded-xl minimal-inner text-xs font-medium text-main', item.label);
        a.href = `#${item.id}`;
        a.dataset.navSection = item.id;
        a.addEventListener('click', () => {
          setActiveNavItem(item.id);
          const drawer = document.getElementById('mobileMenu');
          if (drawer) drawer.classList.add('hidden');
        });
        mobileNav.appendChild(a);
      });
    }

    setActiveNavItem(currentActiveSectionId);
    setupSectionObserver();
  }

  function setActiveNavItem(sectionId) {
    if (!sectionId) return;
    currentActiveSectionId = sectionId;
    document.querySelectorAll('[data-nav-section]').forEach((link) => {
      const isMatch = link.dataset.navSection === sectionId;
      link.classList.toggle('active-nav-link', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function setupSectionObserver() {
    if (sectionObserver) {
      sectionObserver.disconnect();
    }
    const navItems = Array.isArray(activePortfolioData.navigation) ? activePortfolioData.navigation : [];
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!('IntersectionObserver' in window) || sections.length === 0) return;

    sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveNavItem(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: '-96px 0px -55% 0px',
        threshold: [0.15, 0.35, 0.6]
      }
    );

    sections.forEach((sec) => sectionObserver.observe(sec));
  }

  // --- RENDER ALL 9 SECTIONS ---
  function renderPortfolioPage() {
    const d = activePortfolioData;
    const p = d.personal || {};

    // Reorder DOM sections to match d.navigation order if needed
    const mainEl = document.getElementById('portfolioMainContainer');
    if (mainEl && Array.isArray(d.navigation)) {
      d.navigation.forEach((navItem) => {
        const sec = document.getElementById(navItem.id);
        if (sec) mainEl.appendChild(sec);
      });
    }

    renderNavigation();

    // 1. ABOUT & HERO SECTION (#about)
    const brandLogo = document.getElementById('brandLogoText');
    if (brandLogo) brandLogo.textContent = p.preferredName || 'Orpa';

    const eyebrow = document.getElementById('heroEyebrowText');
    if (eyebrow) eyebrow.textContent = p.title || 'CSE STUDENT · AIUB';

    const hFirst = document.getElementById('heroGreetingPrefix');
    if (hFirst) hFirst.textContent = p.headlineFirst || 'Curious mind.';

    const hSecond = document.getElementById('heroHighlightName');
    if (hSecond) hSecond.textContent = p.headlineSecond || 'Creative builder.';

    const tagline = document.getElementById('heroMainHeadline');
    if (tagline) tagline.textContent = p.tagline || '';

    const intro = document.getElementById('heroIntroParagraph');
    if (intro) intro.textContent = p.intro || '';

    const quote = document.getElementById('heroBrandQuote');
    if (quote) quote.textContent = p.brandQuote ? `“${p.brandQuote}”` : '';

    const profileImg = document.getElementById('aboutProfileImage');
    if (profileImg) {
      profileImg.src = isSafeHref(p.profileImage) ? p.profileImage : 'assets/images/profile.jpg';
      profileImg.alt = `${p.name || 'Isratul Ibnat Orpa'} profile portrait`;
    }

    const focus = p.currentFocus || {};
    const fLabel = document.getElementById('focusLabelText');
    if (fLabel) fLabel.textContent = focus.label || 'CURRENT FOCUS';
    const fHead = document.getElementById('focusHeadingText');
    if (fHead) fHead.textContent = focus.heading || 'Web development · Research · Problem solving';
    const fSub = document.getElementById('focusSubtitleText');
    if (fSub) fSub.textContent = focus.subtitle || 'Learning by building';
    const fStat = document.getElementById('focusStatusText');
    if (fStat) fStat.textContent = focus.availability || 'Open to internship opportunities';

    // Hero Social Links
    const heroSocialRow = document.getElementById('heroSocialLinksContainer');
    if (heroSocialRow) {
      heroSocialRow.textContent = '';
      const socials = Array.isArray(d.socialLinks) ? d.socialLinks : [];
      socials.forEach((soc, idx) => {
        if (idx > 0) {
          heroSocialRow.appendChild(el('span', 'text-mute', '|'));
        }
        const a = el('a', 'inline-flex items-center gap-1.5 hover:text-[var(--accent-primary)] transition text-xs font-medium text-sub');
        const hasUrl = soc.url && isSafeHref(soc.url);
        a.href = hasUrl ? soc.url : '#contact';
        if (hasUrl) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        const iconSpan = el('span', 'accent-text');
        iconSpan.innerHTML = soc.platform.toLowerCase().includes('github')
          ? SVG_ICONS.github
          : soc.platform.toLowerCase().includes('linkedin')
            ? SVG_ICONS.linkedin
            : SVG_ICONS.external;
        a.appendChild(iconSpan);
        a.appendChild(el('span', '', soc.platform));
        const extSpan = el('span', 'opacity-70');
        extSpan.innerHTML = SVG_ICONS.external;
        a.appendChild(extSpan);
        heroSocialRow.appendChild(a);
      });
    }

    // About Narrative Paragraphs & Qualities
    const aboutParaBox = document.getElementById('aboutParagraphsContainer');
    if (aboutParaBox) {
      aboutParaBox.textContent = '';
      (Array.isArray(p.aboutParagraphs) ? p.aboutParagraphs : []).forEach((para) => {
        aboutParaBox.appendChild(el('p', '', para));
      });
    }

    const infoFullName = document.getElementById('infoFullName');
    if (infoFullName) infoFullName.textContent = p.name || 'Isratul Ibnat Orpa';
    const infoStatus = document.getElementById('infoAcademicStatus');
    if (infoStatus) infoStatus.textContent = p.academicStanding || 'Undergraduate Student';

    const qualitiesGrid = document.getElementById('qualitiesGrid');
    if (qualitiesGrid) {
      qualitiesGrid.textContent = '';
      (Array.isArray(p.qualities) ? p.qualities : []).forEach((q) => {
        const card = el('div', 'p-3.5 rounded-2xl minimal-inner space-y-1');
        const titleRow = el('div', 'flex items-center gap-2');
        const iconBox = el('span', 'accent-text');
        iconBox.innerHTML = SVG_ICONS.check;
        titleRow.appendChild(iconBox);
        titleRow.appendChild(el('h4', 'text-xs font-semibold text-main', q.title));
        card.appendChild(titleRow);
        card.appendChild(el('p', 'text-[11px] text-sub leading-relaxed pl-6', q.description));
        qualitiesGrid.appendChild(card);
      });
    }

    // 2. EDUCATION SECTION (#education)
    const eduContainer = document.getElementById('educationListContainer');
    if (eduContainer) {
      eduContainer.textContent = '';
      (Array.isArray(d.education) ? d.education : []).forEach((ed) => {
        const card = el('article', 'minimal-card rounded-2xl p-6 border-l-4 border-l-[var(--accent-primary)] space-y-2');
        const topRow = el('div', 'flex flex-wrap items-center justify-between gap-2');
        topRow.appendChild(el('span', 'px-3 py-1 rounded-full text-xs font-mono minimal-inner accent-text', ed.period));
        if (ed.result) {
          topRow.appendChild(el('span', 'px-2.5 py-0.5 rounded-full text-xs font-mono minimal-inner text-main font-semibold', ed.result));
        }
        card.appendChild(topRow);
        card.appendChild(el('h3', 'font-serif text-lg font-bold text-main', ed.institution));
        card.appendChild(el('p', 'text-sm font-medium accent-text', ed.degree));
        if (ed.details) {
          card.appendChild(el('p', 'text-xs text-sub leading-relaxed', ed.details));
        }
        eduContainer.appendChild(card);
      });
    }

    updateAcademicMetricsBox();

    // 3. EXPERIENCE SECTION (#experience)
    const expData = d.experience || {};
    const expStatement = document.getElementById('experienceStatementText');
    if (expStatement) {
      expStatement.textContent = expData.statement || 'I am currently developing my technical portfolio, strengthening my practical skills, and preparing for internship opportunities.';
    }

    const expList = document.getElementById('experienceItemsList');
    if (expList) {
      expList.textContent = '';
      const entries = Array.isArray(expData.entries) ? expData.entries : [];
      entries.forEach((ex) => {
        const card = el('article', 'p-4 rounded-2xl minimal-inner space-y-1.5');
        const top = el('div', 'flex flex-wrap items-center justify-between gap-2');
        top.appendChild(el('h4', 'font-bold text-sm text-main', ex.role));
        top.appendChild(el('span', 'font-mono text-xs accent-text', ex.period));
        card.appendChild(top);
        card.appendChild(el('div', 'text-xs font-medium text-sub', ex.organization));
        if (ex.description) {
          card.appendChild(el('p', 'text-xs text-sub leading-relaxed', ex.description));
        }
        expList.appendChild(card);
      });
    }

    const objGrid = document.getElementById('objectivesGrid');
    if (objGrid) {
      objGrid.textContent = '';
      (Array.isArray(expData.careerObjectives) ? expData.careerObjectives : []).forEach((obj, idx) => {
        const item = el('div', 'p-3.5 rounded-xl minimal-inner flex items-start gap-2.5');
        item.appendChild(el('span', 'font-mono text-xs accent-text font-bold mt-0.5', String(idx + 1).padStart(2, '0')));
        item.appendChild(el('span', 'text-xs sm:text-sm text-main', obj.text || obj));
        objGrid.appendChild(item);
      });
    }

    // 4. PROJECTS SECTION (#projects)
    const projGrid = document.getElementById('projectsGridContainer');
    if (projGrid) {
      projGrid.textContent = '';
      (Array.isArray(d.projects) ? d.projects : []).forEach((proj) => {
        const article = el('article', 'minimal-card rounded-3xl p-6 flex flex-col justify-between space-y-4');
        const topWrap = el('div', 'space-y-4');

        // Header with SVG Icon
        const headRow = el('div', 'flex items-start justify-between gap-3');
        const leftHead = el('div', 'flex items-center gap-3.5');
        const iconBox = el('div', 'w-11 h-11 rounded-2xl minimal-inner flex items-center justify-center accent-text shrink-0');
        iconBox.innerHTML = SVG_ICONS[proj.iconType] || SVG_ICONS.code;
        leftHead.appendChild(iconBox);

        const titleCol = el('div', '');
        titleCol.appendChild(el('span', 'font-mono text-[10px] uppercase tracking-wider text-mute block', proj.category));
        titleCol.appendChild(el('h3', 'font-serif text-lg font-bold text-main leading-snug', proj.title));
        leftHead.appendChild(titleCol);
        headRow.appendChild(leftHead);
        headRow.appendChild(el('span', 'px-2.5 py-0.5 rounded-full text-[10px] font-mono minimal-inner accent-text shrink-0', proj.status));
        topWrap.appendChild(headRow);

        // Project Thumbnail Image with Fallback
        if (proj.thumbnail && isSafeHref(proj.thumbnail)) {
          const imgWrap = el('div', 'rounded-2xl overflow-hidden minimal-inner relative');
          const img = document.createElement('img');
          img.src = proj.thumbnail;
          img.alt = `${proj.title} project preview`;
          img.loading = 'lazy';
          img.className = 'w-full h-36 object-cover';
          const fallbackDiv = el('div', 'hidden p-5 text-center text-xs text-mute font-mono', `Thumbnail path: ${proj.thumbnail}`);
          img.addEventListener('error', () => {
            img.classList.add('hidden');
            fallbackDiv.classList.remove('hidden');
          });
          imgWrap.appendChild(img);
          imgWrap.appendChild(fallbackDiv);
          topWrap.appendChild(imgWrap);
        }

        topWrap.appendChild(el('p', 'text-xs sm:text-sm text-sub leading-relaxed', proj.description));

        // Technologies
        if (Array.isArray(proj.technologies) && proj.technologies.length > 0) {
          const techWrap = el('div', 'flex flex-wrap gap-1.5');
          proj.technologies.forEach((t) => {
            techWrap.appendChild(el('span', 'px-2.5 py-1 rounded-full text-[11px] font-mono minimal-inner text-main', t));
          });
          topWrap.appendChild(techWrap);
        }

        // Honest Implementation Notes
        if (proj.implementationNotes) {
          topWrap.appendChild(
            el('div', 'p-3 rounded-xl minimal-inner border-l-2 border-l-[var(--accent-primary)] text-xs text-sub leading-relaxed', proj.implementationNotes)
          );
        }

        article.appendChild(topWrap);

        // Optional Repository / Live Links (only shown if populated)
        if ((proj.repoUrl && isSafeHref(proj.repoUrl)) || (proj.liveUrl && isSafeHref(proj.liveUrl))) {
          const linkRow = el('div', 'pt-3 border-t border-[var(--border-subtle)] flex items-center gap-4 text-xs font-mono');
          if (proj.repoUrl && isSafeHref(proj.repoUrl)) {
            const repoA = el('a', 'inline-flex items-center gap-1.5 accent-text hover:underline');
            repoA.href = proj.repoUrl;
            repoA.target = '_blank';
            repoA.rel = 'noopener noreferrer';
            repoA.innerHTML = `${SVG_ICONS.github}<span>Source Code</span>`;
            linkRow.appendChild(repoA);
          }
          if (proj.liveUrl && isSafeHref(proj.liveUrl)) {
            const liveA = el('a', 'inline-flex items-center gap-1.5 accent-text hover:underline');
            liveA.href = proj.liveUrl;
            liveA.target = '_blank';
            liveA.rel = 'noopener noreferrer';
            liveA.innerHTML = `${SVG_ICONS.external}<span>Live Demo</span>`;
            linkRow.appendChild(liveA);
          }
          article.appendChild(linkRow);
        }

        projGrid.appendChild(article);
      });
    }

    // 5. RESEARCH SECTION (#research)
    const resContainer = document.getElementById('researchTopicsContainer');
    if (resContainer) {
      resContainer.textContent = '';
      (Array.isArray(d.research) ? d.research : []).forEach((resItem) => {
        const card = el('article', 'minimal-card rounded-3xl p-6 sm:p-8 space-y-5');
        const topRow = el('div', 'flex flex-wrap items-center justify-between gap-2');
        topRow.appendChild(el('span', 'font-mono text-xs uppercase tracking-wider accent-text', resItem.organization || 'Academic Research Exploration'));
        topRow.appendChild(el('span', 'px-3 py-1 rounded-full text-xs font-mono minimal-inner accent-text', resItem.status || 'Topic Exploration'));
        card.appendChild(topRow);

        card.appendChild(el('h3', 'font-serif text-2xl font-bold text-main', resItem.title));
        card.appendChild(el('p', 'text-sm text-sub leading-relaxed', resItem.summary));

        if (Array.isArray(resItem.directions) && resItem.directions.length > 0) {
          const dirWrap = el('div', 'space-y-2');
          dirWrap.appendChild(el('h4', 'font-mono text-xs uppercase accent-text', 'Potential Research Direction'));
          const ul = el('ul', 'space-y-2 text-xs sm:text-sm text-sub');
          resItem.directions.forEach((step, idx) => {
            const li = el('li', 'flex items-start gap-2.5 p-2.5 rounded-xl minimal-inner');
            li.appendChild(el('span', 'font-mono text-xs accent-text font-bold mt-0.5', `0${idx + 1}`));
            li.appendChild(el('span', 'text-main', step));
            ul.appendChild(li);
          });
          dirWrap.appendChild(ul);
          card.appendChild(dirWrap);
        }

        if (resItem.scopeLimitation) {
          const limBox = el('div', 'p-4 rounded-2xl minimal-inner border-l-4 border-l-[var(--accent-primary)] space-y-1');
          limBox.appendChild(el('div', 'font-mono text-xs font-bold uppercase accent-text', 'Important Scientific Scope Limitation'));
          limBox.appendChild(el('p', 'text-xs sm:text-sm text-sub leading-relaxed', resItem.scopeLimitation));
          card.appendChild(limBox);
        }

        resContainer.appendChild(card);
      });
    }

    const domainsContainer = document.getElementById('researchDomainsList');
    if (domainsContainer) {
      domainsContainer.textContent = '';
      (Array.isArray(d.researchDomains) ? d.researchDomains : []).forEach((dom, i) => {
        const row = el('div', 'p-3 rounded-xl minimal-inner flex items-center justify-between gap-2');
        row.appendChild(el('span', 'text-sm font-medium text-main', dom));
        row.appendChild(el('span', 'font-mono text-xs accent-text', String(i + 1).padStart(2, '0')));
        domainsContainer.appendChild(row);
      });
    }

    // 6. SKILLS SECTION (#skills)
    renderSkillsSection();

    // 7. ACHIEVEMENTS & CERTIFICATIONS SECTION (#achievements)
    const achGrid = document.getElementById('achievementsGrid');
    if (achGrid) {
      achGrid.textContent = '';
      (Array.isArray(d.achievements) ? d.achievements : []).forEach((ach) => {
        const card = el('article', 'minimal-card rounded-3xl p-6 flex flex-col justify-between space-y-4');
        const top = el('div', 'space-y-3');
        const head = el('div', 'flex items-center justify-between gap-2');
        const iconWrap = el('div', 'w-10 h-10 rounded-xl minimal-inner flex items-center justify-center accent-text');
        iconWrap.innerHTML = SVG_ICONS.award;
        head.appendChild(iconWrap);
        head.appendChild(el('span', 'px-2.5 py-0.5 rounded-full text-[10px] font-mono minimal-inner accent-text', ach.category));
        top.appendChild(head);

        top.appendChild(el('h3', 'font-serif text-lg font-bold text-main', ach.title));
        top.appendChild(el('p', 'text-xs font-medium accent-text', ach.issuer));
        top.appendChild(el('p', 'text-xs text-sub leading-relaxed', ach.description));
        card.appendChild(top);

        const foot = el('div', 'pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono');
        foot.appendChild(el('span', 'text-mute text-[11px]', ach.date || 'Verified Record'));
        if (ach.verifyUrl && isSafeHref(ach.verifyUrl)) {
          const a = el('a', 'inline-flex items-center gap-1 accent-text hover:underline');
          a.href = ach.verifyUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.innerHTML = `<span>Verify</span>${SVG_ICONS.external}`;
          foot.appendChild(a);
        }
        card.appendChild(foot);
        achGrid.appendChild(card);
      });
    }

    const certGrid = document.getElementById('certificatesGrid');
    if (certGrid) {
      certGrid.textContent = '';
      (Array.isArray(d.certifications) ? d.certifications : []).forEach((cert) => {
        const card = el('article', 'minimal-card rounded-3xl p-5 flex flex-col justify-between space-y-4');
        const top = el('div', 'space-y-3');
        const head = el('div', 'flex items-center justify-between gap-2');
        const iconWrap = el('div', 'w-9 h-9 rounded-xl minimal-inner flex items-center justify-center accent-text');
        iconWrap.innerHTML = SVG_ICONS.shield;
        head.appendChild(iconWrap);
        head.appendChild(el('span', 'px-2.5 py-0.5 rounded-full text-[10px] font-mono minimal-inner text-mute', cert.date || 'Date to be verified'));
        top.appendChild(head);

        top.appendChild(el('h4', 'font-serif text-base font-bold text-main', cert.title));
        top.appendChild(el('p', 'text-xs text-sub', cert.issuer));

        if (cert.image && isSafeHref(cert.image)) {
          const img = document.createElement('img');
          img.src = cert.image;
          img.alt = `${cert.title} certificate preview`;
          img.loading = 'lazy';
          img.className = 'w-full h-28 object-cover rounded-xl border border-[var(--border-subtle)]';
          top.appendChild(img);
        }
        card.appendChild(top);

        if (cert.verifyUrl && isSafeHref(cert.verifyUrl)) {
          const foot = el('div', 'pt-2 border-t border-[var(--border-subtle)] flex justify-end');
          const a = el('a', 'inline-flex items-center gap-1 text-xs font-mono accent-text hover:underline');
          a.href = cert.verifyUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.innerHTML = `<span>Verify Credential</span>${SVG_ICONS.external}`;
          foot.appendChild(a);
          card.appendChild(foot);
        }

        certGrid.appendChild(card);
      });
    }

    // 8. DEDICATED RESUME SECTION (#resume)
    const resumeConfig = d.resume || { file: 'resume.pdf', downloadFilename: 'Isratul_Ibnat_Orpa_Resume.pdf' };
    const safeResumeUrl = isSafeHref(resumeConfig.file) ? resumeConfig.file : 'resume.pdf';
    const resumeFrame = document.getElementById('resumePdfIframe');
    const resumeDownloadBtn = document.getElementById('resumeDownloadBtn');
    const resumeNewTabBtn = document.getElementById('resumeNewTabLink');
    const resumePathNote = document.getElementById('resumePathNoteText');

    if (resumeFrame) resumeFrame.src = safeResumeUrl;
    if (resumeDownloadBtn) {
      resumeDownloadBtn.href = safeResumeUrl;
      resumeDownloadBtn.setAttribute('download', resumeConfig.downloadFilename || 'Resume.pdf');
    }
    if (resumeNewTabBtn) {
      resumeNewTabBtn.href = safeResumeUrl;
    }
    if (resumePathNote) {
      resumePathNote.textContent = resumeConfig.lastUpdatedNote || 'Configured in js/data.js (resume.file).';
    }

    // 9. CONTACT SECTION (#contact) — Concise, NO CV option
    const contact = d.contact || {};
    const emailLink = document.getElementById('contactEmailLink');
    if (emailLink) {
      emailLink.textContent = contact.email || '23-54405-3@student.aiub.edu';
      emailLink.href = `mailto:${contact.email || '23-54405-3@student.aiub.edu'}`;
    }
    const locationText = document.getElementById('contactLocationText');
    if (locationText) {
      locationText.textContent = contact.location || 'Dhaka, Bangladesh';
    }

    const contactSocialList = document.getElementById('contactSocialLinksList');
    if (contactSocialList) {
      contactSocialList.textContent = '';
      (Array.isArray(d.socialLinks) ? d.socialLinks : []).forEach((soc) => {
        const row = el('div', 'p-4 rounded-2xl minimal-inner flex items-center justify-between gap-3');
        const left = el('div', 'flex items-center gap-3');
        const iconSpan = el('span', 'accent-text');
        iconSpan.innerHTML = soc.platform.toLowerCase().includes('github')
          ? SVG_ICONS.github
          : soc.platform.toLowerCase().includes('linkedin')
            ? SVG_ICONS.linkedin
            : SVG_ICONS.external;
        left.appendChild(iconSpan);

        const textCol = el('div', '');
        textCol.appendChild(el('span', 'font-mono text-[11px] uppercase text-mute block', soc.platform));
        if (soc.url && isSafeHref(soc.url)) {
          const a = el('a', 'text-sm font-mono accent-text hover:underline inline-flex items-center gap-1', soc.url);
          a.href = soc.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          textCol.appendChild(a);
        } else {
          textCol.appendChild(el('span', 'text-xs font-mono text-sub', soc.label || 'Not published yet'));
        }
        left.appendChild(textCol);
        row.appendChild(left);
        contactSocialList.appendChild(row);
      });
    }
  }

  function renderSkillsSection() {
    const grid = document.getElementById('skillsGrid');
    if (!grid) return;
    grid.textContent = '';
    const allSkills = Array.isArray(activePortfolioData.skills) ? activePortfolioData.skills : [];
    const filtered = activeSkillGroup === 'All'
      ? allSkills
      : allSkills.filter((s) => s.group === activeSkillGroup);

    filtered.forEach((sk) => {
      const card = el('div', 'minimal-card rounded-2xl p-5 space-y-2');
      const top = el('div', 'flex items-center justify-between gap-2');
      top.appendChild(el('span', 'px-2.5 py-0.5 rounded-full text-[10px] font-mono minimal-inner accent-text', sk.context || sk.group));
      top.appendChild(el('span', 'text-[10px] font-mono text-mute', sk.group));
      card.appendChild(top);
      card.appendChild(el('h3', 'font-serif text-base font-bold text-main', sk.name));
      card.appendChild(el('p', 'text-xs text-sub leading-relaxed', sk.description));
      grid.appendChild(card);
    });
  }

  function updateAcademicMetricsBox() {
    const p = activePortfolioData.personal || {};
    const unverifiedView = document.getElementById('metricsUnverifiedView');
    const confirmedView = document.getElementById('metricsConfirmedView');
    const verLabel = document.getElementById('verificationModeLabel');
    const metricStatusPill = document.getElementById('metricStatusPill');
    const cgpaVal = document.getElementById('cgpaValueText');
    const mathVal = document.getElementById('mathMarksValueText');

    if (cgpaVal) cgpaVal.textContent = p.reportedCgpa || '3.72';
    if (mathVal) mathVal.textContent = p.mathCoursesSummary || '4x (95+) & 2x (87)';

    if (p.publishAcademicMetrics) {
      if (unverifiedView) unverifiedView.classList.add('hidden');
      if (confirmedView) confirmedView.classList.remove('hidden');
      if (verLabel) verLabel.textContent = 'Hide Unconfirmed Metrics';
      if (metricStatusPill) metricStatusPill.textContent = 'SHOWING REPORTED RECORD';
    } else {
      if (unverifiedView) unverifiedView.classList.remove('hidden');
      if (confirmedView) confirmedView.classList.add('hidden');
      if (verLabel) verLabel.textContent = 'Show Reported (Oct 2025)';
      if (metricStatusPill) metricStatusPill.textContent = 'PENDING CONFIRMATION';
    }
  }

  // --- INITIALIZE ON DOM READY ---
  window.addEventListener('DOMContentLoaded', () => {
    activePortfolioData = loadInitialPortfolioData();
    applyTheme(getInitialTheme(), false);
    renderPortfolioPage();

    if (typeof window.initOrpaThreeScene === 'function') {
      window.initOrpaThreeScene();
    }

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const curr = document.documentElement.getAttribute('data-theme') || 'light';
        const next = curr === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
        window.showOrpaToast(`Switched to ${next === 'light' ? 'Light' : 'Dark'} theme.`);
      });
    }

    // Lamp Controls
    const bindClick = (id, fn) => {
      const node = document.getElementById(id);
      if (node) node.addEventListener('click', fn);
    };
    bindClick('headerPullLampBtn', () => window.OrpaLampController.triggerPull());
    bindClick('heroPullCordBtn', () => window.OrpaLampController.triggerPull());
    bindClick('aboutPullLampBtn', () => window.OrpaLampController.triggerPull());
    bindClick('overlayPullLampBtn', () => window.OrpaLampController.triggerPull(true));
    bindClick('boostThoughtBtn', () => window.OrpaLampController.boostThought());

    // Academic Verification Toggle
    bindClick('toggleVerificationModeBtn', () => {
      activePortfolioData.personal.publishAcademicMetrics = !activePortfolioData.personal.publishAcademicMetrics;
      updateAcademicMetricsBox();
    });

    // Skill Filter Buttons
    document.querySelectorAll('.skill-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.skill-filter-btn').forEach((b) => {
          b.className = 'skill-filter-btn btn-outline-minimal px-4 py-1.5 rounded-full text-xs font-mono';
        });
        btn.className = 'skill-filter-btn btn-primary-minimal px-4 py-1.5 rounded-full text-xs font-mono font-semibold';
        activeSkillGroup = btn.getAttribute('data-skill-filter') || 'All';
        renderSkillsSection();
      });
    });

    // Copy Email Button
    bindClick('copyEmailBtn', () => {
      const email = (activePortfolioData.contact && activePortfolioData.contact.email) || '23-54405-3@student.aiub.edu';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement('textarea');
          ta.value = email;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
      } catch (e) {}
      window.showOrpaToast(`Copied ${email} to clipboard.`);
    });

    // Mobile Menu Toggle
    bindClick('mobileMenuBtn', () => {
      const menu = document.getElementById('mobileMenu');
      if (menu) menu.classList.toggle('hidden');
    });
  });
})();
