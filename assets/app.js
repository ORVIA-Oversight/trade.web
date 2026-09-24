(() => {
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navToggle = $('.nav-toggle');
  const nav = $('#primary-nav');
  let lastFocus = null;

  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#primary-nav a').forEach(a => a.addEventListener('click', () => {
    nav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  const openDialog = dialog => {
    if (!dialog) return;
    lastFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('modal-open');
  };
  const closeDialog = dialog => {
    if (!dialog?.open) return;
    dialog.close();
  };
  $$('dialog').forEach(dialog => {
    $$('.modal-close,.modal-ok', dialog).forEach(btn => btn.addEventListener('click', () => closeDialog(dialog)));
    dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(dialog); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      lastFocus?.focus?.();
    });
  });

  const demoDialog = $('#demo-dialog');
  $$('.demo-action').forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.demoAction;
    $('#demo-dialog-copy').textContent = action === 'whatsapp'
      ? 'This is a demonstration business. In a live customer build, this button would message the business directly on its verified WhatsApp number.'
      : 'This is a demonstration business. In a live customer build, this button would call the business directly.';
    openDialog(demoDialog);
  }));

  $$('.service-choice').forEach(btn => btn.addEventListener('click', () => {
    const select = $('#jobType');
    select.value = btn.dataset.job;
    $('#quote').scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth'});
    setTimeout(() => select.focus(), reducedMotion ? 0 : 450);
  }));

  const postcodeDialog = $('#postcode-dialog');
  $('.postcode-trigger')?.addEventListener('click', () => openDialog(postcodeDialog));
  const postcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i;
  const normalisePostcode = value => value.trim().toUpperCase().replace(/\s+/g, '').replace(/(.+)(\d[A-Z]{2})$/, '$1 $2');
  $('#postcode-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#postcode-check');
    const err = $('#postcode-check-error');
    const result = $('#postcode-result');
    const value = normalisePostcode(input.value);
    if (!postcodeRegex.test(value)) {
      err.textContent = 'Enter a valid UK postcode format.';
      result.hidden = true;
      input.classList.add('input-error');
      input.focus();
      return;
    }
    input.value = value;
    input.classList.remove('input-error');
    err.textContent = '';
    $('#postcode-result-title').textContent = `${value} — DEMONSTRATION SERVICE AREA`;
    $('#postcode-result-copy').textContent = 'In a live customer build, this can check whether a customer is inside your actual service area before the enquiry is submitted.';
    result.hidden = false;
  });

  /* Accessible project lightbox with previous/next and touch swipe. */
  const lightbox = $('#lightbox');
  const workCards = $$('.work-card[data-lightbox]');
  let lightboxIndex = 0;
  let touchStartX = 0;
  const renderLightbox = index => {
    if (!workCards.length) return;
    lightboxIndex = (index + workCards.length) % workCards.length;
    const card = workCards[lightboxIndex];
    const image = $('#lightbox-image');
    image.src = card.dataset.image;
    image.alt = `${card.dataset.lightbox} demonstration project image`;
    $('#lightbox-title').textContent = card.dataset.lightbox;
    $('#lightbox-description').textContent = card.dataset.description || 'Licensed demonstration photography — not a Harrison project.';
  };
  workCards.forEach((card, index) => card.addEventListener('click', () => {
    renderLightbox(index);
    openDialog(lightbox);
  }));
  $('.lightbox-prev')?.addEventListener('click', () => renderLightbox(lightboxIndex - 1));
  $('.lightbox-next')?.addEventListener('click', () => renderLightbox(lightboxIndex + 1));
  lightbox?.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); renderLightbox(lightboxIndex - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); renderLightbox(lightboxIndex + 1); }
  });
  $('.lightbox-media')?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0]?.clientX || 0; }, {passive:true});
  $('.lightbox-media')?.addEventListener('touchend', e => {
    const dx = (e.changedTouches[0]?.clientX || 0) - touchStartX;
    if (Math.abs(dx) > 55) renderLightbox(lightboxIndex + (dx < 0 ? 1 : -1));
  }, {passive:true});

  const form = $('#quote-form');
  const photoInput = $('#photos');
  const maxPhotoSize = 5 * 1024 * 1024;
  const allowedTypes = ['image/jpeg','image/png','image/webp'];
  let previewUrls = [];

  const getFiles = () => [...(photoInput?.files || [])];
  const validatePhotos = () => {
    const files = getFiles();
    if (files.length > 4) return 'Please choose no more than 4 images.';
    if (files.some(f => !allowedTypes.includes(f.type))) return 'Use JPG, JPEG, PNG or WEBP images only.';
    if (files.some(f => f.size > maxPhotoSize)) return 'Each image must be 5 MB or smaller.';
    return '';
  };
  const clearPreviewUrls = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    previewUrls = [];
  };
  const renderPhotoPreviews = () => {
    const list = $('#photo-list');
    if (!list) return;
    clearPreviewUrls();
    const files = getFiles();
    list.innerHTML = '';
    files.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      previewUrls.push(url);
      const item = document.createElement('div');
      item.className = 'photo-preview';
      item.innerHTML = `<img src="${url}" alt="Preview of selected image ${index + 1}" /><div class="photo-preview__meta"><span title="${file.name.replace(/"/g,'&quot;')}">${file.name}</span><button class="photo-remove" type="button" data-remove-photo="${index}" aria-label="Remove ${file.name}">×</button></div>`;
      list.appendChild(item);
    });
  };
  const removePhotoAt = index => {
    const files = getFiles();
    files.splice(index, 1);
    const transfer = new DataTransfer();
    files.forEach(file => transfer.items.add(file));
    photoInput.files = transfer.files;
    $('#photos-error').textContent = validatePhotos();
    renderPhotoPreviews();
  };
  photoInput?.addEventListener('change', () => {
    $('#photos-error').textContent = validatePhotos();
    renderPhotoPreviews();
  });
  $('#photo-list')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-photo]');
    if (btn) removePhotoAt(Number(btn.dataset.removePhoto));
  });

  const fields = ['fullName','phone','email','postcode','jobType','urgency','details'];
  const setError = (id, message) => {
    const el = $('#' + id);
    const err = $('#' + id + '-error');
    if (err) err.textContent = message || '';
    el?.classList.toggle('input-error', Boolean(message));
    el?.setAttribute('aria-invalid', message ? 'true' : 'false');
  };
  const validate = () => {
    const errors = [];
    const values = Object.fromEntries(fields.map(id => [id, $('#' + id)?.value.trim() || '']));
    fields.forEach(id => setError(id,''));
    if (!values.fullName) { setError('fullName','Enter your name.'); errors.push(['fullName','Full name']); }
    if (!values.phone || values.phone.replace(/\D/g,'').length < 7) { setError('phone','Enter a valid phone number.'); errors.push(['phone','Phone']); }
    if (!/^\S+@\S+\.\S+$/.test(values.email)) { setError('email','Enter a valid email address.'); errors.push(['email','Email']); }
    if (!postcodeRegex.test(values.postcode)) { setError('postcode','Enter a valid UK postcode format.'); errors.push(['postcode','Postcode']); }
    if (!values.jobType) { setError('jobType','Choose a job type.'); errors.push(['jobType','Job type']); }
    if (!values.urgency) { setError('urgency','Choose an urgency.'); errors.push(['urgency','Urgency']); }
    if (values.details.length < 10) { setError('details','Please give a little more detail (at least 10 characters).'); errors.push(['details','Job details']); }
    const photoError = validatePhotos();
    $('#photos-error').textContent = photoError;
    if (photoError) errors.push(['photos','Photographs']);
    return {errors, values};
  };
  const makeReference = () => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return 'HHP-DEMO-' + String(1000 + (arr[0] % 9000));
  };
  const saveDemoEnquiry = data => {
    const enquiries = JSON.parse(sessionStorage.getItem('hhp-demo-enquiries') || '[]');
    enquiries.unshift(data);
    sessionStorage.setItem('hhp-demo-enquiries', JSON.stringify(enquiries.slice(0,8)));
  };

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const {errors, values} = validate();
    const summary = $('#form-errors');
    if (errors.length) {
      summary.hidden = false;
      summary.innerHTML = '<strong>Please check the following:</strong><ul>' + errors.map(([id,label]) => `<li><a href="#${id}">${label}</a></li>`).join('') + '</ul>';
      summary.focus();
      $('#form-status').textContent = 'There are errors in the form.';
      return;
    }
    summary.hidden = true;
    const submit = $('.submit-btn');
    submit.classList.add('loading');
    submit.setAttribute('aria-busy','true');
    $('#form-status').textContent = 'Submitting demonstration enquiry.';
    const ref = makeReference();
    const files = getFiles();
    const record = {
      ref,
      fullName: values.fullName,
      displayName: values.fullName.split(/\s+/).map((part,i) => i === 0 ? part : part.charAt(0) + '.').join(' '),
      phone: values.phone,
      email: values.email,
      postcode: normalisePostcode(values.postcode),
      jobType: values.jobType,
      urgency: values.urgency,
      details: values.details,
      callback: $('#callback').value,
      photoCount: files.length,
      photoNames: files.map(f => f.name),
      receivedAt: new Date().toISOString(),
      status: 'NEW'
    };
    setTimeout(() => {
      saveDemoEnquiry(record);
      submit.classList.remove('loading');
      submit.removeAttribute('aria-busy');
      form.hidden = true;
      $('#success-ref').textContent = ref;
      const panel = $('#success-panel');
      panel.hidden = false;
      panel.focus();
      $('#form-status').textContent = `Demonstration enquiry ${ref} created.`;
    }, 650);
  });

  $('#reset-demo')?.addEventListener('click', () => {
    form.reset();
    clearPreviewUrls();
    $('#photo-list').innerHTML = '';
    $('#form-errors').hidden = true;
    fields.forEach(id => setError(id,''));
    $('#photos-error').textContent = '';
    form.hidden = false;
    $('#success-panel').hidden = true;
    form.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'center'});
  });
})();
