import type { ResumeData } from './data/resume';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setText(selector: string, text: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (el) el.textContent = text;
}

function setHtml(selector: string, html: string): void {
  const el = document.querySelector<HTMLElement>(selector);
  if (el) el.innerHTML = html;
}

export function renderResume(data: ResumeData): void {
  setText('#hero-name-en', data.nameEn);
  setText('#hero-name-zh', data.nameZh);
  setText('#hero-role', data.role);
  document.title = `3D 交互简历 · ${data.nameZh}`;

  setHtml(
    '#panel-edu-body',
    data.education
      .map(
        (item) => `
        <article class="item">
          <div class="item-head">
            <span class="item-title">${escapeHtml(item.title)}</span>
            <span class="item-meta">${escapeHtml(item.period)}</span>
          </div>
          ${item.subtitle ? `<p class="item-meta">${escapeHtml(item.subtitle)}</p>` : ''}
          <p class="item-desc">${escapeHtml(item.description)}</p>
        </article>`,
      )
      .join(''),
  );

  setHtml(
    '#panel-projects-body',
    data.projects
      .map(
        (project) => `
        <article class="item">
          <div class="item-head">
            <span class="item-title">${escapeHtml(project.name)}</span>
            <span class="item-meta">${escapeHtml(project.period)}</span>
          </div>
          <p class="item-meta">${escapeHtml(project.role)}</p>
          <p class="item-desc">${escapeHtml(project.description)}</p>
        </article>`,
      )
      .join(''),
  );

  setHtml(
    '#panel-skills-body',
    `<div class="tags">${data.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join('')}</div>`,
  );

  setHtml(
    '#panel-honors-body',
    data.honors
      .map(
        (honor) => `
        <div class="honor-row">
          <span>${escapeHtml(honor.name)}</span>
          <span class="honor-year">${escapeHtml(honor.year)}</span>
        </div>`,
      )
      .join(''),
  );

  setHtml(
    '#resume-inner',
    (() => {
      const contactItems = (
        [
          ['邮箱', data.contact.email],
          ['电话', data.contact.phone],
          ['城市', data.contact.location],
          ['GitHub', data.contact.github],
        ] as const
      ).filter(([, value]) => value && value !== '待补充');
      const contactHtml = contactItems.length
        ? `<div class="resume-contact">${contactItems
            .map(([label, value]) => `<span>${label} ${escapeHtml(value)}</span>`)
            .join('')}</div>`
        : '';
      return `
    <header class="resume-head">
      <div>
        <h2 class="resume-name-en">${escapeHtml(data.nameEn)}</h2>
        <p class="resume-name-zh">${escapeHtml(data.nameZh)} · ${escapeHtml(data.role)}</p>
      </div>
      <p class="resume-tagline">${escapeHtml(data.tagline)}</p>
    </header>
    ${contactHtml}
    <p class="resume-summary">${escapeHtml(data.summary)}</p>
    <section class="resume-section">
      <h3>EDUCATION · 教育经历</h3>
      ${data.education
        .map(
          (item) => `
          <div class="resume-item item">
            <div class="item-head">
              <span class="item-title">${escapeHtml(item.title)}</span>
              <span class="item-meta">${escapeHtml(item.period)}</span>
            </div>
            ${item.subtitle ? `<p class="item-meta">${escapeHtml(item.subtitle)}</p>` : ''}
            <p class="item-desc">${escapeHtml(item.description)}</p>
          </div>`,
        )
        .join('')}
    </section>
    <section class="resume-section">
      <h3>PROJECTS · 项目经历</h3>
      ${data.projects
        .map(
          (project) => `
          <div class="resume-item item">
            <div class="item-head">
              <span class="item-title">${escapeHtml(project.name)}</span>
              <span class="item-meta">${escapeHtml(project.period)}</span>
            </div>
            <p class="item-meta">${escapeHtml(project.role)}</p>
            <p class="item-desc">${escapeHtml(project.description)}</p>
          </div>`,
        )
        .join('')}
    </section>
    <section class="resume-section">
      <h3>SKILLS · 专业技能</h3>
      <div class="tags">${data.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join('')}</div>
    </section>
    <section class="resume-section">
      <h3>HONORS · 荣誉证书</h3>
      ${data.honors
        .map(
          (honor) => `
          <div class="honor-row">
            <span>${escapeHtml(honor.name)}${honor.issuer ? ` · ${escapeHtml(honor.issuer)}` : ''}</span>
            <span class="honor-year">${escapeHtml(honor.year)}</span>
          </div>`,
        )
        .join('')}
    </section>`;
    })(),
  );
}
