(() => {
  const gallery = document.querySelector('.city-gallery-track');
  const dialog = document.querySelector('#gallery-lightbox');
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

  const image = dialog.querySelector('#lightbox-image');
  const title = dialog.querySelector('#lightbox-title');
  const description = dialog.querySelector('#lightbox-description');
  const source = dialog.querySelector('#lightbox-source');
  const counter = dialog.querySelector('#lightbox-counter');
  const announcement = dialog.querySelector('#lightbox-announcement');
  const imageState = dialog.querySelector('#lightbox-image-state');
  const previous = dialog.querySelector('.lightbox-prev');
  const next = dialog.querySelector('.lightbox-next');
  const close = dialog.querySelector('.lightbox-close');
  let activeIndex = 0;
  let opener;

  const slides = () => [...gallery.querySelectorAll('.city-slide')];
  const english = () => document.documentElement.lang === 'en';

  function localizedText(element, de, en) {
    element.dataset.de = de;
    element.dataset.en = en;
    element.textContent = english() ? en : de;
  }

  function copyCaption(target, original) {
    target.hidden = !original;
    localizedText(target, original?.dataset.de || original?.textContent || '', original?.dataset.en || original?.textContent || '');
  }

  function render(index) {
    const items = slides();
    if (!items.length) return;
    activeIndex = (index + items.length) % items.length;
    const slide = items[activeIndex];
    const original = slide.querySelector('img');
    if (!original) return;

    copyCaption(title, slide.querySelector('figcaption h4'));
    copyCaption(description, slide.querySelector('figcaption p'));
    const credit = slide.querySelector('figcaption a');
    copyCaption(source, credit);
    if (credit) source.href = credit.href;
    counter.textContent = `${activeIndex + 1} / ${items.length}`;
    localizedText(announcement, `Bild ${activeIndex + 1} von ${items.length}: ${title.dataset.de}`, `Image ${activeIndex + 1} of ${items.length}: ${title.dataset.en}`);
    previous.disabled = next.disabled = items.length < 2;

    image.hidden = true;
    imageState.hidden = false;
    localizedText(imageState, 'Bild wird geladen…', 'Loading image…');
    image.dataset.altDe = original.dataset.altDe || original.alt;
    image.dataset.altEn = original.dataset.altEn || original.alt;
    image.alt = english() ? image.dataset.altEn : image.dataset.altDe;
    image.src = original.dataset.fullSrc || original.currentSrc || original.src;
    if (image.complete && image.naturalWidth) {
      image.hidden = false;
      imageState.hidden = true;
    }
  }

  image.addEventListener('load', () => {
    image.hidden = false;
    imageState.hidden = true;
  });
  image.addEventListener('error', () => {
    image.hidden = true;
    imageState.hidden = false;
    localizedText(imageState, 'Das Bild konnte nicht geladen werden.', 'The image could not be loaded.');
  });

  slides().forEach((slide) => {
    const original = slide.querySelector('img');
    if (!original || original.closest('.city-image-trigger')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'city-image-trigger';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'gallery-lightbox');
    original.before(button);
    button.append(original);
    const label = document.createElement('span');
    label.className = 'city-image-zoom';
    localizedText(label, 'Vergrößern', 'Enlarge');
    button.append(label);
  });

  gallery.addEventListener('click', (event) => {
    const trigger = event.target.closest('.city-image-trigger');
    if (!trigger || !gallery.contains(trigger)) return;
    const index = slides().indexOf(trigger.closest('.city-slide'));
    if (index < 0) return;
    opener = trigger;
    render(index);
    dialog.showModal();
    document.body.classList.add('lightbox-open');
  });

  previous.addEventListener('click', () => render(activeIndex - 1));
  next.addEventListener('click', () => render(activeIndex + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      render(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
})();
