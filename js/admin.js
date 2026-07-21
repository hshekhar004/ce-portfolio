'use strict';

const state = { content: null, dirty: false, activePanel: 'identity' };
const DRAFT_KEY = 'hs_commercial_excellence_portfolio_v1_draft';
const PREVIEW_KEY = 'hs_commercial_excellence_portfolio_v1_owner_preview';
const DRAFT_DB = 'hs_commercial_excellence_portfolio_v1';
const PREVIEW_DURATION = 8 * 60 * 60 * 1000;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const byId = (id) => document.getElementById(id);

const palettes = {
  background: [
    '#FFFFFF','#FDFCFA','#FAF9F6','#F8F7F4','#F7F7F5','#F6F5F2','#F5F3EF','#F4F1EA','#F3F0E8','#F2EFEA',
    '#F1EEE7','#F0EDE6','#EFECE5','#EEEAE2','#ECE8DF','#FBFAF8','#F9F8F5','#F7F4EE','#F5F1E8','#F3EEE4',
    '#F8FAFC','#F5F7FA','#F2F5F8','#EFF3F6','#ECF1F4','#F7F9FB','#F4F8F8','#F1F6F5','#EEF4F2','#EBF2EF',
    '#F5F7FF','#F2F5FF','#EEF3FF','#F7F5FF','#F4F1FF','#FFF9F4','#FFF7EF','#FFF4E8','#FFF8F6','#FFF4F1',
    '#F6FAF6','#F2F8F3','#EFF6F2','#FFFDF2','#FFFBEA','#0A0A0A','#111111','#171717','#1F2328','#20252B'
  ],
  text: [
    '#000000','#080808','#0A0A0A','#101010','#151515','#1A1A1A','#202020','#262626','#2C2C2C','#333333',
    '#3A3A3A','#414141','#484848','#505050','#585858','#0B132B','#101828','#14213D','#172B4D','#1D3557',
    '#102A43','#243B53','#27364B','#263238','#263D42','#12372A','#173B2C','#1B4332','#264D3B','#3B2F2F',
    '#4A1D2C','#581C2D','#4C1D1D','#3D1A5A','#2E1A47','#2D1B69','#1E1B4B','#312E81','#1E3A5F','#17324D',
    '#FFFFFF','#FCFCFC','#F8F8F8','#F4F4F4','#EEEEEE','#E8E8E8','#E2E8F0','#E5E7EB','#F1F5F9','#FAFAF9'
  ],
  muted: [
    '#4B4B4B','#555555','#5F5F5F','#666666','#6B6B6B','#737373','#7A7A7A','#828282','#898989','#919191',
    '#999999','#A1A1A1','#A8A8A8','#B0B0B0','#B8B8B8','#64748B','#6B7280','#71717A','#78716C','#697386',
    '#667085','#5F6B7A','#6C7889','#758195','#7B8794','#607D8B','#6A7B83','#718096','#7A869A','#7C8798',
    '#5E6F64','#687A6D','#728477','#7D8E82','#87988C','#786E68','#827872','#8D827B','#988D85','#A39890',
    '#6D6375','#786D80','#83788B','#8E8396','#998EA1','#5F7188','#6A7D94','#7589A0','#8195AC','#8CA1B8'
  ],
  accent: [
    '#FF4D00','#FF3D00','#FF5C00','#FF6A00','#FF7A00','#F23800','#E63E00','#D93600','#FF1744','#F0003C',
    '#E40046','#D50000','#FF006E','#E60063','#D0005F','#0068FF','#0057FF','#0047D9','#007AFF','#008CFF',
    '#00A3FF','#00B8D9','#00A7C4','#00A896','#00BFA6','#00B86B','#00A63E','#15B84A','#2DBE60','#55C200',
    '#FFD400','#FFC400','#FFB000','#FFA000','#FF9500','#8B5CF6','#7C3AED','#6D28D9','#5B2BE0','#4F46E5',
    '#A855F7','#C026D3','#D946EF','#E600A9','#F5008F','#00C2FF','#00D4C7','#00E09D','#C7F000','#E6FF00'
  ],
  softAccent: [
    '#FFE5D9','#FFDCCB','#FFD2BD','#FFC9AF','#FFBE9F','#FFD9D9','#FFCCCC','#F7C4C4','#F2B8B8','#E8ADAD',
    '#FFE0EA','#FFD1E1','#F7C6D8','#EFB7CE','#E6A9C2','#E8E0FF','#DDD2FF','#D3C4FA','#C8B6F2','#BDA9EA',
    '#DCE8FF','#CEDFFF','#BED5FF','#AEC9F5','#9CBCEB','#D9F0FF','#C9E9FA','#B8E1F2','#A8D8E8','#97CDD9',
    '#D8F5EF','#C9EDE5','#B9E5DA','#A9DCCF','#98D2C3','#E4F4D7','#D6ECC6','#C7E3B5','#B8D9A4','#A8CF93',
    '#FFF3C4','#FFEBAD','#FFE397','#FFDA80','#FFD169','#F3E7D3','#EADCC5','#E1D1B7','#D7C5A8','#CDB99A'
  ],
  dark: [
    '#000000','#080808','#0A0A0A','#111111','#171717','#1C1C1C','#202020','#252525','#2A2A2A','#303030',
    '#001F3F','#002B5B','#003366','#062A4D','#0A2540','#0B1F33','#0B132B','#101828','#111C2E','#14213D',
    '#172B4D','#1E2A3A','#1E293B','#243447','#27364B','#0F172A','#172033','#1B263B','#203047','#243B53',
    '#102A43','#12344D','#153A52','#17324D','#1E3A5F','#062E33','#0B3031','#0D3B3E','#12372A','#173B2C',
    '#1B4332','#203A43','#263D42','#2A3D45','#2F4858','#2D1B3D','#34213F','#3D1A5A','#3B2F2F','#4A1D2C'
  ]
};

palettes.cursor = [...palettes.accent, ...palettes.softAccent, ...palettes.dark];
palettes.text = [...palettes.text, ...palettes.dark];

const fontOptions = [
  "'Inter', 'Helvetica Neue', Arial, sans-serif",
  "'Manrope', 'Helvetica Neue', Arial, sans-serif",
  "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
  "'IBM Plex Sans', Arial, sans-serif",
  "'Source Sans 3', Arial, sans-serif",
  "'Work Sans', Arial, sans-serif",
  "'Montserrat', Arial, sans-serif",
  "'Open Sans', Arial, sans-serif",
  "'Roboto', Arial, sans-serif",
  "'Noto Sans', Arial, sans-serif",
  "'Helvetica Neue', Helvetica, Arial, sans-serif",
  "Avenir Next, Avenir, Arial, sans-serif"
];

const panelLabels = {
  identity: 'Identity', theme: 'Design system', sections: 'Section order', metrics: 'Impact metrics',
  capabilities: 'Expertise', stories: 'Track record', cases: 'Case portfolio', process: 'Consulting approach', skills: 'Skills', experience: 'Experience',
  education: 'Education', credentials: 'Credentials', about: 'About + photo', contact: 'Contact + footer', advanced: 'Advanced'
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function getPath(path) {
  return path.split('.').reduce((value, key) => value?.[key], state.content);
}

function setPath(path, value) {
  const parts = path.split('.');
  let target = state.content;
  parts.slice(0, -1).forEach((key) => { target = target[key]; });
  target[parts.at(-1)] = value;
  markDirty();
}

function openDraftDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return resolve(null);
    const request = indexedDB.open(DRAFT_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function persistDraft() {
  const snapshot = structuredClone(state.content);
  const database = await openDraftDatabase();
  if (!database) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(snapshot));
    return;
  }
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('drafts', 'readwrite');
    transaction.objectStore('drafts').put(snapshot, 'content');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

async function loadDraft() {
  const database = await openDraftDatabase();
  if (!database) {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (_error) { return null; }
  }
  return new Promise((resolve) => {
    const transaction = database.transaction('drafts', 'readonly');
    const request = transaction.objectStore('drafts').get('content');
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

function queueDraftSave() {
  clearTimeout(queueDraftSave.timer);
  queueDraftSave.timer = setTimeout(() => persistDraft().catch(() => {
    byId('saveStatus').textContent = 'Draft storage needs attention';
  }), 450);
}

function markDirty() {
  state.dirty = true;
  byId('saveStatus').textContent = 'Unsaved changes';
  queueDraftSave();
}

function toast(message, error = false) {
  const node = byId('toast');
  node.textContent = message;
  node.classList.toggle('error', error);
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 2800);
}

function showLogin(reset = false) {
  byId('authShell').classList.remove('hidden');
  byId('studio').classList.add('hidden');
  byId('loginCard').classList.toggle('hidden', reset);
  byId('resetCard').classList.toggle('hidden', !reset);
}

function panelHeading(overline, title, description) {
  return `<div class="panel-heading"><p class="overline">${escapeHtml(overline)}</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div>`;
}

function field(path, label, type = 'text', options = {}) {
  const value = getPath(path) ?? '';
  const classes = options.wide ? 'wide' : '';
  if (type === 'textarea') {
    return `<label class="${classes}">${escapeHtml(label)}<textarea data-path="${escapeHtml(path)}" maxlength="${options.max || 10000}">${escapeHtml(value)}</textarea></label>`;
  }
  if (type === 'number') {
    return `<label class="${classes}">${escapeHtml(label)}<input data-path="${escapeHtml(path)}" type="number" min="${options.min ?? 0}" max="${options.max ?? 5000}" step="${options.step ?? 1}" value="${escapeHtml(value)}"></label>`;
  }
  if (type === 'select') {
    return `<label class="${classes}">${escapeHtml(label)}<select data-path="${escapeHtml(path)}">${options.items.map((item) => `<option value="${escapeHtml(item)}" ${item === value ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></label>`;
  }
  if (type === 'url') {
    return `<label class="${classes}">${escapeHtml(label)}<input data-path="${escapeHtml(path)}" type="url" value="${escapeHtml(value)}" maxlength="2000"></label>`;
  }
  return `<label class="${classes}">${escapeHtml(label)}<input data-path="${escapeHtml(path)}" type="text" value="${escapeHtml(value)}" maxlength="${options.max || 1000}"></label>`;
}

function richField(path, label) {
  return `<div class="rich-field wide">
    <label>${escapeHtml(label)}</label>
    <div class="rich-toolbar" data-editor-path="${escapeHtml(path)}">
      <button type="button" data-command="bold" title="Bold"><b>B</b></button>
      <button type="button" data-command="italic" title="Italic"><i>I</i></button>
      <button type="button" data-command="underline" title="Underline"><u>U</u></button>
      <select data-rich-command="fontName" title="Font style"><option value="Arial">Arial</option><option value="Helvetica">Helvetica</option><option value="Georgia">Georgia</option><option value="Times New Roman">Times</option><option value="monospace">Mono</option></select>
      <select data-rich-command="fontSize" title="Text size"><option value="2">Small</option><option value="3" selected>Normal</option><option value="4">Large</option><option value="5">XL</option><option value="6">XXL</option></select>
      <label title="Text colour">A<input type="color" data-rich-command="foreColor" value="#080808"></label>
      <label title="Highlight colour">HL<input type="color" data-rich-command="hiliteColor" value="#FFE55C"></label>
      <button type="button" data-command="createLink" title="Add link">Link</button>
      <button type="button" data-command="removeFormat" title="Remove formatting">Clear</button>
    </div>
    <div class="rich-editor" contenteditable="true" data-rich-path="${escapeHtml(path)}">${getPath(path) ?? ''}</div>
  </div>`;
}

function uploadField(path, label, accept = 'image/*,application/pdf', mirrorPath = '') {
  const value = getPath(path) || '';
  const isImage = /^data:image\//i.test(value) || /\.(?:jpe?g|png|webp|gif)(?:[?#].*)?$/i.test(value);
  const preview = isImage ? `<img class="upload-preview" src="${escapeHtml(value)}" alt="Current upload">` : '';
  return `<div class="upload-box wide">
    <div><label>${escapeHtml(label)}<input type="file" accept="${escapeHtml(accept)}" data-upload-path="${escapeHtml(path)}" ${mirrorPath ? `data-upload-mirror="${escapeHtml(mirrorPath)}"` : ''}></label>${preview}<small>${escapeHtml(value || 'No file uploaded')}</small></div>
    <button class="secondary-button" type="button" data-clear-upload="${escapeHtml(path)}" ${mirrorPath ? `data-clear-mirror="${escapeHtml(mirrorPath)}"` : ''}>Clear</button>
  </div>`;
}

function cardActions(collection, index) {
  return `<div class="card-actions">
    <button class="icon-button" type="button" data-action="up" data-collection="${collection}" data-index="${index}" title="Move up">↑</button>
    <button class="icon-button" type="button" data-action="down" data-collection="${collection}" data-index="${index}" title="Move down">↓</button>
    <button class="danger-button" type="button" data-action="delete" data-collection="${collection}" data-index="${index}">Delete</button>
  </div>`;
}

function collectionLimit(key) {
  return ({ commercialSkills: 300, softSkills: 200, softwareSkills: 100, languageSkills: 10, subjects: 100, experiences: 50, bullets: 50, cases: 75, detailSections: 50, media: 10 })[key] || 50;
}

function collectionHeader(label, key, singular) {
  const count = getPath(key).length;
  const limit = collectionLimit(key);
  return `<div class="collection-tools"><strong>${escapeHtml(label)} <small>${count}/${limit}</small></strong><button class="add-button" type="button" data-add="${key}" ${count >= limit ? 'disabled' : ''}>Add ${escapeHtml(singular)}</button></div>`;
}

function renderSimpleCollection(panel, config) {
  const items = getPath(config.key);
  let html = panelHeading(config.overline, config.title, config.description) + collectionHeader(config.label, config.key, config.singular);
  items.forEach((item, index) => {
    const titleValue = item[config.titleKey] || `${config.singular} ${index + 1}`;
    html += `<article class="editor-card"><div class="editor-card-head"><h3>${escapeHtml(titleValue)}</h3>${cardActions(config.key, index)}</div><div class="field-grid">`;
    config.fields.forEach((definition) => {
      const path = `${config.key}.${index}.${definition.key}`;
      if (definition.type === 'rich') html += richField(path, definition.label);
      else if (definition.type === 'upload') html += uploadField(path, definition.label, definition.accept);
      else html += field(path, definition.label, definition.type, definition);
    });
    html += '</div></article>';
  });
  panel.innerHTML = html;
}

function renderCapabilities() {
  const panel = byId('panel-capabilities');
  renderSimpleCollection(panel, configs.capabilities);
  panel.insertAdjacentHTML('beforeend', collectionHeader('Sector and product tags', 'sectorTags', 'tag') + state.content.sectorTags.map((item, index) => `<article class="editor-card"><div class="editor-card-head"><h3>${escapeHtml(item)}</h3>${cardActions('sectorTags', index)}</div><div class="field-grid">${field(`sectorTags.${index}`, 'Tag')}</div></article>`).join(''));
}

function renderIdentity() {
  const panel = byId('panel-identity');
  panel.innerHTML = panelHeading('01 · IDENTITY', 'Your public positioning.', 'Edit every word in the browser title, navigation, impact-first hero, role statement, and interface language.') + `
    <article class="editor-card"><div class="editor-card-head"><h3>Search and browser information</h3></div><div class="field-grid">
      ${field('meta.siteTitle', 'Browser title', 'text', { wide: true })}
      ${field('meta.description', 'Search description', 'textarea', { wide: true })}
    </div></article>
    <article class="editor-card"><div class="editor-card-head"><h3>Brand and hero</h3></div><div class="field-grid">
      ${field('brand.initials', 'Logo initials')}
      ${field('brand.name', 'Name')}
      ${field('brand.role', 'Professional role', 'text', { wide: true })}
      ${field('brand.eyebrow', 'Hero eyebrow', 'text', { wide: true })}
      ${field('brand.headline', 'Main headline', 'textarea', { wide: true })}
      ${field('brand.subheadline', 'Supporting statement', 'textarea', { wide: true })}
      ${field('brand.primaryButton', 'Primary button label')}
      ${field('brand.secondaryButton', 'Résumé button label')}
    </div></article>
    <article class="editor-card"><div class="editor-card-head"><h3>Interface labels and cursor language</h3></div><div class="field-grid">
      ${field('ui.loadingText', 'Loading message', 'text', { wide: true })}
      ${field('ui.headerButton', 'Header button')}${field('ui.scrollLabel', 'Scroll label')}
      ${field('ui.credentialViewerLabel', 'Document viewer label', 'text', { wide: true })}
      ${field('ui.cursorHome', 'Cursor: home')}${field('ui.cursorContact', 'Cursor: contact')}
      ${field('ui.cursorImpact', 'Cursor: impact')}${field('ui.cursorResume', 'Cursor: résumé')}
      ${field('ui.cursorScroll', 'Cursor: scroll')}${field('ui.cursorOpen', 'Cursor: open')}
      ${field('ui.cursorExplore', 'Cursor: explore')}${field('ui.cursorProof', 'Cursor: proof')}
      ${field('ui.cursorDownload', 'Cursor: download')}${field('ui.downloadLabel', 'Download label')}
      ${field('ui.subjectsLabel', 'Education subjects label')}${field('ui.skillsExpandLabel', 'Expand-skills label')}
      ${field('ui.skillsCollapseLabel', 'Collapse-skills label', 'text', { wide: true })}
    </div></article>
    ${collectionHeader('Navigation links', 'navigation', 'link')}
    ${state.content.navigation.map((item, index) => `<article class="editor-card"><div class="editor-card-head"><h3>${escapeHtml(item.label || `Link ${index + 1}`)}</h3>${cardActions('navigation', index)}</div><div class="field-grid">${field(`navigation.${index}.label`, 'Label')}${field(`navigation.${index}.target`, 'Section ID')}</div></article>`).join('')}`;
}

function colorGroup(key, label) {
  const value = state.content.theme[key];
  const category = key === 'cursorColor' ? 'cursor' : key === 'darkSectionBackground' ? 'dark' : ['background', 'surface'].includes(key) ? 'background' : ['accent', 'accentSecondary'].includes(key) ? 'accent' : ['muted', 'border'].includes(key) ? 'muted' : 'text';
  const colors = palettes[category];
  return `<div class="palette-group"><div class="palette-label"><span>${escapeHtml(label)}</span><input type="color" data-path="theme.${key}" value="${escapeHtml(value)}"></div><div class="swatches swatches-${category}" data-color-path="theme.${key}">${colors.map((color, index) => `<button type="button" class="swatch swatch-${index + 1} ${color.toLowerCase() === String(value).toLowerCase() ? 'active' : ''}" data-color="${color}" aria-label="Set ${label} to ${color}"></button>`).join('')}</div></div>`;
}

function renderTheme() {
  const panel = byId('panel-theme');
  panel.innerHTML = panelHeading('02 · DESIGN SYSTEM', 'Quiet foundations. Energetic emphasis.', 'Each control now has 50 colours selected specifically for its role: background-safe neutrals, readable text, muted support tones, or energetic highlights.') + `
    <div class="notice">The default uses a soft off-white background, near-black text, and restrained orange and blue accents. Every palette remains fully editable.</div>
    <article class="editor-card">
      ${colorGroup('background', 'Page background')}
      ${colorGroup('surface', 'Card background')}
      ${colorGroup('text', 'Primary text')}
      ${colorGroup('muted', 'Secondary text')}
      ${colorGroup('accent', 'Primary highlight')}
      ${colorGroup('accentSecondary', 'Secondary highlight')}
      ${colorGroup('border', 'Borders')}
      ${colorGroup('darkSectionBackground', 'Dark impact-section background')}
      ${colorGroup('cursorColor', 'Cursor circle · 150 options')}
    </article>
    <article class="editor-card"><div class="editor-card-head"><h3>Typography and layout</h3></div><div class="field-grid">
      ${field('theme.headingFont', 'Heading font', 'select', { items: fontOptions, wide: true })}
      ${field('theme.bodyFont', 'Body font', 'select', { items: fontOptions, wide: true })}
      ${field('theme.baseFontSize', 'Base font size in pixels', 'number', { min: 13, max: 24 })}
      ${field('theme.contentWidth', 'Maximum content width in pixels', 'number', { min: 900, max: 1800 })}
      ${field('theme.cornerRadius', 'Corner radius in pixels', 'number', { min: 0, max: 60 })}
    </div></article>`;
}

function renderSections() {
  const panel = byId('panel-sections');
  let html = panelHeading('03 · PAGE ARCHITECTURE', 'Move, rename, show, or hide every section.', 'The homepage follows this exact order. Critical proof remains high on the page while deeper evidence follows naturally.');
  state.content.sectionOrder.forEach((id, index) => {
    const section = state.content.sections[id];
    html += `<article class="editor-card"><div class="section-row">
      <span class="drag-index">${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(section.title)}</strong>
      <label class="visibility"><input type="checkbox" data-visible-section="${escapeHtml(id)}" ${section.visible ? 'checked' : ''}> Visible</label>
      <button class="icon-button section-move-up" type="button" data-section-action="up" data-section-id="${escapeHtml(id)}">↑</button>
      <button class="icon-button section-move-down" type="button" data-section-action="down" data-section-id="${escapeHtml(id)}">↓</button>
    </div><div class="field-grid">
      ${field(`sections.${id}.eyebrow`, 'Eyebrow')}
      ${field(`sections.${id}.title`, 'Title', 'text', { wide: true })}
      ${field(`sections.${id}.intro`, 'Introduction', 'textarea', { wide: true })}
    </div></article>`;
  });
  panel.innerHTML = html;
}

const configs = {
  metrics: {
    key: 'metrics', overline: '04 · IMPACT METRICS', title: 'Keep the proof impossible to miss.', description: 'Add, remove, and reorder up to 50 dashboard numbers. Use only defensible figures.', label: 'Metrics', singular: 'metric', titleKey: 'value',
    fields: [{ key: 'value', label: 'Displayed value' }, { key: 'label', label: 'Metric label' }, { key: 'detail', label: 'Supporting detail', wide: true }],
    blank: { value: '0', label: 'New metric', detail: 'Add supporting context' }
  },
  capabilities: {
    key: 'capabilities', overline: '05 · EXPERTISE', title: 'Shape your commercial value proposition.', description: 'Each card can be edited, reordered, expanded, and paired with an uploaded image.', label: 'Expertise cards', singular: 'card', titleKey: 'title',
    fields: [{ key: 'number', label: 'Sequence number' }, { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea', wide: true }, { key: 'image', label: 'Optional image', type: 'upload', accept: 'image/*' }],
    blank: { number: '00', title: 'New expertise area', description: 'Describe the capability and its commercial value.', image: '' }
  },
  stories: {
    key: 'stories', overline: '06 · TRACK RECORD', title: 'Build account stories, not a logo wall.', description: 'These are your sales equivalents of cases: context, commercial action, and evidence.', label: 'Commercial stories', singular: 'story', titleKey: 'title',
    fields: [{ key: 'kicker', label: 'Category' }, { key: 'title', label: 'Story title', wide: true }, { key: 'summary', label: 'Situation, action, and result', type: 'textarea', wide: true }, { key: 'result', label: 'Result strip' }, { key: 'image', label: 'Optional image', type: 'upload', accept: 'image/*' }],
    blank: { kicker: 'NEW STORY', title: 'Add a commercial outcome', summary: 'Explain the situation, your action, and the result without confidential details.', result: 'Result', image: '' }
  },
  process: {
    key: 'accountSteps', overline: '08 · CONSULTING APPROACH', title: 'Edit your consulting approach.', description: 'Add and reorder steps showing how you move from commercial diagnosis to implementation.', label: 'Approach steps', singular: 'step', titleKey: 'title',
    fields: [{ key: 'number', label: 'Step number' }, { key: 'title', label: 'Step title' }, { key: 'description', label: 'Description', type: 'textarea', wide: true }],
    blank: { number: '00', title: 'New step', description: 'Describe the action and why it matters.' }
  }
};

function stringCollectionBlock(key, label, singular, description) {
  const items = getPath(key);
  return `<section class="skill-editor-block"><p>${escapeHtml(description)}</p>${collectionHeader(label, key, singular)}${items.map((item, index) => `<article class="editor-card compact-card"><div class="editor-card-head"><h3>${escapeHtml(item)}</h3>${cardActions(key, index)}</div><div class="field-grid">${field(`${key}.${index}`, label.slice(0, -1) || 'Skill')}</div></article>`).join('')}</section>`;
}


function renderCases() {
  const panel = byId('panel-cases');
  let html = panelHeading('07 · CONSULTING CASE PORTFOLIO', 'Build a scalable card-based consulting case library.', 'Add and reorder up to 75 cases. Each case opens as a detailed in-page experience, supports up to 50 editable content sections, up to 10 media items per section, and exactly three main document slots. Every upload accepts up to 10 MB; unused cases and files remain hidden.') + collectionHeader('Consulting cases', 'cases', 'case');
  state.content.cases.forEach((item, index) => {
    item.detailSections ||= [];
    item.documents ||= [];
    while (item.documents.length < 3) item.documents.push({label:'Document',type:'pdf',url:'',downloadUrl:'',downloadFilename:''});
    html += `<article class="editor-card"><div class="editor-card-head"><h3>${escapeHtml(item.title || `Case ${index+1}`)}</h3>${cardActions('cases', index)}</div><div class="field-grid">
      <label class="visibility wide"><input type="checkbox" data-boolean-path="cases.${index}.visible" ${item.visible ? 'checked' : ''}> Show this case publicly</label>
      ${field(`cases.${index}.eyebrow`, 'Card eyebrow', 'text', { wide: true })}
      ${field(`cases.${index}.title`, 'Case title', 'textarea', { wide: true })}
      ${field(`cases.${index}.cardSummary`, 'Short homepage card summary', 'textarea', { wide: true })}
      ${field(`cases.${index}.subtitle`, 'Case-detail subtitle', 'textarea', { wide: true })}
    </div>
    <div class="collection-tools"><strong>Detailed content sections <small>${item.detailSections.length}/50</small></strong><button class="add-button" type="button" data-case-section-add="${index}" ${item.detailSections.length>=50?'disabled':''}>Add section</button></div>
    <div class="nested-list">${item.detailSections.map((block,sectionIndex)=>caseSectionEditor(index,sectionIndex,block)).join('')}</div>
    <div class="collection-tools"><strong>Main case documents <small>3/3</small></strong><span>Unused files stay hidden publicly.</span></div>
    ${item.documents.slice(0,3).map((doc,docIndex)=>`<div class="field-grid case-document-editor">
      ${field(`cases.${index}.documents.${docIndex}.label`, `Document ${docIndex+1} button label`, 'text', {wide:true})}
      ${field(`cases.${index}.documents.${docIndex}.type`, 'File type', 'select', {items:['pdf','pptx']})}
      ${uploadField(`cases.${index}.documents.${docIndex}.url`, 'Upload PDF or PPTX (max 10 MB)', 'application/pdf,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx', `cases.${index}.documents.${docIndex}.downloadUrl`)}
      ${field(`cases.${index}.documents.${docIndex}.downloadFilename`, 'Downloaded filename', 'text', {wide:true})}
    </div>`).join('')}
    </article>`;
  });
  panel.innerHTML = html;
}

function caseSectionEditor(caseIndex, sectionIndex, block) {
  block.media ||= [];
  return `<div class="nested-item case-section-editor"><span class="index">${sectionIndex+1}</span><div class="wide">
    <div class="field-grid">${field(`cases.${caseIndex}.detailSections.${sectionIndex}.title`, 'Section title', 'text', {wide:true})}${richField(`cases.${caseIndex}.detailSections.${sectionIndex}.body`, 'Section content')}</div>
    <div class="collection-tools"><strong>Section media <small>${block.media.length}/10</small></strong><button class="add-button" type="button" data-case-media-add="${caseIndex}" data-section-index="${sectionIndex}" ${block.media.length>=10?'disabled':''}>Add media</button></div>
    ${block.media.map((media,mediaIndex)=>`<div class="field-grid case-media-editor">
      ${field(`cases.${caseIndex}.detailSections.${sectionIndex}.media.${mediaIndex}.type`, 'Media type', 'select', {items:['image','pdf','pptx']})}
      ${field(`cases.${caseIndex}.detailSections.${sectionIndex}.media.${mediaIndex}.label`, 'Button label / media name')}
      ${field(`cases.${caseIndex}.detailSections.${sectionIndex}.media.${mediaIndex}.caption`, 'Image caption or description', 'textarea', {wide:true})}
      ${uploadField(`cases.${caseIndex}.detailSections.${sectionIndex}.media.${mediaIndex}.url`, 'Upload JPG, PNG, PDF or PPTX (max 10 MB)', 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,application/pdf,.pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx', `cases.${caseIndex}.detailSections.${sectionIndex}.media.${mediaIndex}.downloadUrl`)}
      <button class="danger-button" type="button" data-case-media-delete="${caseIndex}" data-section-index="${sectionIndex}" data-media-index="${mediaIndex}">Delete media</button>
    </div>`).join('')}
  </div><div class="nested-actions"><button type="button" data-case-section-action="up" data-case-index="${caseIndex}" data-section-index="${sectionIndex}">↑</button><button type="button" data-case-section-action="down" data-case-index="${caseIndex}" data-section-index="${sectionIndex}">↓</button><button type="button" data-case-section-action="delete" data-case-index="${caseIndex}" data-section-index="${sectionIndex}">×</button></div></div>`;
}

function renderSkills() {
  const panel = byId('panel-skills');
  panel.innerHTML = panelHeading('09 · SKILLS', 'Edit the complete Commercial Excellence toolkit.', 'Four editable groups keep the public presentation structured while allowing significantly more depth than a one-page CV.') +
    stringCollectionBlock('commercialSkills', 'Commercial skills', 'commercial skill', 'Up to 300 Commercial Excellence, sales-transformation, pricing, go-to-market and account-strategy capabilities.') +
    stringCollectionBlock('softSkills', 'Soft skills', 'soft skill', 'Up to 200 interpersonal, leadership, analytical, communication, and collaboration capabilities.') +
    stringCollectionBlock('softwareSkills', 'Software and tools', 'application', 'Up to 100 applications, systems, analytics platforms, and productivity tools.') +
    stringCollectionBlock('languageSkills', 'Language skills', 'language', 'Up to 10 languages with proficiency levels.');
}

function renderExperience() {
  const panel = byId('panel-experience');
  let html = panelHeading('09 · EXPERIENCE', 'Your expandable commercial history.', 'Add and reorder up to 50 roles. Every role supports up to 50 Word-style formatted bullet points and an optional image.') + collectionHeader('Experience entries', 'experiences', 'experience');
  state.content.experiences.forEach((item, index) => {
    html += `<article class="editor-card"><div class="editor-card-head"><h3>${escapeHtml(item.company)} · ${escapeHtml(item.role)}</h3>${cardActions('experiences', index)}</div><div class="field-grid">
      ${field(`experiences.${index}.role`, 'Role')}${field(`experiences.${index}.company`, 'Company')}
      ${field(`experiences.${index}.location`, 'Location')}${field(`experiences.${index}.dates`, 'Dates')}
      ${field(`experiences.${index}.summary`, 'Role summary', 'textarea', { wide: true })}
      ${uploadField(`experiences.${index}.image`, 'Optional role or company image', 'image/*')}
    </div>
    ${nestedRichList('experiences', index, 'bullets', 'Experience bullets', 'bullet')}
    </article>`;
  });
  panel.innerHTML = html;
}

function nestedRichList(collection, index, key, label, singular) {
  const items = state.content[collection][index][key];
  return `<div class="collection-tools"><strong>${escapeHtml(label)} <small>${items.length}/50</small></strong><button class="add-button" type="button" data-add-nested="${collection}" data-index="${index}" data-key="${key}" ${items.length >= 50 ? 'disabled' : ''}>Add ${escapeHtml(singular)}</button></div>
    <div class="nested-list">${items.map((_item, nestedIndex) => `<div class="nested-item"><span class="index">${nestedIndex + 1}</span>${richField(`${collection}.${index}.${key}.${nestedIndex}`, `${singular} ${nestedIndex + 1}`)}<div class="nested-actions"><button type="button" data-nested-action="up" data-collection="${collection}" data-index="${index}" data-key="${key}" data-nested-index="${nestedIndex}">↑</button><button type="button" data-nested-action="down" data-collection="${collection}" data-index="${index}" data-key="${key}" data-nested-index="${nestedIndex}">↓</button><button type="button" data-nested-action="delete" data-collection="${collection}" data-index="${index}" data-key="${key}" data-nested-index="${nestedIndex}">×</button></div></div>`).join('')}</div>`;
}

function nestedTextList(collection, index, key, label, singular) {
  const items = state.content[collection][index][key] || [];
  const limit = collectionLimit(key);
  return `<div class="collection-tools"><strong>${escapeHtml(label)} <small>${items.length}/${limit}</small></strong><button class="add-button" type="button" data-add-nested="${collection}" data-index="${index}" data-key="${key}" ${items.length >= limit ? 'disabled' : ''}>Add ${escapeHtml(singular)}</button></div>
    <div class="nested-list">${items.map((_item, nestedIndex) => `<div class="nested-item"><span class="index">${nestedIndex + 1}</span><div class="field-grid">${field(`${collection}.${index}.${key}.${nestedIndex}`, `${singular} ${nestedIndex + 1}`)}</div><div class="nested-actions"><button type="button" data-nested-action="up" data-collection="${collection}" data-index="${index}" data-key="${key}" data-nested-index="${nestedIndex}">↑</button><button type="button" data-nested-action="down" data-collection="${collection}" data-index="${index}" data-key="${key}" data-nested-index="${nestedIndex}">↓</button><button type="button" data-nested-action="delete" data-collection="${collection}" data-index="${index}" data-key="${key}" data-nested-index="${nestedIndex}">×</button></div></div>`).join('')}</div>`;
}

function renderEducation() {
  const panel = byId('panel-education');
  let html = panelHeading('10 · EDUCATION', 'Turn education into visible evidence.', 'Manage qualifications, optional subjects, a dedicated thesis showcase, downloadable research documents, and a separate GATE achievement card.') +
    `<article class="editor-card"><div class="editor-card-head"><h3>Education section introduction</h3></div><div class="field-grid">
      ${field('sections.education.eyebrow', 'Section label', 'text', { wide: true })}
      ${field('sections.education.title', 'Main heading', 'textarea', { wide: true })}
      ${field('sections.education.intro', 'Introductory description', 'textarea', { wide: true })}
    </div></article>` + collectionHeader('Education entries', 'education', 'qualification');
  state.content.education.forEach((item, index) => {
    html += `<article class="editor-card"><div class="editor-card-head"><h3>${escapeHtml(item.degree)}</h3>${cardActions('education', index)}</div><div class="field-grid">
      ${field(`education.${index}.degree`, 'Degree')}${field(`education.${index}.institution`, 'Institution')}
      ${field(`education.${index}.location`, 'Location')}${field(`education.${index}.dates`, 'Dates')}
      ${field(`education.${index}.result`, 'Result', 'text', { wide: true })}
      ${field(`education.${index}.description`, 'Commercially relevant description', 'textarea', { wide: true })}
      ${uploadField(`education.${index}.image`, 'Optional education image', 'image/*')}
      ${field(`education.${index}.certificate.label`, 'Degree-certificate button label', 'text', { wide: true })}
      ${uploadField(`education.${index}.certificate.url`, 'Upload degree certificate PDF', 'application/pdf', `education.${index}.certificate.downloadUrl`)}
      ${field(`education.${index}.certificate.downloadFilename`, 'Degree-certificate download filename', 'text', { wide: true })}
    </div>${nestedTextList('education', index, 'subjects', 'Selected subjects (hidden publicly when empty)', 'subject')}${nestedRichList('education', index, 'details', 'Supporting details', 'detail')}</article>`;
  });
  html += `<article class="editor-card"><div class="editor-card-head"><h3>MBA thesis showcase</h3></div><div class="field-grid">
    <label class="visibility wide"><input type="checkbox" data-boolean-path="thesis.visible" ${state.content.thesis.visible ? 'checked' : ''}> Show thesis card publicly</label>
    ${field('thesis.eyebrow', 'Eyebrow', 'text', { wide: true })}
    ${field('thesis.title', 'Thesis title', 'textarea', { wide: true })}
    ${field('thesis.subtitle', 'One-line positioning', 'textarea', { wide: true })}
    ${field('thesis.summary', 'Framework summary', 'textarea', { wide: true })}
    ${field('thesis.valueStatement', 'Why it makes you commercially valuable', 'textarea', { wide: true })}
    ${uploadField('thesis.summaryDocument.url', 'Upload executive-summary PDF', 'application/pdf', 'thesis.summaryDocument.downloadUrl')}
    ${field('thesis.summaryDocument.label', 'Summary button label', 'text', { wide: true })}
    ${uploadField('thesis.fullDocument.url', 'Upload complete-thesis PDF', 'application/pdf', 'thesis.fullDocument.downloadUrl')}
    ${field('thesis.fullDocument.label', 'Complete-thesis button label', 'text', { wide: true })}
  </div></article>`;
  html += stringCollectionBlock('thesis.frameworkTags', 'Thesis framework tags', 'framework tag', 'Short tags that help a recruiter understand the decision framework quickly.');
  html += `<article class="editor-card"><div class="editor-card-head"><h3>GATE achievement showcase</h3></div><div class="field-grid">
    <label class="visibility wide"><input type="checkbox" data-boolean-path="gateAchievement.visible" ${state.content.gateAchievement.visible ? 'checked' : ''}> Show GATE card publicly</label>
    ${field('gateAchievement.eyebrow', 'Eyebrow', 'text', { wide: true })}
    ${field('gateAchievement.title', 'Achievement title')}${field('gateAchievement.stat', 'Large statistic')}
    ${field('gateAchievement.context', 'Candidate context', 'text', { wide: true })}
    ${field('gateAchievement.description', 'Marketing description', 'textarea', { wide: true })}
  </div></article>`;
  html += stringCollectionBlock('gateAchievement.tags', 'GATE highlight tags', 'highlight tag', 'Editable proof points displayed around the achievement.');
  panel.innerHTML = html;
}

function renderCredentials() {
  const panel = byId('panel-credentials');
  let html = panelHeading('11 · CREDENTIALS', 'Control what recruiters can review and download.', 'Each document opens inside the website. A separate download file becomes available only after the viewer is opened.') + `<div class="notice">Anything displayed online can still be saved or captured. Upload only redacted public-safe documents.</div>` + collectionHeader('Documents', 'documents', 'document');
  state.content.documents.forEach((item, index) => {
    html += `<article class="editor-card"><div class="editor-card-head"><h3>${escapeHtml(item.label)}</h3>${cardActions('documents', index)}</div><div class="field-grid">
      ${field(`documents.${index}.label`, 'Document label')}
      ${field(`documents.${index}.type`, 'Viewer type', 'select', { items: ['image', 'pdf'] })}
      ${field(`documents.${index}.description`, 'Description', 'textarea', { wide: true })}
      ${uploadField(`documents.${index}.url`, 'Upload in-page viewer file', 'image/*,application/pdf')}
      ${uploadField(`documents.${index}.downloadUrl`, 'Upload downloadable PDF', 'application/pdf')}
      ${field(`documents.${index}.downloadFilename`, 'Downloaded filename', 'text', { wide: true })}
      <label class="visibility wide"><input type="checkbox" data-boolean-path="documents.${index}.visible" ${item.visible ? 'checked' : ''}> Visible on public website</label>
    </div></article>`;
  });
  html += `<article class="editor-card"><div class="editor-card-head"><h3>Certificate contact note</h3></div><div class="field-grid">${field('credentialNote', 'Editable certificate note', 'textarea', { wide: true })}</div></article>`;
  html += collectionHeader('Achievement lines', 'achievements', 'achievement') + state.content.achievements.map((_item, index) => `<article class="editor-card"><div class="editor-card-head"><h3>Achievement ${index + 1}</h3>${cardActions('achievements', index)}</div><div class="field-grid">${richField(`achievements.${index}`, 'Displayed statement')}</div></article>`).join('');
  panel.innerHTML = html;
}

function renderContact() {
  const panel = byId('panel-contact');
  panel.innerHTML = panelHeading('13 · CONTACT + FOOTER', 'Keep every route current.', 'Edit public contact actions, availability, location, footer language, and the private owner-login label.') + `
    <article class="editor-card"><div class="editor-card-head"><h3>Contact details</h3></div><div class="field-grid">
      ${field('contact.email', 'Email')}${field('contact.phone', 'Displayed phone')}
      ${field('contact.phoneHref', 'Phone link without spaces')}${field('contact.linkedinLabel', 'LinkedIn label')}
      ${field('contact.linkedinUrl', 'LinkedIn URL', 'url', { wide: true })}
      ${field('contact.location', 'Location / mobility', 'text', { wide: true })}
      ${field('contact.availability', 'Availability', 'text', { wide: true })}
    </div></article>
    <article class="editor-card"><div class="editor-card-head"><h3>Contact labels and cursor actions</h3></div><div class="field-grid">
      ${field('ui.contactEmailLabel', 'Email label')}${field('ui.contactPhoneLabel', 'Phone label')}
      ${field('ui.contactLinkedinLabel', 'LinkedIn label')}${field('ui.viewProfileLabel', 'Profile-link label')}
      ${field('ui.contactLocationLabel', 'Location label')}${field('ui.contactStatusLabel', 'Status label')}
      ${field('ui.cursorEmail', 'Cursor: email')}${field('ui.cursorCall', 'Cursor: call')}
      ${field('ui.cursorLinkedin', 'Cursor: LinkedIn', 'text', { wide: true })}
    </div></article>
    <article class="editor-card"><div class="editor-card-head"><h3>Footer</h3></div><div class="field-grid">
      ${field('footer.copyright', 'Copyright')}${field('footer.ownerLoginLabel', 'Owner-login label')}
      ${field('footer.note', 'Footer positioning line', 'text', { wide: true })}
    </div></article>`;
}

function renderAbout() {
  const panel = byId('panel-about');
  panel.innerHTML = panelHeading('12 · ABOUT + PHOTO', 'Put the person behind the commercial evidence.', 'This section appears immediately before Contact. The public photo frame uses the requested 4:5 portrait ratio.') + `
    <article class="editor-card"><div class="editor-card-head"><h3>About narrative</h3></div><div class="field-grid">
      ${field('about.eyebrow', 'Eyebrow', 'text', { wide: true })}
      ${field('about.title', 'Headline', 'textarea', { wide: true })}
      ${field('about.body', 'About text (leave a blank line between paragraphs)', 'textarea', { wide: true, max: 12000 })}
      ${field('about.photoAlt', 'Photo description', 'text', { wide: true })}
      ${uploadField('about.photo', 'Upload high-resolution portrait (recommended 4:5 ratio)', 'image/jpeg,image/png,image/webp')}
    </div></article>`;
}

function renderAdvanced() {
  const panel = byId('panel-advanced');
  panel.innerHTML = panelHeading('14 · ADVANCED', 'Complete structural control.', 'This JSON editor exposes the entire site model. Use it only when you need a field beyond the visual editor.') + `
    <div class="notice">Invalid JSON will not be applied. Publishing requires exporting content.js and replacing that file in GitHub.</div>
    <article class="editor-card"><div class="editor-card-head"><h3>Owner credentials</h3></div><div class="field-grid">
      ${field('security.adminUsername', 'Owner username', 'text', { wide: true })}
      <label>New password<input id="newOwnerPassword" type="password" autocomplete="new-password" minlength="14"></label>
      <label>Repeat new password<input id="repeatOwnerPassword" type="password" autocomplete="new-password" minlength="14"></label>
      <button class="add-button wide" id="changeOwnerPassword" type="button">Change owner password</button>
    </div></article>
    <article class="editor-card"><textarea class="json-editor" id="jsonEditor" spellcheck="false">${escapeHtml(JSON.stringify(state.content, null, 2))}</textarea><div class="collection-tools"><span></span><button class="add-button" id="applyJson" type="button">Apply JSON to editor</button></div></article>`;
}

function renderPanel(name) {
  if (name === 'identity') renderIdentity();
  else if (name === 'theme') renderTheme();
  else if (name === 'sections') renderSections();
  else if (name === 'capabilities') renderCapabilities();
  else if (configs[name]) renderSimpleCollection(byId(`panel-${name}`), configs[name]);
  else if (name === 'cases') renderCases();
  else if (name === 'skills') renderSkills();
  else if (name === 'experience') renderExperience();
  else if (name === 'education') renderEducation();
  else if (name === 'credentials') renderCredentials();
  else if (name === 'about') renderAbout();
  else if (name === 'contact') renderContact();
  else if (name === 'advanced') renderAdvanced();
  bindPanel(byId(`panel-${name}`));
}

function renderAllPanels() {
  Object.keys(panelLabels).forEach(renderPanel);
}

function bindPanel(panel) {
  $$('[data-path]', panel).forEach((input) => input.addEventListener('input', () => {
    setPath(input.dataset.path, input.type === 'number' ? Number(input.value) : input.value);
  }));
  $$('[data-rich-path]', panel).forEach((editor) => editor.addEventListener('input', () => setPath(editor.dataset.richPath, editor.innerHTML)));
  $$('[data-boolean-path]', panel).forEach((input) => input.addEventListener('change', () => setPath(input.dataset.booleanPath, input.checked)));
  $$('.rich-toolbar button', panel).forEach((button) => button.addEventListener('mousedown', (event) => {
    event.preventDefault();
    const toolbar = button.closest('.rich-toolbar');
    const editor = panel.querySelector(`[data-rich-path="${CSS.escape(toolbar.dataset.editorPath)}"]`);
    editor.focus();
    let value = button.dataset.commandValue || null;
    if (button.dataset.command === 'createLink') value = prompt('Paste the full link, including https://');
    if (button.dataset.command === 'createLink' && !value) return;
    document.execCommand(button.dataset.command, false, value);
    setPath(editor.dataset.richPath, editor.innerHTML);
  }));
  $$('.rich-toolbar [data-rich-command]', panel).forEach((control) => control.addEventListener('change', () => {
    const toolbar = control.closest('.rich-toolbar');
    const editor = panel.querySelector(`[data-rich-path="${CSS.escape(toolbar.dataset.editorPath)}"]`);
    editor.focus();
    document.execCommand(control.dataset.richCommand, false, control.value);
    setPath(editor.dataset.richPath, editor.innerHTML);
  }));
  $$('[data-action]', panel).forEach((button) => button.addEventListener('click', () => collectionAction(button.dataset.collection, Number(button.dataset.index), button.dataset.action)));
  $$('[data-add]', panel).forEach((button) => button.addEventListener('click', () => addCollectionItem(button.dataset.add)));
  $$('[data-add-nested]', panel).forEach((button) => button.addEventListener('click', () => addNested(button.dataset.addNested, Number(button.dataset.index), button.dataset.key)));
  $$('[data-nested-action]', panel).forEach((button) => button.addEventListener('click', () => nestedAction(button)));
  $$('[data-section-action]', panel).forEach((button) => button.addEventListener('click', () => sectionAction(button.dataset.sectionId, button.dataset.sectionAction)));
  $$('[data-visible-section]', panel).forEach((input) => input.addEventListener('change', () => { state.content.sections[input.dataset.visibleSection].visible = input.checked; markDirty(); }));
  $$('.swatch', panel).forEach((button) => button.addEventListener('click', () => {
    setPath(button.closest('.swatches').dataset.colorPath, button.dataset.color);
    renderPanel('theme');
  }));
  $$('.swatch', panel).forEach((button) => { button.style.backgroundColor = button.dataset.color; });
  $$('[data-upload-path]', panel).forEach((input) => input.addEventListener('change', () => uploadFile(input)));
  $$('[data-clear-upload]', panel).forEach((button) => button.addEventListener('click', () => {
    setPath(button.dataset.clearUpload, '');
    if (button.dataset.clearMirror) setPath(button.dataset.clearMirror, '');
    renderPanel(state.activePanel);
  }));
  $$('[data-case-section-add]', panel).forEach((button) => button.addEventListener('click', () => { const c=state.content.cases[Number(button.dataset.caseSectionAdd)]; if(c.detailSections.length<50){c.detailSections.push({title:'New section',body:'',media:[]}); markDirty(); renderPanel('cases');} }));
  $$('[data-case-section-action]', panel).forEach((button) => button.addEventListener('click', () => { const list=state.content.cases[Number(button.dataset.caseIndex)].detailSections; const i=Number(button.dataset.sectionIndex); const a=button.dataset.caseSectionAction; if(a==='delete') list.splice(i,1); else {const t=a==='up'?i-1:i+1;if(t<0||t>=list.length)return;[list[i],list[t]]=[list[t],list[i]];} markDirty(); renderPanel('cases'); }));
  $$('[data-case-media-add]', panel).forEach((button) => button.addEventListener('click', () => { const list=state.content.cases[Number(button.dataset.caseMediaAdd)].detailSections[Number(button.dataset.sectionIndex)].media; if(list.length<10){list.push({type:'image',label:'',caption:'',url:'',downloadUrl:'',downloadFilename:''});markDirty();renderPanel('cases');} }));
  $$('[data-case-media-delete]', panel).forEach((button) => button.addEventListener('click', () => { state.content.cases[Number(button.dataset.caseMediaDelete)].detailSections[Number(button.dataset.sectionIndex)].media.splice(Number(button.dataset.mediaIndex),1);markDirty();renderPanel('cases'); }));
  if (byId('applyJson')) byId('applyJson').addEventListener('click', applyAdvancedJson);
  if (byId('changeOwnerPassword')) byId('changeOwnerPassword').addEventListener('click', changeOwnerPassword);
}

function collectionAction(collection, index, action) {
  const list = getPath(collection);
  if (!Array.isArray(list)) return;
  if (action === 'delete') {
    if (!confirm('Delete this item?')) return;
    list.splice(index, 1);
  } else {
    const target = action === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
  }
  markDirty(); renderPanel(state.activePanel);
}

function blankFor(collection) {
  if (configs[collection]) return structuredClone(configs[collection].blank);
  if (collection === 'cases') return { visible: false, eyebrow: 'CONSULTING CASE', title: 'New consulting case', cardSummary: 'Short homepage summary.', subtitle: 'Detailed case subtitle.', challenge: '', approach: '', insight: '', relevance: '', detailSections: [{ title: 'The challenge', body: '', media: [] }], documents: [{label:'Executive summary',type:'pdf',url:'',downloadUrl:'',downloadFilename:'Executive_Summary.pdf'},{label:'Full case',type:'pdf',url:'',downloadUrl:'',downloadFilename:'Full_Case.pdf'},{label:'Case presentation',type:'pptx',url:'',downloadUrl:'',downloadFilename:'Case_Presentation.pptx'}] };
  if (collection === 'navigation') return { label: 'New link', target: 'contact' };
  if (collection === 'experiences') return { role: 'New role', company: 'Company', location: 'Location', dates: 'Dates', summary: 'Role summary', bullets: ['Add a quantified, defensible achievement.'], image: '' };
  if (collection === 'education') return { degree: 'New qualification', institution: 'Institution', location: 'Location', dates: 'Dates', result: 'Result', description: 'Relevant description', subjects: [], details: ['Add supporting detail.'], image: '', certificate: { label: 'View degree certificate', type: 'pdf', url: '', downloadUrl: '', downloadFilename: 'Degree_Certificate.pdf' } };
  if (collection === 'documents') return { label: 'New document', type: 'image', url: '', downloadUrl: '', downloadFilename: '', description: 'Document description', visible: false };
  if (collection === 'achievements') return 'New achievement';
  if (collection === 'sectorTags') return 'New sector or product';
  if (collection === 'commercialSkills' || collection === 'softSkills') return 'New skill';
  if (collection === 'softwareSkills') return 'New application or tool';
  if (collection === 'languageSkills') return 'Language · Level';
  if (collection === 'thesis.frameworkTags') return 'New framework feature';
  if (collection === 'gateAchievement.tags') return 'New achievement tag';
  return {};
}

function addCollectionItem(collection) {
  const list = getPath(collection);
  const limit = collectionLimit(collection.split('.').at(-1));
  if (!Array.isArray(list) || list.length >= limit) return toast(`This collection already has ${limit} items.`, true);
  list.push(blankFor(collection)); markDirty(); renderPanel(state.activePanel);
}

function addNested(collection, index, key) {
  const list = state.content[collection][index][key];
  const limit = collectionLimit(key);
  if (list.length >= limit) return toast(`This entry already has ${limit} items.`, true);
  list.push(key === 'subjects' ? 'New subject' : 'Add a new point.'); markDirty(); renderPanel(state.activePanel);
}

function nestedAction(button) {
  const list = state.content[button.dataset.collection][Number(button.dataset.index)][button.dataset.key];
  const index = Number(button.dataset.nestedIndex);
  const action = button.dataset.nestedAction;
  if (action === 'delete') list.splice(index, 1);
  else {
    const target = action === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
  }
  markDirty(); renderPanel(state.activePanel);
}

function sectionAction(id, action) {
  const list = state.content.sectionOrder;
  const index = list.indexOf(id);
  const target = action === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  markDirty(); renderPanel('sections');
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file) {
  const source = await readAsDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const node = new Image();
    node.onload = () => resolve(node);
    node.onerror = () => reject(new Error('The selected image could not be opened.'));
    node.src = source;
  });
  const maximum = 2000;
  const scale = Math.min(1, maximum / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', .88);
}

async function uploadFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) return toast('Please use a file no larger than 10 MB.', true);
  input.disabled = true;
  try {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isPptx = file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || file.name.toLowerCase().endsWith('.pptx');
    if (!isImage && !isPdf && !isPptx) throw new Error('Only images, PDF files and PowerPoint .pptx files are supported.');
    const value = isImage ? await compressImage(file) : await readAsDataUrl(file);
    setPath(input.dataset.uploadPath, value);
    if (input.dataset.uploadMirror) setPath(input.dataset.uploadMirror, value);
    await persistDraft();
    toast('File added. Save, preview, then export content.js to publish.');
    renderPanel(state.activePanel);
  } catch (error) {
    input.disabled = false;
    toast(error.message, true);
  }
}

function applyAdvancedJson() {
  try {
    const parsed = JSON.parse(byId('jsonEditor').value);
    if (!parsed.theme || !parsed.brand || !parsed.sections || !Array.isArray(parsed.sectionOrder)) throw new Error('Required site keys are missing.');
    state.content = parsed; markDirty(); renderAllPanels(); toast('JSON applied. Review and save.');
  } catch (error) { toast(`JSON not applied: ${error.message}`, true); }
}

function selectPanel(name) {
  state.activePanel = name;
  $$('.studio-nav button').forEach((button) => button.classList.toggle('active', button.dataset.panel === name));
  $$('.editor-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `panel-${name}`));
  byId('mobilePanelSelect').value = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function changeOwnerPassword() {
  const first = byId('newOwnerPassword').value;
  const second = byId('repeatOwnerPassword').value;
  if (first.length < 14) return toast('Use at least 14 characters.', true);
  if (!/[A-Z]/.test(first) || !/[a-z]/.test(first) || !/\d/.test(first) || !/[^A-Za-z0-9]/.test(first)) return toast('Include uppercase, lowercase, number, and symbol.', true);
  if (first !== second) return toast('The two passwords do not match.', true);
  state.content.security.adminHash = await sha256(`${state.content.security.adminUsername}:${first}`);
  markDirty();
  await persistDraft();
  byId('newOwnerPassword').value = '';
  byId('repeatOwnerPassword').value = '';
  toast('Owner password changed in this draft. Export content.js to publish it.');
}

async function saveContent() {
  byId('saveButton').disabled = true;
  byId('saveStatus').textContent = 'Saving draft…';
  try {
    await persistDraft();
    localStorage.setItem(PREVIEW_KEY, String(Date.now() + PREVIEW_DURATION));
    state.dirty = false;
    byId('saveStatus').textContent = `Draft saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    toast('Draft saved in this browser. Preview it, then export content.js to publish.');
  } catch (error) {
    byId('saveStatus').textContent = 'Save failed';
    toast(`Draft could not be saved: ${error.message}`, true);
  } finally { byId('saveButton').disabled = false; }
}

async function exportContent() {
  await saveContent();
  const exported = structuredClone(state.content);
  exported.meta.updatedAt = new Date().toISOString();
  const javascript = `/* Generated by HS Owner Studio on ${new Date().toISOString().slice(0, 10)}. Replace js/content.js in GitHub to publish. */\nwindow.SITE_CONTENT = ${JSON.stringify(exported, null, 2)};\nwindow.SITE_CONTENT_READY = Promise.resolve(window.SITE_CONTENT);\n`;
  const blob = new Blob([javascript], { type: 'text/javascript' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'content.js';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  toast('content.js downloaded. Replace js/content.js in GitHub and commit.');
}

async function showStudio() {
  byId('authShell').classList.add('hidden');
  byId('studio').classList.remove('hidden');
  localStorage.setItem(PREVIEW_KEY, String(Date.now() + PREVIEW_DURATION));
  const select = byId('mobilePanelSelect');
  select.innerHTML = Object.entries(panelLabels).map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  renderAllPanels(); selectPanel('identity');
}

function bindGlobalEvents() {
  byId('showReset').addEventListener('click', () => showLogin(true));
  byId('backToLogin').addEventListener('click', () => showLogin(false));
  byId('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    byId('loginMessage').textContent = 'Checking credentials…';
    const username = byId('loginUsername').value.trim();
    const password = byId('loginPassword').value;
    const hash = await sha256(`${username}:${password}`);
    const usernameMatches = username.toUpperCase() === String(state.content.security.adminUsername).toUpperCase();
    if (!usernameMatches || hash !== state.content.security.adminHash) {
      byId('loginMessage').textContent = 'Wrong username or password.';
      return;
    }
    byId('loginMessage').textContent = '';
    await showStudio();
  });
  byId('saveButton').addEventListener('click', saveContent);
  byId('exportButton').addEventListener('click', exportContent);
  byId('logoutButton').addEventListener('click', () => { localStorage.removeItem(PREVIEW_KEY); location.reload(); });
  $$('.studio-nav button').forEach((button) => button.addEventListener('click', () => selectPanel(button.dataset.panel)));
  byId('mobilePanelSelect').addEventListener('change', (event) => selectPanel(event.target.value));
  window.addEventListener('beforeunload', (event) => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !byId('studio').classList.contains('hidden')) { event.preventDefault(); saveContent(); } });
}

async function boot() {
  try {
    const published = await (window.SITE_CONTENT_READY || Promise.resolve(window.SITE_CONTENT));
    if (!published) throw new Error('Could not load portfolio content.');
    state.content = await loadDraft() || structuredClone(published);
    bindGlobalEvents();
    showLogin(false);
  } catch (error) {
    showLogin(false);
    byId('loginMessage').textContent = error.message;
  }
}

boot();
