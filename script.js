const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#main-nav');
const languageToggle = document.querySelector('.language-toggle');

let events = [];

let calendarDate = new Date(2027, 0, 1);

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});

nav.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
});

const setLanguage = (language) => {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-de][data-en]').forEach((element) => {
    element.innerHTML = element.dataset[language];
  });
  languageToggle.querySelectorAll('span').forEach((label) => {
    label.classList.toggle('active', label.textContent.toLowerCase() === language);
  });
  const english = language === 'en';
  languageToggle.setAttribute('aria-pressed', String(english));
  languageToggle.setAttribute('aria-label', english ? 'Webseite auf Deutsch umschalten' : 'Switch website to English');
  document.title = english ? 'DL1250PB · Paderborn on the air' : 'DL1250PB · Paderborn auf Sendung';
  renderCalendar();
};

languageToggle.addEventListener('click', () => {
  setLanguage(document.documentElement.lang === 'de' ? 'en' : 'de');
});

setLanguage('de');

document.querySelectorAll('.embed-consent').forEach((placeholder) => {
  placeholder.querySelector('button').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = placeholder.dataset[document.documentElement.lang === 'en' ? 'titleEn' : 'titleDe'];
    iframe.src = placeholder.dataset.embed;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    placeholder.replaceWith(iframe);
  });
});

loadEvents();

async function loadEvents() {
  try {
    const response = await fetch('ics/dl1250pb.ics');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    events = parseIcs(await response.text());
  } catch (error) {
    console.error('Kalenderdatei konnte nicht geladen werden:', error);
  }
  renderCalendar();
}

function parseIcs(source) {
  const unfolded = source.replace(/\r?\n[ \t]/g, '');
  return unfolded.split(/BEGIN\\?:VEVENT/).slice(1).map((block) => {
    const value = (property) => {
      const match = block.match(new RegExp(`(?:^|\\r?\\n)${property}(?:;[^:\\r\\n]*)?\\\\?:([^\\r\\n]*)`));
      return match ? match[1].trim().replace(/\\([,;\\])/g, '$1') : '';
    };
    const start = value('DTSTART');
    const end = value('DTEND');
    if (!/^\d{8}T?\d*/.test(start)) return null;
    const date = `${start.slice(0, 4)}-${start.slice(4, 6)}-${start.slice(6, 8)}`;
    const time = start.includes('T') ? `${start.slice(9, 11)}:${start.slice(11, 13)}` : '';
    const endTime = end.includes('T') ? `${end.slice(9, 11)}:${end.slice(11, 13)}` : '';
    return { date, titleDe: value('SUMMARY') || 'Aktivierung', titleEn: value('SUMMARY') || 'Activation', details: [time && endTime ? `${time}–${endTime}` : time, 'UTC'].filter(Boolean).join(' · ') };
  }).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

function renderCalendar() {
  const language = document.documentElement.lang;
  const locale = language === 'en' ? 'en-GB' : 'de-DE';
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthEvents = events.filter((event) => {
    const date = new Date(`${event.date}T12:00:00`);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  const firstDayOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const upcomingEvents = events.filter((event) => event.date >= firstDayOfMonth);
  const eventDates = new Set(monthEvents.map((event) => Number(event.date.slice(-2))));
  const weekdays = language === 'en' ? ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] : ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
  document.querySelector('.calendar-weekdays').innerHTML = weekdays.map((day) => `<span>${day}</span>`).join('');
  document.querySelector('#calendar-month').textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(calendarDate);

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday }, () => '<span class="calendar-day empty"></span>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const hasEvent = eventDates.has(day);
    const label = hasEvent ? (language === 'en' ? `${day}, scheduled event` : `${day}, geplanter Termin`) : String(day);
    cells.push(`<span class="calendar-day${hasEvent ? ' has-event' : ''}" aria-label="${label}">${day}</span>`);
  }
  document.querySelector('#calendar-grid').innerHTML = cells.join('');

  document.querySelector('#calendar-events').innerHTML = upcomingEvents.length
    ? upcomingEvents.map((event) => `<article><time datetime="${event.date}">${new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${event.date}T12:00:00`))}</time><div><strong>${escapeHtml(language === 'en' ? event.titleEn : event.titleDe)}</strong><span>${escapeHtml(event.details)}</span></div></article>`).join('')
    : `<p class="no-events">${language === 'en' ? 'No further activations have been announced yet.' : 'Es wurden noch keine weiteren Aktivierungen angekündigt.'}</p>`;
}

document.querySelector('#calendar-prev').addEventListener('click', () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
  renderCalendar();
});

document.querySelector('#calendar-next').addEventListener('click', () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
  renderCalendar();
});


const operatorList = document.querySelector('#operator-list');
const operatorStep = () => (operatorList.querySelector('.operator')?.getBoundingClientRect().width || 298) + 22;
const scrollOperators = (direction) => operatorList.scrollBy({ left: direction * operatorStep(), behavior: 'smooth' });

document.querySelector('.operator-prev').addEventListener('click', () => scrollOperators(-1));
document.querySelector('.operator-next').addEventListener('click', () => scrollOperators(1));

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const operatorAutoscroll = window.setInterval(() => {
    const atEnd = operatorList.scrollLeft + operatorList.clientWidth >= operatorList.scrollWidth - 2;
    operatorList.scrollTo({ left: atEnd ? 0 : operatorList.scrollLeft + operatorStep(), behavior: 'smooth' });
  }, 4500);
  const pauseAutoscroll = () => window.clearInterval(operatorAutoscroll);
  operatorList.addEventListener('pointerenter', pauseAutoscroll, { once: true });
  operatorList.addEventListener('focusin', pauseAutoscroll, { once: true });
}
