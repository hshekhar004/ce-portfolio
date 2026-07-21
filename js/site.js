'use strict';

const state = { content: null, sections: new Map() };
const DRAFT_KEY = 'hs_commercial_excellence_portfolio_v1_draft';
const PREVIEW_KEY = 'hs_commercial_excellence_portfolio_v1_owner_preview';
const DRAFT_DB = 'hs_commercial_excellence_portfolio_v1';
const byId = (id) => document.getElementById(id);
const attr = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

function text(node, value) {
  if (node) node.textContent = value ?? '';
}

function loadOwnerDraft() {
  return new Promise((resolve) => {
    if (!('indexedDB' in window)) {
      try { return resolve(JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null')); } catch (_error) { return resolve(null); }
    }
    const request = indexedDB.open(DRAFT_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const transaction = request.result.transaction('drafts', 'readonly');
      const get = transaction.objectStore('drafts').get('content');
      get.onsuccess = () => resolve(get.result || null);
      get.onerror = () => resolve(null);
    };
  });
}

function setTheme(theme) {
  const root = document.documentElement;
  const variables = {
    '--bg': theme.background,
    '--surface': theme.surface,
    '--text': theme.text,
    '--muted': theme.muted,
    '--accent': theme.accent,
    '--accent-2': theme.accentSecondary,
    '--border': theme.border,
    '--dark-section': theme.darkSectionBackground || theme.text,
    '--cursor-color': theme.cursorColor || theme.accent,
    '--heading-font': theme.headingFont,
    '--body-font': theme.bodyFont,
    '--base-size': `${Number(theme.baseFontSize) || 17}px`,
    '--content-width': `${Number(theme.contentWidth) || 1240}px`,
    '--radius': `${Number(theme.cornerRadius) || 18}px`
  };
  Object.entries(variables).forEach(([key, value]) => value && root.style.setProperty(key, value));
}

function sectionHead(section) {
  const head = document.createElement('div');
  head.className = 'section-head reveal';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = section.eyebrow;
  const wrap = document.createElement('div');
  wrap.className = 'section-title-wrap';
  const heading = document.createElement('h2');
  heading.textContent = section.title;
  const intro = document.createElement('p');
  intro.innerHTML = section.intro;
  wrap.append(heading, intro);
  head.append(eyebrow, wrap);
  return head;
}

function baseSection(id, extraClass = '') {
  const section = document.createElement('section');
  section.id = id;
  section.className = `portfolio-section ${extraClass}`.trim();
  section.dataset.section = id;
  section.appendChild(sectionHead(state.content.sections[id]));
  return section;
}

function renderImpact() {
  const section = baseSection('impact', 'section-dark');
  const grid = document.createElement('div');
  grid.className = 'metrics-grid';
  state.content.metrics.forEach((metric) => {
    const card = document.createElement('article');
    card.className = 'metric-card reveal';
    card.innerHTML = `
      <strong class="metric-value" data-value="${attr(metric.value)}">0</strong>
      <span class="metric-label">${metric.label}</span>
      <span class="metric-detail">${metric.detail}</span>`;
    grid.appendChild(card);
  });
  section.appendChild(grid);
  return section;
}

function renderExpertise() {
  const section = baseSection('expertise');
  const grid = document.createElement('div');
  grid.className = 'capability-grid';
  state.content.capabilities.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'capability-card reveal';
    card.innerHTML = `
      <span class="card-number">${item.number}</span>
      <h3>${item.title}</h3>
      <p>${item.description}</p>`;
    grid.appendChild(card);
  });
  const tags = document.createElement('div');
  tags.className = 'tag-cloud reveal';
  state.content.sectorTags.forEach((tag) => {
    const item = document.createElement('span');
    item.className = 'tag';
    item.textContent = tag;
    tags.appendChild(item);
  });
  section.append(tags, grid);
  return section;
}

function renderTrackRecord() {
  const section = baseSection('track-record');
  const list = document.createElement('div');
  list.className = 'stories';
  state.content.stories.forEach((story) => {
    const article = document.createElement('article');
    article.className = 'story reveal';
    article.innerHTML = `
      <span class="story-kicker">${story.kicker}</span>
      <div><h3>${story.title}</h3><p>${story.summary}</p></div>
      <strong class="story-result">${story.result}</strong>`;
    list.appendChild(article);
  });
  section.appendChild(list);
  return section;
}

function renderAccountSystem() {
  const section = baseSection('account-system', 'section-dark');
  const grid = document.createElement('div');
  const stepCount = state.content.accountSteps.length;
  const balancedColumns = stepCount <= 1 ? 1 : (stepCount === 2 || stepCount === 4 ? 2 : (stepCount === 3 || stepCount === 5 || stepCount === 6 ? 3 : Math.min(4, stepCount)));
  grid.className = 'steps-grid';
  grid.style.setProperty('--step-columns', balancedColumns);
  state.content.accountSteps.forEach((step) => {
    const card = document.createElement('article');
    card.className = 'step-card reveal';
    card.innerHTML = `<span class="card-number">${step.number}</span><h3>${step.title}</h3><p>${step.description}</p>`;
    grid.appendChild(card);
  });
  section.appendChild(grid);
  return section;
}


function renderCases() {
  const section = baseSection('cases', 'section-dark');
  const cases = (state.content.cases || []).filter((item) => item.visible);
  const list = document.createElement('div');
  list.className = 'case-grid';
  cases.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'consulting-case-card reveal';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.dataset.cursor = 'Read full work';
    card.setAttribute('aria-label', `Open case: ${item.title}`);
    card.innerHTML = `
      <div class="case-card-top"><span>${item.eyebrow || 'CONSULTING CASE'}</span><strong>${String(index + 1).padStart(2, '0')}</strong></div>
      <div class="case-card-body">
        <h3>${item.title}</h3>
        <p>${item.cardSummary || item.subtitle || ''}</p>
      </div>
      <div class="case-card-footer">
        <span class="case-open-label">Read full work <b>→</b></span>
        <div class="case-card-actions"></div>
      </div>`;
    const actions = card.querySelector('.case-card-actions');
    getCaseDocuments(item).forEach((doc) => actions.appendChild(caseDocumentLink(doc)));
    const open = () => openCaseDetail(item, index);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
    list.appendChild(card);
  });
  section.appendChild(list);
  return section;
}

function getCaseDocuments(item) {
  return (item.documents || []).filter((doc) => doc && (doc.url || doc.downloadUrl));
}

function caseDocumentLink(doc, extraClass = '') {
  const link = document.createElement('a');
  link.className = `case-link ${extraClass}`.trim();
  const href = doc.url || doc.downloadUrl;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.dataset.cursor = doc.cursorLabel || doc.label || 'Open document';
  link.innerHTML = `${doc.label || 'Open document'} <span>↗</span>`;
  link.addEventListener('click', (event) => event.stopPropagation());
  return link;
}

function caseDownloadLink(doc) {
  const link = document.createElement('a');
  link.className = 'case-download-link';
  const href = doc.downloadUrl || doc.url;
  link.href = href;
  link.download = doc.downloadFilename || '';
  link.dataset.cursor = `Download ${doc.shortLabel || doc.label || 'file'}`;
  link.innerHTML = `<span>Download</span><strong>${doc.shortLabel || doc.label || 'File'}</strong>`;
  return link;
}

function openCaseDetail(item, index = 0) {
  history.pushState({ caseIndex: index }, '', `#case-${index + 1}`);
  renderCasePage(item, index);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeCasePage(push = true) {
  renderSections();
  initObservers();
  if (push) history.pushState({}, '', '#cases');
  requestAnimationFrame(() => byId('cases')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

function renderCasePage(item, index = 0) {
  document.body.classList.add('case-page-open');
  const mount = byId('sectionMount');
  mount.replaceChildren();
  state.sections.clear();

  const page = document.createElement('section');
  page.className = 'case-page section-dark';
  page.id = `case-${index + 1}`;

  const docs = getCaseDocuments(item);
  const docActions = document.createElement('div');
  docActions.className = 'case-page-actions';
  docs.forEach((doc) => docActions.appendChild(caseDocumentLink(doc, 'case-page-link')));

  const downloads = document.createElement('div');
  downloads.className = 'case-downloads';
  docs.forEach((doc) => downloads.appendChild(caseDownloadLink(doc)));

  const hero = document.createElement('header');
  hero.className = 'case-page-hero reveal';

  const topBar = document.createElement('div');
  topBar.className = 'case-page-topbar';
  topBar.innerHTML = `<button class="case-back magnetic" type="button" data-cursor="Go back">← Back to portfolio</button>`;
  topBar.appendChild(docActions.cloneNode(true));
  hero.appendChild(topBar);

  const heading = document.createElement('div');
  heading.className = 'case-page-heading';
  heading.innerHTML = `
    <span class="case-page-eyebrow">${item.eyebrow || 'CONSULTING CASE'}</span>
    <h1>${item.title}</h1>
    <p>${item.subtitle || item.cardSummary || ''}</p>`;
  hero.appendChild(heading);
  page.appendChild(hero);

  const sections = item.detailSections?.length ? item.detailSections : [
    {title:'The challenge',body:item.challenge,media:[]},{title:'The approach',body:item.approach,media:[]},
    {title:'The insight',body:item.insight,media:[]},{title:'Business relevance',body:item.relevance,media:[]}
  ];
  sections.forEach((block, blockIndex) => {
    const section = document.createElement('section');
    section.className = 'case-page-section reveal';
    section.innerHTML = `<span>${String(blockIndex + 1).padStart(2,'0')}</span><div><h2>${block.title || ''}</h2><div class="case-rich-text">${block.body || ''}</div></div>`;
    const mediaGrid = document.createElement('div');
    mediaGrid.className = 'case-media-grid';
    (block.media || []).filter(m => m.url || m.downloadUrl).forEach((media) => {
      if (media.type === 'image') {
        const figure=document.createElement('figure'); figure.innerHTML=`<img src="${media.url || media.downloadUrl}" alt="${media.caption || block.title || 'Case image'}">${media.caption ? `<figcaption>${media.caption}</figcaption>`:''}`; mediaGrid.appendChild(figure);
      } else {
        mediaGrid.appendChild(caseDocumentLink(media, 'case-page-link'));
      }
    });
    if (mediaGrid.children.length) section.querySelector('div').appendChild(mediaGrid);
    page.appendChild(section);
  });

  const bottom = document.createElement('footer');
  bottom.className = 'case-page-bottom reveal';
  bottom.innerHTML = '<h2>Case documents</h2><p>Read the short summary first, then review the executive slides or complete thesis depending on the depth required.</p>';
  bottom.appendChild(docActions);
  bottom.appendChild(downloads);
  const backBottom = document.createElement('button');
  backBottom.type = 'button';
  backBottom.className = 'case-back case-back-bottom magnetic';
  backBottom.dataset.cursor = 'Go back';
  backBottom.textContent = '← Back to portfolio';
  bottom.appendChild(backBottom);
  page.appendChild(bottom);

  mount.appendChild(page);
  page.querySelectorAll('.case-back').forEach((button) => button.addEventListener('click', () => closeCasePage(true)));
  page.querySelectorAll('.case-page-actions .case-link, .case-download-link').forEach((node) => {
    if (!node.dataset.cursor) node.dataset.cursor = node.textContent.replace(/\s+/g, ' ').trim();
  });
  initObservers();
}

function renderSkills() {
  const section = baseSection('skills');
  const grid = document.createElement('div');
  grid.className = 'skills-grid';
  const groups = [
    { key: 'commercialSkills', label: 'Commercial skills', kicker: 'COMMERCIAL EXCELLENCE', className: 'skill-group-commercial', limit: 12 },
    { key: 'softSkills', label: 'Soft skills', kicker: 'HOW I WORK', className: '', limit: 20 },
    { key: 'softwareSkills', label: 'Software and tools', kicker: 'DIGITAL TOOLKIT', className: '', limit: 20 },
    { key: 'languageSkills', label: 'Languages', kicker: 'COMMUNICATION', className: 'skill-group-languages', limit: 20 }
  ];
  groups.forEach((group) => {
    const items = state.content[group.key] || [];
    const card = document.createElement('article');
    card.className = `skill-group reveal ${group.className}`.trim();
    const list = document.createElement('div');
    list.className = 'skill-pills';
    items.forEach((item, index) => {
      const pill = document.createElement('span');
      pill.className = 'skill-pill';
      pill.textContent = item;
      if (index >= group.limit) pill.hidden = true;
      list.appendChild(pill);
    });
    const heading = document.createElement('div');
    heading.className = 'skill-group-head';
    heading.innerHTML = `<div><span>${group.kicker}</span><h3>${group.label}</h3></div><strong>${items.length}</strong>`;
    card.append(heading, list);
    if (items.length > group.limit) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'skill-toggle magnetic';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.dataset.cursor = `Show all ${group.label.toLowerCase()}`;
      toggle.textContent = state.content.ui.skillsExpandLabel;
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        [...list.children].forEach((pill, index) => { if (index >= group.limit) pill.hidden = expanded; });
        toggle.textContent = expanded ? state.content.ui.skillsExpandLabel : state.content.ui.skillsCollapseLabel;
        toggle.dataset.cursor = expanded ? `Show all ${group.label.toLowerCase()}` : `Show fewer ${group.label.toLowerCase()}`;
      });
      card.appendChild(toggle);
    }
    grid.appendChild(card);
  });
  section.appendChild(grid);
  return section;
}

function renderExperience() {
  const section = baseSection('experience');
  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  state.content.experiences.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'experience-item reveal';
    const bullets = item.bullets.map((bullet) => `<li>${bullet}</li>`).join('');
    article.innerHTML = `
      <div class="experience-meta">
        <span class="dates">${item.dates}</span>
        <strong>${item.company}</strong>
        <span>${item.location}</span>
      </div>
      <div class="experience-body">
        <h3>${item.role}</h3>
        <p class="experience-summary">${item.summary}</p>
        <ul class="experience-bullets">${bullets}</ul>
      </div>`;
    timeline.appendChild(article);
  });
  section.appendChild(timeline);
  return section;
}

function renderEducation() {
  const section = baseSection('education');
  const grid = document.createElement('div');
  grid.className = 'education-grid';
  state.content.education.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'education-card reveal';
    card.innerHTML = `
      <span class="dates">${item.dates}</span>
      <h3>${item.degree}</h3>
      <span class="institution">${item.institution} · ${item.location}</span>
      <span class="result">${item.result}</span>
      <p class="description">${item.description}</p>
      ${item.subjects?.length ? `<div class="education-subjects"><strong>${state.content.ui.subjectsLabel}</strong><div>${item.subjects.map((subject) => `<span>${subject}</span>`).join('')}</div></div>` : ''}
      <ul class="education-details">${item.details.map((detail) => `<li>${detail}</li>`).join('')}</ul>`;
    const certificate = item.certificate;
    if (certificate && (certificate.url || certificate.downloadUrl)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button-light magnetic education-certificate';
      button.dataset.cursor = certificate.label || 'View degree certificate';
      button.textContent = certificate.label || 'View degree certificate';
      button.addEventListener('click', () => openDocument(certificate));
      card.appendChild(button);
    }
    grid.appendChild(card);
  });
  section.appendChild(grid);

  const thesis = state.content.thesis;
  if (thesis?.visible) {
    const thesisCard = document.createElement('article');
    thesisCard.className = 'thesis-card reveal';
    thesisCard.innerHTML = `
      <div class="thesis-heading">
        <div><span>${thesis.eyebrow}</span><h3>${thesis.title}</h3></div>
        <strong>THESIS</strong>
      </div>
      <p class="thesis-subtitle">${thesis.subtitle}</p>
      <div class="thesis-body"><p>${thesis.summary}</p><p>${thesis.valueStatement}</p></div>
      <div class="thesis-tags">${thesis.frameworkTags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      <div class="thesis-actions"></div>`;
    const actions = thesisCard.querySelector('.thesis-actions');
    [thesis.summaryDocument, thesis.fullDocument].forEach((documentItem) => {
      if (!documentItem || (!documentItem.url && !documentItem.downloadUrl)) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button-light magnetic';
      button.dataset.cursor = documentItem.label;
      button.textContent = documentItem.label;
      button.addEventListener('click', () => {
        if (documentItem === thesis.fullDocument) {
          window.location.href = documentItem.url || documentItem.downloadUrl;
          return;
        }
        openDocument(documentItem);
      });
      actions.appendChild(button);
    });
    if (!actions.children.length) actions.hidden = true;
    section.appendChild(thesisCard);
  }

  const gate = state.content.gateAchievement;
  if (gate?.visible) {
    const gateCard = document.createElement('article');
    gateCard.className = 'gate-card reveal';
    gateCard.innerHTML = `
      <div class="gate-copy">
        <span class="gate-eyebrow">${gate.eyebrow}</span>
        <h3>${gate.title}</h3>
        <p>${gate.description}</p>
        <div class="gate-tags">${gate.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      </div>
      <div class="gate-stat" aria-label="${attr(gate.stat)}, ${attr(gate.context)}">
        <strong>${gate.stat}</strong><span>${gate.context}</span>
      </div>`;
    section.appendChild(gateCard);
  }
  return section;
}

function openDocument(documentItem) {
  text(byId('documentTitle'), documentItem.label);
  const stage = byId('documentStage');
  stage.replaceChildren();
  const viewerUrl = documentItem.url || documentItem.downloadUrl || '';
  if (documentItem.type === 'pdf') {
    const frame = document.createElement('iframe');
    frame.src = `${viewerUrl}#toolbar=0&navpanes=0`;
    frame.title = documentItem.label;
    stage.appendChild(frame);
  } else if (documentItem.type === 'pptx') {
    if (/^https?:/i.test(viewerUrl)) {
      const frame = document.createElement('iframe');
      frame.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewerUrl)}`;
      frame.title = documentItem.label;
      stage.appendChild(frame);
    } else {
      const notice = document.createElement('div');
      notice.className = 'pptx-notice';
      notice.innerHTML = `<strong>${documentItem.label}</strong><p>PowerPoint files cannot be previewed directly by every browser. Use the download button above to open the presentation in PowerPoint or a compatible application.</p>`;
      stage.appendChild(notice);
    }
  } else {
    const image = document.createElement('img');
    image.src = viewerUrl;
    image.alt = documentItem.label;
    stage.appendChild(image);
  }
  const download = byId('documentDownload');
  const downloadUrl = documentItem.downloadUrl || (['pdf', 'pptx'].includes(documentItem.type) ? viewerUrl : '');
  download.hidden = !downloadUrl;
  if (downloadUrl) {
    download.href = downloadUrl;
    download.download = documentItem.downloadFilename || '';
    download.dataset.cursor = state.content.ui.cursorDownload;
  }
  byId('documentModal').showModal();
  document.body.classList.add('modal-open');
}

function renderAbout() {
  const data = state.content.about;
  const section = document.createElement('section');
  section.id = 'about';
  section.className = 'portfolio-section about-section';
  section.dataset.section = 'about';
  const visual = data.photo
    ? `<img src="${attr(data.photo)}" alt="${attr(data.photoAlt)}">`
    : `<div class="about-placeholder" aria-label="Profile photo placeholder"><span>${state.content.brand.initials}</span></div>`;
  const paragraphs = String(data.body || '').split(/\n\s*\n/).filter(Boolean).map((paragraph) => `<p>${paragraph}</p>`).join('');
  section.innerHTML = `
    <div class="about-grid">
      <div class="about-copy reveal">
        <span class="about-eyebrow">${data.eyebrow}</span>
        <h2>${data.title}</h2>
        <div class="about-body">${paragraphs}</div>
      </div>
      <div class="about-photo reveal">${visual}</div>
    </div>`;
  return section;
}

function renderCredentials() {
  const section = baseSection('credentials');
  const layout = document.createElement('div');
  layout.className = 'credential-layout';
  const documentList = document.createElement('div');
  documentList.className = 'credential-list reveal';
  state.content.documents.filter((item) => item.visible && item.url).forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'credential-button magnetic';
    button.dataset.cursor = state.content.ui.cursorOpen;
    button.innerHTML = `<div><strong>${item.label}</strong><span>${item.description}</span></div><i>↗</i>`;
    button.addEventListener('click', () => openDocument(item));
    documentList.appendChild(button);
  });
  const achievementList = document.createElement('div');
  achievementList.className = 'achievement-list reveal';
  state.content.achievements.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'achievement-item';
    row.innerHTML = item;
    achievementList.appendChild(row);
  });
  layout.append(documentList, achievementList);
  section.appendChild(layout);
  if (state.content.credentialNote) {
    const note = document.createElement('p');
    note.className = 'credential-note reveal';
    note.textContent = state.content.credentialNote;
    section.appendChild(note);
  }
  return section;
}

function renderContact() {
  const section = baseSection('contact', 'section-dark contact-section');
  section.querySelector('.section-head')?.remove();
  const content = state.content.sections.contact;
  const contact = state.content.contact;
  const grid = document.createElement('div');
  grid.className = 'contact-grid';
  const copy = document.createElement('div');
  copy.className = 'reveal';
  copy.innerHTML = `<p class="eyebrow">${content.eyebrow}</p><h2 class="contact-title">${content.title}</h2><p class="contact-intro">${content.intro}</p>`;
  const links = document.createElement('div');
  links.className = 'contact-links reveal';
  links.innerHTML = `
    <a class="contact-link magnetic" href="mailto:${attr(contact.email)}" data-cursor="${attr(state.content.ui.cursorEmail)}"><span>${state.content.ui.contactEmailLabel}</span>${contact.email}</a>
    <a class="contact-link magnetic" href="tel:${attr(contact.phoneHref)}" data-cursor="${attr(state.content.ui.cursorCall)}"><span>${state.content.ui.contactPhoneLabel}</span>${contact.phone}</a>
    <a class="contact-link magnetic" href="${attr(contact.linkedinUrl)}" target="_blank" rel="noopener noreferrer" data-cursor="${attr(state.content.ui.cursorLinkedin)}"><span>${state.content.ui.contactLinkedinLabel}</span>${state.content.ui.viewProfileLabel}</a>
    <div class="contact-link"><span>${state.content.ui.contactLocationLabel}</span>${contact.location}</div>
    <div class="contact-link"><span>${state.content.ui.contactStatusLabel}</span>${contact.availability}</div>`;
  grid.append(copy, links);
  section.appendChild(grid);
  return section;
}

const renderers = {
  impact: renderImpact,
  cases: renderCases,
  expertise: renderExpertise,
  'track-record': renderTrackRecord,
  'account-system': renderAccountSystem,
  skills: renderSkills,
  experience: renderExperience,
  education: renderEducation,
  credentials: renderCredentials,
  about: renderAbout,
  contact: renderContact
};

function renderHero() {
  const { brand } = state.content;
  text(byId('brandInitials'), brand.initials);
  text(byId('heroEyebrow'), brand.eyebrow);
  text(byId('heroHeadline'), brand.headline);
  text(byId('heroSubheadline'), brand.subheadline);
  text(byId('primaryButton'), brand.primaryButton);
  text(byId('resumeButton'), brand.secondaryButton);
  text(byId('loadingText'), state.content.ui.loadingText);
  text(byId('headerCta'), state.content.ui.headerButton);
  text(byId('scrollLabel'), state.content.ui.scrollLabel);
  text(byId('credentialViewerLabel'), state.content.ui.credentialViewerLabel);
  document.querySelector('.brand-mark').dataset.cursor = state.content.ui.cursorHome;
  byId('headerCta').dataset.cursor = state.content.ui.cursorContact;
  byId('primaryButton').dataset.cursor = state.content.ui.cursorImpact;
  byId('resumeButton').dataset.cursor = state.content.ui.cursorResume;
  document.querySelector('.scroll-cue').dataset.cursor = state.content.ui.cursorScroll;
  text(byId('downloadLabel'), state.content.ui.downloadLabel);
  document.title = state.content.meta.siteTitle;
  document.querySelector('meta[name="description"]').content = state.content.meta.description;
}

function renderNavigation() {
  for (const nav of [byId('desktopNav'), byId('mobileNav')]) {
    nav.replaceChildren();
    state.content.navigation.forEach((item) => {
      const section = state.content.sections[item.target];
      if (section && section.visible === false) return;
      const link = document.createElement('a');
      link.href = `#${item.target}`;
      link.textContent = item.label;
      link.dataset.cursor = `View ${item.label}`;
      link.addEventListener('click', closeMobileNav);
      nav.appendChild(link);
    });
  }
}

function renderSections() {
  document.body.classList.remove('case-page-open');
  const mount = byId('sectionMount');
  mount.replaceChildren();
  state.sections.clear();
  state.content.sectionOrder.forEach((id) => {
    const settings = state.content.sections[id];
    if (!settings || settings.visible === false || !renderers[id]) return;
    const section = renderers[id]();
    mount.appendChild(section);
    state.sections.set(id, section);
  });
}

function closeMobileNav() {
  byId('mobileNav').classList.remove('open');
  byId('menuToggle').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}

function initInteractions() {
  const menuButton = byId('menuToggle');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    byId('mobileNav').classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
  });
  byId('resumeButton').addEventListener('click', () => {
    const resume = state.content.documents.find((item) => item.visible && (item.url || item.downloadUrl));
    if (resume) openDocument(resume);
  });
  const closeModal = () => {
    byId('documentModal').close();
    document.body.classList.remove('modal-open');
  };
  byId('modalClose').addEventListener('click', closeModal);
  const closeCaseModal = () => { byId('caseModal').close(); document.body.classList.remove('modal-open'); };
  byId('caseModalClose').addEventListener('click', closeCaseModal);
  byId('caseModal').addEventListener('click', (event) => { if (event.target === byId('caseModal')) closeCaseModal(); });
  byId('documentModal').addEventListener('click', (event) => {
    if (event.target === byId('documentModal')) closeModal();
  });
  window.addEventListener('scroll', () => byId('siteHeader').classList.toggle('scrolled', window.scrollY > 20), { passive: true });
}

function animateMetric(node) {
  if (node.dataset.animated) return;
  node.dataset.animated = 'true';
  const target = node.dataset.value;
  const match = target.match(/^(.*?)([\d,.]+)(.*)$/);
  if (!match) { node.textContent = target; return; }
  const [, prefix, numeric, suffix] = match;
  const end = Number(numeric.replace(/,/g, ''));
  const decimals = (numeric.split('.')[1] || '').length;
  const started = performance.now();
  const duration = 1250;
  const tick = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    const value = end * eased;
    const displayed = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US');
    node.textContent = `${prefix}${displayed}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initObservers() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      entry.target.querySelectorAll?.('.metric-value').forEach(animateMetric);
      if (entry.target.classList.contains('metric-card')) animateMetric(entry.target.querySelector('.metric-value'));
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
    revealObserver.observe(node);
  });

  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: .2, rootMargin: '-30% 0px -55%' });
  state.sections.forEach((section) => sectionObserver.observe(section));
}

function initCursor() {
  const cursor = byId('customCursor');
  const label = cursor.querySelector('span');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('mousemove', (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      const clickable = event.target.closest('a, button, [role="button"], .consulting-case-card');
      cursor.classList.toggle('is-link', Boolean(clickable));
      document.body.classList.toggle('cursor-over-link', Boolean(clickable));
      const visibleLabel = clickable?.textContent?.replace(/\s+/g, ' ').trim();
      label.textContent = clickable?.dataset.cursor || (visibleLabel ? `Open ${visibleLabel}` : 'Open');
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-link');
      document.body.classList.remove('cursor-over-link');
    });
  }
  window.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    const ripple = byId('touchRipple');
    ripple.style.left = `${event.clientX}px`; ripple.style.top = `${event.clientY}px`;
    ripple.classList.remove('play'); void ripple.offsetWidth; ripple.classList.add('play');
  }, { passive: true });
}

function renderFooter() {
  text(byId('footerCopyright'), state.content.footer.copyright);
  text(byId('footerNote'), state.content.footer.note);
  text(byId('ownerLogin'), state.content.footer.ownerLoginLabel);
}


function mergeCaseDocuments(defaultDocs = [], draftDocs = []) {
  return defaultDocs.map((base, index) => ({ ...base, ...(draftDocs[index] || {}) }));
}

function normalizeContent(content, published) {
  const next = structuredClone(content || published);

  // Preserve owner edits while ensuring newly added published metrics are not lost
  // when an older Owner Studio preview is still stored in this browser.
  const publishedMetrics = published.metrics || [];
  const currentMetrics = next.metrics || [];
  if (currentMetrics.length < publishedMetrics.length) {
    const existingLabels = new Set(currentMetrics.map((item) => item.label));
    next.metrics = currentMetrics.concat(
      publishedMetrics.filter((item) => !existingLabels.has(item.label))
    ).slice(0, publishedMetrics.length);
  }

  // Upgrade older case drafts with the new card summary and document links.
  next.cases = (next.cases || []).map((item, index) => {
    const base = (published.cases || [])[index] || {};
    return {
      ...base,
      ...item,
      cardSummary: item.cardSummary || base.cardSummary || item.subtitle || '',
      documents: mergeCaseDocuments(base.documents || [], item.documents || [])
    };
  });
  return next;
}

async function boot() {
  try {
    const published = await (window.SITE_CONTENT_READY || Promise.resolve(window.SITE_CONTENT));
    if (!published) throw new Error('Could not load content.');
    state.content = structuredClone(published);
    const previewUntil = Number(localStorage.getItem(PREVIEW_KEY) || 0);
    if (previewUntil > Date.now()) {
      const draft = await loadOwnerDraft();
      if (draft) state.content = normalizeContent(draft, published);
    }
    state.content = normalizeContent(state.content, published);
    setTheme(state.content.theme);
    renderHero();
    renderNavigation();
    renderSections();
    renderFooter();
    initInteractions();
    initObservers();
    initCursor();
    const initialCase = location.hash.match(/^#case-(\d+)$/);
    if (initialCase) {
      const idx = Math.max(0, Number(initialCase[1]) - 1);
      const item = (state.content.cases || []).filter((caseItem) => caseItem.visible)[idx];
      if (item) renderCasePage(item, idx);
    }
    window.addEventListener('popstate', () => {
      const match = location.hash.match(/^#case-(\d+)$/);
      if (match) {
        const idx = Math.max(0, Number(match[1]) - 1);
        const item = (state.content.cases || []).filter((caseItem) => caseItem.visible)[idx];
        if (item) renderCasePage(item, idx);
      } else {
        renderSections();
        initObservers();
      }
    });
  } catch (error) {
    byId('loadingScreen').innerHTML = `<div class="loading-mark">!</div><span>${error.message}</span>`;
    return;
  }
  requestAnimationFrame(() => setTimeout(() => byId('loadingScreen').classList.add('is-hidden'), 250));
}

boot();
