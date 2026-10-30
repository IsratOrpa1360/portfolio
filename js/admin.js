/**
 * js/admin.js — Authenticated Admin Dashboard Controller
 * Provides beginner-friendly management interfaces for all portfolio sections:
 * - Add, Edit, Delete (with confirmation), and Reorder entries
 * - Update image/resume paths & upload validated files to `/api/upload`
 * - Preview changes live, Save to `/api/portfolio` (or download updated `js/data.js`),
 *   and Cancel unsaved changes.
 */

(function () {
  'use strict';

  let savedSnapshot = null;
  let activeAdminTab = 'personal';
  let pendingDeleteCallback = null;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function setStatusMessage(msg, isError = false) {
    const banner = document.getElementById('adminSaveStatusBanner');
    if (!banner) return;
    banner.textContent = msg;
    banner.className = isError
      ? 'p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-500 text-xs font-mono'
      : 'p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-mono';
    banner.classList.remove('hidden');
  }

  function openDeleteConfirmation(itemLabel, onConfirm) {
    const modal = document.getElementById('adminDeleteConfirmModal');
    const text = document.getElementById('adminDeleteConfirmText');
    if (!modal || !text) return;
    text.textContent = `Are you sure you want to delete "${itemLabel}"? You can still cancel unsaved changes before publishing.`;
    pendingDeleteCallback = onConfirm;
    modal.classList.remove('hidden');
  }

  // --- RENDER ADMIN DASHBOARD TABS ---
  function renderAdminDashboard() {
    const panel = document.getElementById('adminDashboardContent');
    if (!panel) return;
    panel.textContent = '';

    const data = window.OrpaPortfolioApp.getData();

    if (activeAdminTab === 'personal') {
      renderPersonalEditor(panel, data);
    } else if (activeAdminTab === 'education') {
      renderCollectionEditor(panel, data.education, 'Education Entry', [
        { key: 'institution', label: 'Institution Name' },
        { key: 'degree', label: 'Degree / Certificate' },
        { key: 'period', label: 'Attended Period / Status' },
        { key: 'result', label: 'Result (e.g., GPA 5.00)' },
        { key: 'details', label: 'Additional Details', multiline: true }
      ]);
    } else if (activeAdminTab === 'experience') {
      renderExperienceEditor(panel, data);
    } else if (activeAdminTab === 'projects') {
      renderProjectsEditor(panel, data.projects);
    } else if (activeAdminTab === 'research') {
      renderCollectionEditor(panel, data.research, 'Research Topic', [
        { key: 'title', label: 'Research Title' },
        { key: 'status', label: 'Status (e.g., Topic Exploration / Proposed Research)' },
        { key: 'organization', label: 'Institution / Context' },
        { key: 'summary', label: 'Summary', multiline: true },
        { key: 'scopeLimitation', label: 'Scientific Scope Limitation', multiline: true }
      ]);
    } else if (activeAdminTab === 'skills') {
      renderCollectionEditor(panel, data.skills, 'Skill / Learning Area', [
        { key: 'name', label: 'Skill Name' },
        { key: 'group', label: 'Group (Academic & Analytical OR Technical Learning Areas)' },
        { key: 'context', label: 'Context Badge (e.g., Completed 6 university courses)' },
        { key: 'description', label: 'Short Description' }
      ]);
    } else if (activeAdminTab === 'certifications') {
      renderCollectionEditor(panel, data.certifications, 'Certification', [
        { key: 'title', label: 'Certificate Title' },
        { key: 'issuer', label: 'Issuing Organization' },
        { key: 'date', label: 'Date / Status' },
        { key: 'image', label: 'Certificate Image Path (assets/images/certificates/...)' },
        { key: 'verifyUrl', label: 'Official Verification URL (optional)' }
      ], 'certificates');
    } else if (activeAdminTab === 'achievements') {
      renderCollectionEditor(panel, data.achievements, 'Achievement', [
        { key: 'title', label: 'Achievement Title' },
        { key: 'issuer', label: 'Organization / Platform' },
        { key: 'category', label: 'Category' },
        { key: 'date', label: 'Date / Milestone' },
        { key: 'description', label: 'Description', multiline: true },
        { key: 'verifyUrl', label: 'Verification URL (optional)' }
      ]);
    } else if (activeAdminTab === 'contact') {
      renderContactAndSocialEditor(panel, data);
    } else if (activeAdminTab === 'resume') {
      renderResumeAndNavEditor(panel, data);
    }
  }

  function createFieldInput(label, value, onChange, multiline = false) {
    const wrap = el('div', 'space-y-1');
    wrap.appendChild(el('label', 'block font-mono text-[11px] accent-text', label));
    const input = multiline
      ? el('textarea', 'w-full px-3 py-2 rounded-xl minimal-inner text-xs text-main')
      : el('input', 'w-full px-3 py-2 rounded-xl minimal-inner text-xs text-main');
    if (multiline) input.rows = 3;
    else input.type = 'text';
    input.value = value || '';
    input.addEventListener('input', () => {
      onChange(input.value);
      window.OrpaPortfolioApp.renderPortfolioPage();
    });
    wrap.appendChild(input);
    return wrap;
  }

  function renderPersonalEditor(container, data) {
    const p = data.personal;
    const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 gap-4');
    grid.appendChild(createFieldInput('Full Name', p.name, (v) => { p.name = v; }));
    grid.appendChild(createFieldInput('Preferred Name', p.preferredName, (v) => { p.preferredName = v; }));
    grid.appendChild(createFieldInput('Professional Title / Eyebrow', p.title, (v) => { p.title = v; }));
    grid.appendChild(createFieldInput('Academic Standing', p.academicStanding, (v) => { p.academicStanding = v; }));
    grid.appendChild(createFieldInput('Hero Headline (Line 1)', p.headlineFirst, (v) => { p.headlineFirst = v; }));
    grid.appendChild(createFieldInput('Hero Headline (Line 2 Accent)', p.headlineSecond, (v) => { p.headlineSecond = v; }));
    grid.appendChild(createFieldInput('Tagline', p.tagline, (v) => { p.tagline = v; }));
    grid.appendChild(createFieldInput('Profile Image Path', p.profileImage, (v) => { p.profileImage = v; }));
    container.appendChild(grid);

    container.appendChild(createFieldInput('Short Introduction', p.intro, (v) => { p.intro = v; }, true));
    container.appendChild(createFieldInput('Personal Brand Quote', p.brandQuote, (v) => { p.brandQuote = v; }));
    container.appendChild(
      createFieldInput(
        'About Paragraphs (one paragraph per line)',
        (p.aboutParagraphs || []).join('\n'),
        (v) => {
          p.aboutParagraphs = v.split('\n').map((s) => s.trim()).filter(Boolean);
        },
        true
      )
    );
  }

  function renderExperienceEditor(container, data) {
    if (!data.experience) data.experience = { statement: '', entries: [], careerObjectives: [] };
    container.appendChild(
      createFieldInput('Current Experience Summary Statement', data.experience.statement, (v) => {
        data.experience.statement = v;
      }, true)
    );
    renderCollectionEditor(container, data.experience.entries, 'Experience / Internship Role', [
      { key: 'role', label: 'Role / Title' },
      { key: 'organization', label: 'Company / Organization' },
      { key: 'period', label: 'Dates / Period' },
      { key: 'description', label: 'Contributions & Outcomes', multiline: true }
    ]);
  }

  function renderProjectsEditor(container, projects) {
    const topBar = el('div', 'flex items-center justify-between mb-3');
    topBar.appendChild(el('h4', 'font-serif font-bold text-base text-main', `Projects (${projects.length})`));
    const addBtn = el('button', 'btn-primary-minimal px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold', '+ Add Project');
    addBtn.type = 'button';
    addBtn.addEventListener('click', () => {
      projects.push({
        id: `proj-${Date.now()}`,
        title: 'New Project',
        category: 'Web / Software',
        status: 'In Development',
        iconType: 'code',
        thumbnail: 'assets/images/projects/portfolio-preview.svg',
        images: [],
        description: 'Project summary.',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        implementationNotes: '',
        repoUrl: '',
        liveUrl: ''
      });
      window.OrpaPortfolioApp.renderPortfolioPage();
      renderAdminDashboard();
    });
    topBar.appendChild(addBtn);
    container.appendChild(topBar);

    projects.forEach((proj, idx) => {
      const card = el('div', 'p-4 rounded-2xl minimal-inner space-y-3 mb-4');
      const header = el('div', 'flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2');
      header.appendChild(el('span', 'font-mono text-xs font-bold accent-text', `#${idx + 1} — ${proj.title}`));

      const actions = el('div', 'flex items-center gap-1.5');
      const upBtn = el('button', 'px-2 py-1 rounded minimal-card text-[11px] font-mono', '↑ Up');
      upBtn.type = 'button';
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', () => {
        if (idx > 0) {
          const tmp = projects[idx - 1];
          projects[idx - 1] = projects[idx];
          projects[idx] = tmp;
          window.OrpaPortfolioApp.renderPortfolioPage();
          renderAdminDashboard();
        }
      });

      const downBtn = el('button', 'px-2 py-1 rounded minimal-card text-[11px] font-mono', '↓ Down');
      downBtn.type = 'button';
      downBtn.disabled = idx === projects.length - 1;
      downBtn.addEventListener('click', () => {
        if (idx < projects.length - 1) {
          const tmp = projects[idx + 1];
          projects[idx + 1] = projects[idx];
          projects[idx] = tmp;
          window.OrpaPortfolioApp.renderPortfolioPage();
          renderAdminDashboard();
        }
      });

      const delBtn = el('button', 'px-2.5 py-1 rounded bg-red-500/15 text-red-500 text-[11px] font-mono', 'Delete');
      delBtn.type = 'button';
      delBtn.addEventListener('click', () => {
        openDeleteConfirmation(proj.title, () => {
          projects.splice(idx, 1);
          window.OrpaPortfolioApp.renderPortfolioPage();
          renderAdminDashboard();
        });
      });

      actions.appendChild(upBtn);
      actions.appendChild(downBtn);
      actions.appendChild(delBtn);
      header.appendChild(actions);
      card.appendChild(header);

      const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 gap-3');
      grid.appendChild(createFieldInput('Title', proj.title, (v) => { proj.title = v; }));
      grid.appendChild(createFieldInput('Category', proj.category, (v) => { proj.category = v; }));
      grid.appendChild(createFieldInput('Status', proj.status, (v) => { proj.status = v; }));
      grid.appendChild(createFieldInput('Thumbnail Path (assets/images/projects/...)', proj.thumbnail, (v) => { proj.thumbnail = v; }));
      grid.appendChild(createFieldInput('Technologies (comma-separated)', (proj.technologies || []).join(', '), (v) => {
        proj.technologies = v.split(',').map((s) => s.trim()).filter(Boolean);
      }));
      grid.appendChild(createFieldInput('Repository URL (optional)', proj.repoUrl, (v) => { proj.repoUrl = v; }));
      card.appendChild(grid);

      card.appendChild(createFieldInput('Description', proj.description, (v) => { proj.description = v; }, true));
      card.appendChild(createFieldInput('Honest Implementation Notes', proj.implementationNotes, (v) => { proj.implementationNotes = v; }, true));

      container.appendChild(card);
    });
  }

  function renderCollectionEditor(container, list, itemLabel, fields) {
    if (!Array.isArray(list)) return;
    const topBar = el('div', 'flex items-center justify-between mb-3 pt-2');
    topBar.appendChild(el('h4', 'font-serif font-bold text-base text-main', `${itemLabel}s (${list.length})`));
    const addBtn = el('button', 'btn-primary-minimal px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold', `+ Add ${itemLabel}`);
    addBtn.type = 'button';
    addBtn.addEventListener('click', () => {
      const newObj = { id: `item-${Date.now()}` };
      fields.forEach((f) => { newObj[f.key] = ''; });
      list.push(newObj);
      window.OrpaPortfolioApp.renderPortfolioPage();
      renderAdminDashboard();
    });
    topBar.appendChild(addBtn);
    container.appendChild(topBar);

    list.forEach((item, idx) => {
      const card = el('div', 'p-4 rounded-2xl minimal-inner space-y-3 mb-3');
      const header = el('div', 'flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2');
      const displayTitle = item.title || item.institution || item.name || item.role || `${itemLabel} #${idx + 1}`;
      header.appendChild(el('span', 'font-mono text-xs font-bold accent-text', displayTitle));

      const actions = el('div', 'flex items-center gap-1.5');
      const upBtn = el('button', 'px-2 py-1 rounded minimal-card text-[11px] font-mono', '↑');
      upBtn.type = 'button';
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', () => {
        if (idx > 0) {
          const tmp = list[idx - 1];
          list[idx - 1] = list[idx];
          list[idx] = tmp;
          window.OrpaPortfolioApp.renderPortfolioPage();
          renderAdminDashboard();
        }
      });

      const downBtn = el('button', 'px-2 py-1 rounded minimal-card text-[11px] font-mono', '↓');
      downBtn.type = 'button';
      downBtn.disabled = idx === list.length - 1;
      downBtn.addEventListener('click', () => {
        if (idx < list.length - 1) {
          const tmp = list[idx + 1];
          list[idx + 1] = list[idx];
          list[idx] = tmp;
          window.OrpaPortfolioApp.renderPortfolioPage();
          renderAdminDashboard();
        }
      });

      const delBtn = el('button', 'px-2.5 py-1 rounded bg-red-500/15 text-red-500 text-[11px] font-mono', 'Delete');
      delBtn.type = 'button';
      delBtn.addEventListener('click', () => {
        openDeleteConfirmation(displayTitle, () => {
          list.splice(idx, 1);
          window.OrpaPortfolioApp.renderPortfolioPage();
          renderAdminDashboard();
        });
      });

      actions.appendChild(upBtn);
      actions.appendChild(downBtn);
      actions.appendChild(delBtn);
      header.appendChild(actions);
      card.appendChild(header);

      const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 gap-3');
      fields.forEach((f) => {
        const inputEl = createFieldInput(f.label, item[f.key], (v) => { item[f.key] = v; }, f.multiline);
        if (f.multiline) inputEl.classList.add('sm:col-span-2');
        grid.appendChild(inputEl);
      });
      card.appendChild(grid);
      container.appendChild(card);
    });
  }

  function renderContactAndSocialEditor(container, data) {
    if (!data.contact) data.contact = {};
    const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4');
    grid.appendChild(createFieldInput('University / Contact Email', data.contact.email, (v) => { data.contact.email = v; }));
    grid.appendChild(createFieldInput('Location', data.contact.location, (v) => { data.contact.location = v; }));
    container.appendChild(grid);

    renderCollectionEditor(container, data.socialLinks, 'Social Link', [
      { key: 'platform', label: 'Platform Name (e.g., GitHub, LinkedIn)' },
      { key: 'url', label: 'Verified Profile URL (https://...)' },
      { key: 'label', label: 'Fallback Note When Empty' }
    ]);
  }

  function renderResumeAndNavEditor(container, data) {
    if (!data.resume) data.resume = {};
    const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6');
    grid.appendChild(createFieldInput('Resume PDF File Path', data.resume.file, (v) => { data.resume.file = v; }));
    grid.appendChild(createFieldInput('Download Filename', data.resume.downloadFilename, (v) => { data.resume.downloadFilename = v; }));
    container.appendChild(grid);

    renderCollectionEditor(container, data.navigation, 'Navigation Item', [
      { key: 'id', label: 'Section ID (about, education, experience, projects, research, skills, achievements, resume, contact)' },
      { key: 'label', label: 'Navigation Label' }
    ]);
  }

  // --- SAVE TO BACKEND OR EXPORT DATA.JS ---
  async function saveChangesToServer() {
    const authState = window.OrpaAuth.getState();
    const currentData = window.OrpaPortfolioApp.getData();

    if (authState.serverReachable && !authState.localPreviewOnly) {
      try {
        const res = await fetch(['/api', 'portfolio'].join('/'), {
          method: 'PUT',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': authState.csrfToken || '',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ portfolioData: currentData })
        });
        const payload = await res.json();
        if (!res.ok) {
          setStatusMessage(payload.error || 'Failed to save changes on server.', true);
          return;
        }
        savedSnapshot = clone(currentData);
        setStatusMessage('Saved changes to server js/data.js (backup created in server/backups/).', false);
        window.showOrpaToast('Saved changes to js/data.js!');
        return;
      } catch (e) {
        setStatusMessage('Server connection error while saving.', true);
        return;
      }
    }

    // Local Draft Preview Mode fallback: save draft locally & offer `js/data.js` download
    window.OrpaPortfolioApp.setData(currentData, true);
    savedSnapshot = clone(currentData);
    setStatusMessage(
      'Saved draft to browser localStorage. Because you are in static preview mode without the Node server running, click "Download js/data.js" to update your project file.',
      false
    );
    window.showOrpaToast('Saved local preview draft.');
  }

  function downloadDataJsFile() {
    const currentData = window.OrpaPortfolioApp.getData();
    const content = [
      '/**',
      ' * js/data.js — Centralized Public Portfolio Data (Model)',
      ' * IMPORTANT: This file is served publicly to every visitor.',
      ' * NEVER store passwords, hashes, session secrets, or private keys here.',
      ' */',
      '',
      'const portfolioData = ' + JSON.stringify(currentData, null, 2) + ';',
      '',
      'if (typeof window !== "undefined") {',
      '  window.portfolioData = portfolioData;',
      '}',
      'if (typeof module !== "undefined" && module.exports) {',
      '  module.exports = portfolioData;',
      '}',
      ''
    ].join('\n');

    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.showOrpaToast('Downloaded updated data.js file.');
  }

  // --- INITIALIZE ADMIN UI & LOGIN FLOW ---
  window.addEventListener('DOMContentLoaded', async () => {
    const loginModal = document.getElementById('adminLoginModal');
    const dashboardDrawer = document.getElementById('adminDashboardModal');
    const loginForm = document.getElementById('adminLoginForm');
    const passInput = document.getElementById('adminPasswordInput');
    const togglePassBtn = document.getElementById('togglePasswordVisibilityBtn');
    const loginError = document.getElementById('adminLoginError');
    const loginSubmitBtn = document.getElementById('adminLoginSubmitBtn');
    const localPreviewFallbackBox = document.getElementById('adminLocalPreviewFallbackBox');

    function updateAdminUIVisibility() {
      const st = window.OrpaAuth.getState();
      if (st.authenticated) {
        document.body.classList.add('admin-authenticated');
        const modeBadge = document.getElementById('adminSessionModeBadge');
        if (modeBadge) {
          modeBadge.textContent = st.localPreviewOnly
            ? 'LOCAL DRAFT PREVIEW (Browser Only)'
            : 'AUTHENTICATED SERVER SESSION';
        }
      } else {
        document.body.classList.remove('admin-authenticated');
      }
    }

    function openAdminEntry() {
      const st = window.OrpaAuth.getState();
      if (st.authenticated) {
        savedSnapshot = clone(window.OrpaPortfolioApp.getData());
        renderAdminDashboard();
        dashboardDrawer.classList.remove('hidden');
      } else {
        if (loginError) loginError.classList.add('hidden');
        if (passInput) passInput.value = '';
        loginModal.classList.remove('hidden');
        setTimeout(() => { if (passInput) passInput.focus(); }, 50);
      }
    }

    // Discreet footer link & hash route (#admin-login)
    const footerAdminBtn = document.getElementById('discreetAdminLoginBtn');
    if (footerAdminBtn) footerAdminBtn.addEventListener('click', openAdminEntry);

    const openDashboardTopBtn = document.getElementById('openAdminDashboardBtn');
    if (openDashboardTopBtn) openDashboardTopBtn.addEventListener('click', openAdminEntry);

    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#admin-login' || window.location.hash === '#admin') {
        openAdminEntry();
      }
    });

    // Show / Hide Password Toggle
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        togglePassBtn.textContent = isPass ? 'Hide' : 'Show';
        togglePassBtn.setAttribute('aria-label', isPass ? 'Hide password' : 'Show password');
      });
    }

    // Close Login Modal
    ['closeAdminLoginBtn', 'cancelAdminLoginBtn'].forEach((id) => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => loginModal.classList.add('hidden'));
    });

    // Submit Password to Server
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        const password = passInput.value;
        if (!password || password.trim().length === 0) {
          loginError.textContent = 'Please enter your admin password.';
          loginError.classList.remove('hidden');
          return;
        }

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Verifying...';
        const result = await window.OrpaAuth.loginWithPassword(password);
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = 'Sign In';
        passInput.value = '';

        if (result.ok) {
          loginModal.classList.add('hidden');
          updateAdminUIVisibility();
          savedSnapshot = clone(window.OrpaPortfolioApp.getData());
          renderAdminDashboard();
          dashboardDrawer.classList.remove('hidden');
          window.showOrpaToast('Authenticated with backend server.');
        } else {
          loginError.textContent = result.error;
          loginError.classList.remove('hidden');
          if (result.networkOffline && localPreviewFallbackBox) {
            localPreviewFallbackBox.classList.remove('hidden');
          }
        }
      });
    }

    // Local Draft Preview Mode Button (only when backend server is unreachable in static preview)
    const previewModeBtn = document.getElementById('enableLocalDraftPreviewBtn');
    if (previewModeBtn) {
      previewModeBtn.addEventListener('click', () => {
        window.OrpaAuth.enableLocalDraftPreviewMode();
        loginModal.classList.add('hidden');
        updateAdminUIVisibility();
        savedSnapshot = clone(window.OrpaPortfolioApp.getData());
        renderAdminDashboard();
        dashboardDrawer.classList.remove('hidden');
        setStatusMessage(
          'Local Draft Preview Mode active: edits preview in your browser only and do not authenticate against .env or modify server files.',
          false
        );
      });
    }

    // Dashboard Tabs
    document.querySelectorAll('[data-admin-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('[data-admin-tab]').forEach((b) => {
          b.className = 'admin-tab-btn px-3 py-1.5 rounded-full text-xs font-mono minimal-inner text-sub';
        });
        tabBtn.className = 'admin-tab-btn btn-primary-minimal px-3 py-1.5 rounded-full text-xs font-mono font-semibold';
        activeAdminTab = tabBtn.getAttribute('data-admin-tab');
        renderAdminDashboard();
      });
    });

    // Save, Download data.js, Cancel Unsaved Changes, Close & Logout
    const saveBtn = document.getElementById('adminSaveChangesBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveChangesToServer);

    const downloadBtn = document.getElementById('adminDownloadDataJsBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadDataJsFile);

    const cancelBtn = document.getElementById('adminCancelChangesBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (savedSnapshot) {
          window.OrpaPortfolioApp.setData(savedSnapshot, false);
          renderAdminDashboard();
          setStatusMessage('Reverted unsaved changes.', false);
        }
      });
    }

    const closeDashBtn = document.getElementById('closeAdminDashboardBtn');
    if (closeDashBtn) closeDashBtn.addEventListener('click', () => dashboardDrawer.classList.add('hidden'));

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await window.OrpaAuth.logout();
        updateAdminUIVisibility();
        dashboardDrawer.classList.add('hidden');
        window.showOrpaToast('Logged out of Admin session.');
      });
    }

    // Delete Confirmation Modal Buttons
    const confirmDelBtn = document.getElementById('confirmDeleteEntryBtn');
    const cancelDelBtn = document.getElementById('cancelDeleteEntryBtn');
    const delModal = document.getElementById('adminDeleteConfirmModal');
    if (confirmDelBtn) {
      confirmDelBtn.addEventListener('click', () => {
        if (typeof pendingDeleteCallback === 'function') pendingDeleteCallback();
        pendingDeleteCallback = null;
        if (delModal) delModal.classList.add('hidden');
      });
    }
    if (cancelDelBtn) {
      cancelDelBtn.addEventListener('click', () => {
        pendingDeleteCallback = null;
        if (delModal) delModal.classList.add('hidden');
      });
    }

    // Check existing session on startup
    await window.OrpaAuth.checkSession();
    updateAdminUIVisibility();
    if (window.location.hash === '#admin-login' || window.location.hash === '#admin') {
      openAdminEntry();
    }
  });
})();
