const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#main-nav');
const languageToggle = document.querySelector('.language-toggle');

let events = [];
let eventsState = 'loading';

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
  document.querySelectorAll('[data-href-de][data-href-en]').forEach((link) => {
    link.href = language === 'en' ? link.dataset.hrefEn : link.dataset.hrefDe;
  });
  document.querySelectorAll('[data-alt-de][data-alt-en]').forEach((image) => {
    image.alt = language === 'en' ? image.dataset.altEn : image.dataset.altDe;
  });
  languageToggle.querySelectorAll('span').forEach((label) => {
    label.classList.toggle('active', label.textContent.toLowerCase() === language);
  });
  const english = language === 'en';
  languageToggle.setAttribute('aria-pressed', String(english));
  languageToggle.setAttribute('aria-label', english ? 'Webseite auf Deutsch umschalten' : 'Switch website to English');
  document.title = english ? 'DL1250PB · Paderborn on the air' : 'DL1250PB · Paderborn auf Sendung';
  renderCalendar();
  renderNextActivation();
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
    const response = await fetch('ics/dl1250pb.ics', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    events = parseIcs(await response.text());
    eventsState = 'ready';
  } catch (error) {
    eventsState = 'error';
    console.error('Kalenderdatei konnte nicht geladen werden:', error);
  }
  renderCalendar();
  renderNextActivation();
}

function parseIcsDate(property, fallbackZone) {
  if (!property) return null;
  const match = property.value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second, utc] = match;
  const allDay = hour === undefined;
  const parts = [Number(year), Number(month) - 1, Number(day), Number(hour || 0), Number(minute || 0), Number(second || 0)];
  const wallTime = Date.UTC(...parts);
  const date = new Date(wallTime);
  if (date.getUTCFullYear() !== parts[0] || date.getUTCMonth() !== parts[1] || date.getUTCDate() !== parts[2]
    || date.getUTCHours() !== parts[3] || date.getUTCMinutes() !== parts[4] || date.getUTCSeconds() !== parts[5]) return null;
  if (utc || allDay) return { timestamp: wallTime, allDay };
  const zone = property.params.match(/(?:^|;)TZID=(?:"([^"]+)"|([^;]+))/i);
  const timeZone = zone ? zone[1] || zone[2] : fallbackZone;
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
    const localTimestamp = (timestamp) => {
      const local = Object.fromEntries(formatter.formatToParts(timestamp).map((part) => [part.type, part.value]));
      return Date.UTC(Number(local.year), Number(local.month) - 1, Number(local.day), Number(local.hour), Number(local.minute), Number(local.second));
    };
    const offsets = [...new Set([-172800000, 0, 172800000].map((distance) => {
      const probe = wallTime + distance;
      return localTimestamp(probe) - probe;
    }))];
    const candidates = offsets.map((offset) => wallTime - offset);
    const matching = candidates.filter((timestamp) => localTimestamp(timestamp) === wallTime);
    // RFC 5545: use the first occurrence of repeated local times; for skipped
    // local times, use the UTC offset in force before the forward transition.
    const timestamp = matching.length ? Math.min(...matching) : Math.max(...candidates);
    return { timestamp, allDay };
  } catch {
    return null;
  }
}

function parseIcs(source) {
  const unfolded = source.replace(/\r?\n[ \t]/g, '');
  if (!/(?:^|\r?\n)BEGIN:VCALENDAR(?:\r?\n|$)/.test(unfolded)
    || !/(?:^|\r?\n)END:VCALENDAR(?:\r?\n|$)/.test(unfolded)) {
    throw new Error('Ungültige Kalenderdatei');
  }
  const zone = unfolded.match(/(?:^|\r?\n)X-WR-TIMEZONE:([^\r\n]+)/i);
  const fallbackZone = zone ? zone[1].trim() : 'Europe/Berlin';
  const decode = (value) => value.trim().replace(/\\([nN,;\\])/g, (_, character) => character.toLowerCase() === 'n' ? '\n' : character);
  return [...unfolded.matchAll(/BEGIN\\?:VEVENT\r?\n([\s\S]*?)END\\?:VEVENT/g)].map(([, block]) => {
    const properties = new Map();
    block.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^([A-Z][A-Z0-9-]*)(;[^:]*)?:([^\r\n]*)$/i);
      if (match) properties.set(match[1].toUpperCase(), { params: match[2] || '', value: match[3].trim() });
    });
    const value = (name) => decode(properties.get(name)?.value || '');
    if (value('STATUS').toUpperCase() === 'CANCELLED') return null;
    const start = parseIcsDate(properties.get('DTSTART'), fallbackZone);
    if (!start) return null;
    const end = parseIcsDate(properties.get('DTEND'), fallbackZone);
    const startsAt = start.timestamp;
    const endsAt = end && end.timestamp > startsAt ? end.timestamp : startsAt + (start.allDay ? 86400000 : 0);
    return {
      date: new Date(startsAt).toISOString().slice(0, 10),
      startsAt,
      endsAt,
      allDay: start.allDay,
      titleDe: value('SUMMARY') || 'Aktivierung',
      titleEn: value('SUMMARY') || 'Activation',
      description: value('DESCRIPTION'),
    };
  }).filter(Boolean).sort((a, b) => a.startsAt - b.startsAt);
}

function eventDetails(event, language) {
  if (event.allDay) return language === 'en' ? 'All day' : 'Ganztägig';
  const locale = language === 'en' ? 'en-GB' : 'de-DE';
  const clock = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const start = clock.format(event.startsAt);
  let end = '';
  if (event.endsAt > event.startsAt) {
    const endDate = new Date(event.endsAt).toISOString().slice(0, 10);
    const day = endDate !== event.date
      ? `${new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: '2-digit' }).format(event.endsAt)} `
      : '';
    end = `–${day}${clock.format(event.endsAt)}`;
  }
  return `${start}${end} · UTC`;
}

function extractBands(description) {
  return [...new Set((description.match(/\b\d+(?:[.,]\d+)?\s*(?:mm|cm|m)\b/gi) || [])
    .map((band) => band.replace(/\s+/g, '').replace(',', '.').toLowerCase()))];
}

function renderNextActivation() {
  const container = document.querySelector('#next-activation');
  if (!container) return;
  const english = document.documentElement.lang === 'en';
  const language = english ? 'en' : 'de';
  let content;
  if (eventsState === 'loading') {
    content = `<p class="next-activation-empty">${english ? 'Loading planned activations…' : 'Geplante Aktivierungen werden geladen…'}</p>`;
  } else if (eventsState === 'error') {
    content = `<p class="next-activation-empty">${english ? 'The calendar could not be loaded. Please try again later.' : 'Der Kalender konnte nicht geladen werden. Bitte versuche es später erneut.'}</p>`;
  } else {
    const now = Date.now();
    const event = events.find((entry) => entry.endsAt > now || entry.startsAt >= now);
    if (!event) {
      content = `<p class="next-activation-empty">${english ? 'No further activation is currently scheduled. Spontaneous activations are also possible.' : 'Aktuell ist keine weitere Aktivierung eingetragen. Auch spontane Aktivierungen sind möglich.'}</p>`;
    } else {
      const ongoing = event.startsAt <= now && event.endsAt > now;
      const date = new Intl.DateTimeFormat(english ? 'en-GB' : 'de-DE', { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }).format(event.startsAt);
      const status = ongoing ? (english ? 'Ongoing calendar event' : 'Laufender Kalendereintrag') : (english ? 'Planned' : 'Geplant');
      const bands = extractBands(event.description);
      content = `<div class="next-activation-info"><p class="next-activation-status">${status}</p><time datetime="${new Date(event.startsAt).toISOString()}">${escapeHtml(date)}</time><h3>${escapeHtml(english ? event.titleEn : event.titleDe)}</h3><p class="next-activation-time">${escapeHtml(eventDetails(event, language))}</p>${bands.length ? `<p class="next-activation-bands">${bands.map((band) => `<span>${escapeHtml(band)}</span>`).join('')}</p>` : ''}</div><a class="next-activation-link" href="#kalender">${english ? 'View the calendar' : 'Zum Kalender'} <span aria-hidden="true">↗</span></a>`;
    }
  }
  if (container.innerHTML !== content) container.innerHTML = content;
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
  const weekdays = language === 'en' ? ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] : ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
  document.querySelector('.calendar-weekdays').innerHTML = weekdays.map((day) => `<span>${day}</span>`).join('');
  document.querySelector('#calendar-month').textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(calendarDate);

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstWeekday }, () => '<span class="calendar-day empty"></span>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayEvents = monthEvents.filter((event) => Number(event.date.slice(-2)) === day);
    const bands = [...new Set(dayEvents.flatMap((event) => extractBands(event.description)))];
    const hasEvent = dayEvents.length > 0;
    const label = [hasEvent ? (language === 'en' ? `${day}, scheduled event` : `${day}, geplanter Termin`) : String(day), ...bands].join(', ');
    const bandLabels = bands.length
      ? `<span class="calendar-bands" aria-hidden="true">${bands.map((band) => `<span>${escapeHtml(band)}</span>`).join('')}</span>`
      : '';
    cells.push(`<span class="calendar-day${hasEvent ? ' has-event' : ''}${bands.length ? ' has-bands' : ''}" aria-label="${escapeHtml(label)}"><span>${day}</span>${bandLabels}</span>`);
  }
  document.querySelector('#calendar-grid').innerHTML = cells.join('');

  document.querySelector('#calendar-events').innerHTML = upcomingEvents.length
    ? upcomingEvents.map((event) => `<article><time datetime="${event.date}">${new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${event.date}T12:00:00`))}</time><div><strong>${escapeHtml(language === 'en' ? event.titleEn : event.titleDe)}</strong><span>${escapeHtml(eventDetails(event, language))}</span>${event.description ? `<p class="event-description">${escapeHtml(event.description)}</p>` : ''}</div></article>`).join('')
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

const cityGallery = document.querySelector('.city-gallery');
const cityTrack = document.querySelector('.city-gallery-track');
const qslImage = document.querySelector('.qsl-card-image');

function syncCityImageHeight() {
  cityGallery.style.setProperty('--city-image-height', getComputedStyle(qslImage).height);
}

new ResizeObserver(syncCityImageHeight).observe(qslImage);
syncCityImageHeight();

function scrollCityGallery(direction) {
  const maxScroll = cityTrack.scrollWidth - cityTrack.clientWidth;
  const current = cityTrack.scrollLeft;
  const positions = [...cityTrack.querySelectorAll('.city-slide')]
    .map((slide) => Math.min(slide.offsetLeft, maxScroll));
  const target = direction > 0
    ? positions.find((position) => position > current + 1) ?? 0
    : positions.reverse().find((position) => position < current - 1) ?? maxScroll;
  cityTrack.scrollTo({
    left: target,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}

document.querySelector('.city-gallery-prev').addEventListener('click', () => scrollCityGallery(-1));
document.querySelector('.city-gallery-next').addEventListener('click', () => scrollCityGallery(1));
cityTrack.addEventListener('keydown', (event) => {
  if (event.target === cityTrack && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
    scrollCityGallery(event.key === 'ArrowRight' ? 1 : -1);
  }
});

// Keep the next-activation card current when a page remains open.
window.setInterval(renderNextActivation, 60000);
