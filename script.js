const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#main-nav');
const languageToggle = document.querySelector('.language-toggle');

// Neue Termine hier ergänzen. Datum immer im Format YYYY-MM-DD eintragen.
const events = [
  // { date: '2027-01-01', titleDe: 'Aktivierung', titleEn: 'Activation', details: 'SSB · 40 m' },
];

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

document.querySelector('#year').textContent = new Date().getFullYear();

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
  localStorage.setItem('dl1250pb-language', language);
  renderCalendar();
};

languageToggle.addEventListener('click', () => {
  setLanguage(document.documentElement.lang === 'de' ? 'en' : 'de');
});

setLanguage(localStorage.getItem('dl1250pb-language') === 'en' ? 'en' : 'de');

function renderCalendar() {
  const language = document.documentElement.lang;
  const locale = language === 'en' ? 'en-GB' : 'de-DE';
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthEvents = events.filter((event) => {
    const date = new Date(`${event.date}T12:00:00`);
    return date.getFullYear() === year && date.getMonth() === month;
  });
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

  document.querySelector('#calendar-events').innerHTML = monthEvents.length
    ? monthEvents.map((event) => `<article><time datetime="${event.date}">${new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(new Date(`${event.date}T12:00:00`))}</time><div><strong>${language === 'en' ? event.titleEn : event.titleDe}</strong><span>${event.details}</span></div></article>`).join('')
    : `<p class="no-events">${language === 'en' ? 'No activations have been announced for this month yet.' : 'Für diesen Monat wurden noch keine Aktivierungen angekündigt.'}</p>`;
}

document.querySelector('#calendar-prev').addEventListener('click', () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
  renderCalendar();
});

document.querySelector('#calendar-next').addEventListener('click', () => {
  calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
  renderCalendar();
});
