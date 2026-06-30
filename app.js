// ═══════════════════════════════════════════════════════════════
// Ya Qalbi — App Module
// Handles all data operations: gallery upload, timeline CRUD,
// home edits. Requires auth/login.js to be loaded first.
// ═══════════════════════════════════════════════════════════════

// ─── Supabase client (reads config from login.js) ────────────
function getSupabase() {
  return window._supabase;
}

// ─── Init Supabase client once ───────────────────────────────
function initSupabase() {
  if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

// ══════════════════════════════════════════════════════════════
// GALLERY
// ══════════════════════════════════════════════════════════════

let currentFilter = 'all';

// Load and render gallery from Supabase (or local state)
async function loadGallery() {
  const grid  = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const sb    = getSupabase();

  let items = [];

  if (sb) {
    let query = sb.from('media').select('*').order('created_at', { ascending: false });
    if (currentFilter !== 'all') query = query.eq('category', currentFilter);
    const { data } = await query;
    items = data || [];
  } else {
    // Local state fallback
    items = (window._localMedia || []).filter(m => currentFilter === 'all' || m.category === currentFilter);
  }

  grid.innerHTML = '';

  if (items.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'masonry-item group relative overflow-hidden rounded-[2rem] bg-surface-container-low transition-all duration-500 hover:shadow-2xl';
    div.dataset.id = item.id;

    const isVideo = item.file_type === 'video';
    const media   = isVideo
      ? `<video class="w-full h-auto object-cover" src="${item.file_url}" muted playsinline></video>`
      : `<img class="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110 loading" src="${item.file_url}" alt="${item.title || ''}" onload="this.classList.remove('loading');this.classList.add('loaded');"/>`;

    const partnerBtns = isPartner()
      ? `<div class="absolute top-3 right-3 flex gap-1 z-20">
           <button onclick="openEditMemory('${item.id}')" class="w-8 h-8 bg-black/40 hover:bg-primary text-white rounded-full flex items-center justify-center transition-colors">
             <span class="material-symbols-outlined text-[16px]">edit</span>
           </button>
           <button onclick="deleteMemory('${item.id}')" class="w-8 h-8 bg-black/40 hover:bg-error text-white rounded-full flex items-center justify-center transition-colors">
             <span class="material-symbols-outlined text-[16px]">delete</span>
           </button>
         </div>`
      : '';

    div.innerHTML = `
      ${media}
      ${partnerBtns}
      <div class="reveal-on-hover absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
        <span class="text-white/80 font-label-sm mb-1 uppercase tracking-wider">${item.category || ''}</span>
        <h3 class="text-white font-headline-md">${item.title || ''}</h3>
        ${item.caption ? `<p class="text-white/70 font-body-md text-sm mt-1">${item.caption}</p>` : ''}
      </div>`;

    grid.appendChild(div);
  });

  // Re-attach hover z-index
  grid.querySelectorAll('.masonry-item').forEach(el => {
    el.addEventListener('mouseenter', () => el.style.zIndex = '10');
    el.addEventListener('mouseleave', () => el.style.zIndex = '1');
  });
}

// Delete a memory
async function deleteMemory(id) {
  if (!confirm('Remove this memory?')) return;
  const sb = getSupabase();

  if (sb) {
    // Get file path first
    const { data } = await sb.from('media').select('file_url').eq('id', id).single();
    if (data?.file_url) {
      const path = data.file_url.split('/media/')[1];
      await sb.storage.from('media').remove([path]);
    }
    await sb.from('media').delete().eq('id', id);
  } else {
    window._localMedia = (window._localMedia || []).filter(m => m.id !== id);
  }

  loadGallery();
}

// Open upload modal
function openUploadModal() {
  // Reset to "add" mode
  document.getElementById('upload-edit-id').value       = '';
  document.getElementById('upload-modal-title').textContent = 'Add a Memory';
  document.getElementById('btn-upload-submit').textContent  = 'Save Memory';
  document.getElementById('upload-file-row').style.display  = '';
  document.getElementById('upload-file-row').querySelector('label').textContent = 'Photo or Video *';
  document.getElementById('upload-current-preview').classList.add('hidden');
  document.getElementById('upload-form').reset();
  document.getElementById('upload-preview').innerHTML = '';
  document.getElementById('upload-modal').classList.add('open');
}

function openEditMemory(id) {
  // Find the item from local cache or Supabase
  const sb = getSupabase();
  const _populate = (item) => {
    if (!item) return;
    document.getElementById('upload-edit-id').value          = item.id;
    document.getElementById('upload-modal-title').textContent = 'Edit Memory';
    document.getElementById('btn-upload-submit').textContent  = 'Save Changes';
    // File input becomes optional in edit mode — relabel it
    document.getElementById('upload-file-row').style.display = '';
    document.getElementById('upload-file-row').querySelector('label').textContent = 'Replace Photo / Video (optional)';
    // Show current media
    const curPreview = document.getElementById('upload-current-preview');
    const curImg     = document.getElementById('upload-current-img');
    if (item.file_url) {
      curPreview.classList.remove('hidden');
      if (item.file_type === 'video') {
        curImg.innerHTML = `<video src="${item.file_url}" class="w-full rounded-xl max-h-48 object-cover" muted playsinline></video>`;
      } else {
        curImg.innerHTML = `<img src="${item.file_url}" class="w-full rounded-xl max-h-48 object-cover"/>`;
      }
    }
    // Pre-fill fields
    document.getElementById('upload-title').value    = item.title    || '';
    document.getElementById('upload-caption').value  = item.caption  || '';
    document.getElementById('upload-category').value = item.category || 'everyday';
    document.getElementById('upload-date').value     = item.taken_at || '';
    document.getElementById('upload-preview').innerHTML = '';
    document.getElementById('upload-modal').classList.add('open');
  };

  if (sb) {
    sb.from('media').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => _populate(data));
  } else {
    const item = (window._localMedia || []).find(m => m.id === id);
    _populate(item);
  }
}

function closeUploadModal() {
  document.getElementById('upload-modal').classList.remove('open');
  _pendingGalleryImage = null;
  // Full reset so next open is clean
  document.getElementById('upload-edit-id').value           = '';
  document.getElementById('upload-modal-title').textContent = 'Add a Memory';
  document.getElementById('btn-upload-submit').textContent  = 'Save Memory';
  document.getElementById('upload-file-row').style.display  = '';
  document.getElementById('upload-current-preview').classList.add('hidden');
  document.getElementById('upload-form').reset();
  document.getElementById('upload-preview').innerHTML       = '';
}

// ── Image loading skeleton helper ───────────────────────────
// Wraps an img element with a loading skeleton that shows while loading
function setupImageLoading(img) {
  if (!img || img.complete) {
    if (img) img.classList.add('loaded');
    return;
  }
  
  // Add loading class
  img.classList.add('loading');
  
  // Show image when loaded
  img.onload = () => {
    img.classList.remove('loading');
    img.classList.add('loaded');
  };
  
  // Handle error
  img.onerror = () => {
    img.classList.remove('loading');
    img.classList.add('loaded');
  };
}

// ── Setup loading for all images in a container ───────────────
function setupImagesInContainer(container) {
  if (!container) return;
  const images = container.querySelectorAll('img');
  images.forEach(img => setupImageLoading(img));
}

// ── Image compression utility ───────────────────────────────
// Compresses images to reduce file size while maintaining quality
// Settings: max 1920px width, 80% JPEG quality
async function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate dimensions (max 1920px width, maintain aspect ratio)
      const maxWidth = 1920;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          const baseName = file.name.replace(/\.[^/.]+$/, '.jpg');
          resolve(new File([blob], baseName, { type: 'image/jpeg' }));
        } else {
          resolve(file); // Fallback to original if compression fails
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.onerror = () => resolve(file); // Fallback on error
    reader.readAsDataURL(file);
  });
}

// ── HEIC → JPEG conversion + compression utility ───────────────
// Returns a File object ready to use everywhere (upload, preview, etc.)
// If the file is not HEIC/HEIF, compresses it directly.
async function normaliseImageFile(file) {
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
                 /\.(heic|heif)$/i.test(file.name);
  
  if (isHeic) {
    if (typeof heic2any === 'undefined') {
      alert('HEIC conversion library not loaded. Please refresh and try again.');
      return null;
    }

    try {
      const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.88 });
      const converted = Array.isArray(blob) ? blob[0] : blob;
      const baseName  = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      const heicFile = new File([converted], baseName, { type: 'image/jpeg' });
      // Compress after HEIC conversion
      return await compressImage(heicFile);
    } catch (err) {
      console.error('HEIC conversion failed:', err);
      alert('Could not convert HEIC photo. Please export it as JPEG from Photos and try again.');
      return null;
    }
  }
  
  // Not HEIC - compress directly
  return await compressImage(file);
}

// Holds the normalised file for gallery upload
let _pendingGalleryImage = null;

// Preview selected file
async function previewFile(input) {
  const raw     = input.files[0];
  const preview = document.getElementById('upload-preview');
  if (!raw) { preview.innerHTML = ''; _pendingGalleryImage = null; return; }

  if (raw.type.startsWith('video')) {
    _pendingGalleryImage = null;
    preview.innerHTML = `<video src="${URL.createObjectURL(raw)}" controls class="w-full rounded-xl max-h-48 object-cover"></video>`;
    return;
  }

  const file = await normaliseImageFile(raw);
  if (!file) { preview.innerHTML = ''; _pendingGalleryImage = null; return; }

  _pendingGalleryImage = file;
  preview.innerHTML = `<img src="${URL.createObjectURL(file)}" class="w-full rounded-xl max-h-48 object-cover"/>`;
}

// Submit upload
async function submitUpload() {
  const editId   = document.getElementById('upload-edit-id').value.trim();
  // Use pending converted image if available, fall back to raw input file
  const rawFile  = document.getElementById('upload-file').files[0];
  const file     = _pendingGalleryImage || (rawFile && !rawFile.type.startsWith('video') ? rawFile : rawFile);
  const title    = document.getElementById('upload-title').value.trim();
  const caption  = document.getElementById('upload-caption').value.trim();
  const category = document.getElementById('upload-category').value;
  const takenAt  = document.getElementById('upload-date').value;
  const btn      = document.getElementById('btn-upload-submit');

  const isEdit = !!editId;

  // File is required only when adding a new memory
  if (!isEdit && !file) { alert('Please select a file.'); return; }

  btn.disabled = true;
  btn.textContent = isEdit ? 'Saving…' : 'Uploading…';

  const sb = getSupabase();

  if (sb) {
    let publicUrl = null;

    // ── Upload new file if provided ─────────────────────────────
    if (file) {
      const ext  = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await sb.storage
        .from('media').upload(path, file, { upsert: false });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        alert('Upload failed: ' + uploadError.message);
        btn.disabled = false;
        btn.textContent = isEdit ? 'Save Changes' : 'Save Memory';
        return;
      }
      const { data: urlData } = sb.storage.from('media').getPublicUrl(path);
      publicUrl = urlData?.publicUrl;
    }

    if (isEdit) {
      // ── Edit existing record ──────────────────────────────────
      const updates = {
        title:    title   || null,
        caption:  caption || null,
        category: category || 'everyday',
        taken_at: takenAt  || null,
      };
      if (publicUrl) {
        updates.file_url  = publicUrl;
        updates.file_type = file.type.startsWith('video') ? 'video' : 'photo';
      }

      const { error: updateError } = await sb.from('media')
        .update(updates).eq('id', editId);

      if (updateError) {
        console.error('Media update error:', updateError);
        alert('Could not save changes: ' + updateError.message);
        btn.disabled = false;
        btn.textContent = 'Save Changes';
        return;
      }

    } else {
      // ── Insert new record ─────────────────────────────────────
      if (!publicUrl) {
        alert('Could not get file URL after upload.');
        btn.disabled = false;
        btn.textContent = 'Save Memory';
        return;
      }
      const { error: insertError } = await sb.from('media').insert({
        file_url:  publicUrl,
        file_type: file.type.startsWith('video') ? 'video' : 'photo',
        category:  category || 'everyday',
        title:     title   || null,
        caption:   caption || null,
        taken_at:  takenAt || null,
      });

      if (insertError) {
        console.error('Media insert error:', insertError);
        alert('Photo uploaded but could not save record: ' + insertError.message);
        btn.disabled = false;
        btn.textContent = 'Save Memory';
        return;
      }
    }

  } else {
    // ── Local fallback ────────────────────────────────────────
    window._localMedia = window._localMedia || [];
    if (isEdit) {
      window._localMedia = window._localMedia.map(m =>
        m.id === editId ? {
          ...m,
          title:    title   || null,
          caption:  caption || null,
          category: category || 'everyday',
          taken_at: takenAt  || null,
          ...(file ? {
            file_url:  URL.createObjectURL(file),
            file_type: file.type.startsWith('video') ? 'video' : 'photo',
          } : {})
        } : m
      );
    } else {
      window._localMedia.unshift({
        id:        crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        file_url:  URL.createObjectURL(file),
        file_type: file.type.startsWith('video') ? 'video' : 'photo',
        category:  category || 'everyday',
        title:     title   || null,
        caption:   caption || null,
      });
    }
  }

  btn.disabled = false;
  btn.textContent = isEdit ? 'Save Changes' : 'Save Memory';
  closeUploadModal();
  loadGallery();
  loadRecentMemory();
}

// ══════════════════════════════════════════════════════════════
// TIMELINE
// ══════════════════════════════════════════════════════════════

let timelineEntries = [];

async function loadTimeline() {
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from('timeline_events').select('*').order('event_date', { ascending: true });
    timelineEntries = data || [];
  }
  // Static entries stay in HTML; only dynamic ones are appended
  renderDynamicTimeline();
}

function renderDynamicTimeline() {
  const container = document.getElementById('timeline-dynamic');
  const empty     = document.getElementById('timeline-empty');
  if (!container) return;

  // Remove all entries except the empty state
  Array.from(container.children).forEach(c => {
    if (c.id !== 'timeline-empty') c.remove();
  });

  if (timelineEntries.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  // Sort by event_date ascending
  const sorted = [...timelineEntries].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  sorted.forEach((entry, i) => {
    const isLeft = i % 2 === 0;
    const div = document.createElement('div');
    div.className = 'relative flex flex-col md:flex-row items-center md:items-start group reveal-on-scroll';
    div.dataset.id = entry.id;

    const formattedDate = entry.event_date
      ? new Date(entry.event_date + 'T00:00:00').toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      : '';

    const coverImg = entry.cover_image
      ? `<img src="${entry.cover_image}" class="w-full rounded-lg object-cover max-h-56 loading" onload="this.classList.remove('loading');this.classList.add('loaded');"/>`
      : `<div class="relative aspect-video rounded-lg bg-surface-container-high flex items-center justify-center shadow-md"><span class="material-symbols-outlined text-3xl text-outline-variant">photo_camera</span></div>`;

    const editBtns = isPartner()
      ? `<div class="flex gap-2 mt-4 ${isLeft ? 'md:justify-end' : ''}">
           <button onclick="openEditTimeline('${entry.id}')" class="px-4 py-1 rounded-full border border-outline text-secondary font-label-sm hover:border-primary hover:text-primary transition-colors text-sm">Edit</button>
           <button onclick="deleteTimeline('${entry.id}')" class="px-4 py-1 rounded-full border border-error/40 text-error font-label-sm hover:bg-error hover:text-white transition-colors text-sm">Delete</button>
         </div>`
      : '';

    const card = `
      <div class="glass-card p-8 rounded-xl hover:shadow-xl transition-all duration-500 border border-outline-variant/20">
        <span class="font-label-sm text-tertiary uppercase mb-2 block">${formattedDate}</span>
        <h3 class="font-headline-md text-headline-md text-primary mb-4">${entry.title}</h3>
        ${entry.description ? `<p class="font-body-md text-on-surface-variant mb-6">${entry.description}</p>` : ''}
        ${coverImg}
        ${editBtns}
      </div>`;

    div.innerHTML = isLeft
      ? `<div class="flex-1 md:text-right md:pr-16 order-2 md:order-1">${card}</div>
         <div class="absolute left-1/2 top-10 -translate-x-1/2 w-4 h-4 bg-primary border-4 border-surface rounded-full z-10 hidden md:block group-hover:scale-150 transition-transform duration-300"></div>
         <div class="flex-1 hidden md:block order-3"></div>`
      : `<div class="flex-1 hidden md:block order-1"></div>
         <div class="absolute left-1/2 top-10 -translate-x-1/2 w-4 h-4 bg-primary border-4 border-surface rounded-full z-10 hidden md:block group-hover:scale-150 transition-transform duration-300"></div>
         <div class="flex-1 md:pl-16 order-2">${card}</div>`;

    container.appendChild(div);
  });

  initScrollReveal();
}

// Holds the normalised (possibly HEIC→JPEG converted) file for timeline upload
let _pendingTimelineImage = null;

function openAddTimeline() {
  document.getElementById('timeline-modal-title').textContent = 'Add Milestone';
  document.getElementById('timeline-entry-id').value = '';
  document.getElementById('timeline-form').reset();
  clearTimelineImage();
  document.getElementById('timeline-modal').classList.add('open');
}

async function previewTimelineImage(input) {
  const raw = input.files[0];
  const preview    = document.getElementById('tl-image-preview');
  const previewImg = document.getElementById('tl-image-preview-img');
  const labelText  = document.getElementById('tl-image-label-text');
  if (!raw) { clearTimelineImage(); return; }

  // Show a loading state while converting
  if (labelText) labelText.textContent = 'Converting…';

  const file = await normaliseImageFile(raw);
  if (!file) { clearTimelineImage(); return; }

  // Store converted file — submitTimeline reads from here
  _pendingTimelineImage = file;

  previewImg.src = URL.createObjectURL(file);
  preview.classList.remove('hidden');
  if (labelText) labelText.textContent = file.name;
}

function clearTimelineImage() {
  _pendingTimelineImage = null;
  const input      = document.getElementById('tl-image');
  const preview    = document.getElementById('tl-image-preview');
  const previewImg = document.getElementById('tl-image-preview-img');
  const labelText  = document.getElementById('tl-image-label-text');
  if (input)      input.value = '';
  if (previewImg) previewImg.src = '';
  if (preview)    preview.classList.add('hidden');
  if (labelText)  labelText.textContent = 'Choose a photo…';
}

function openEditTimeline(id) {
  const entry = timelineEntries.find(e => e.id === id);
  if (!entry) return;
  document.getElementById('timeline-modal-title').textContent = 'Edit Milestone';
  document.getElementById('timeline-entry-id').value  = id;
  document.getElementById('tl-title').value       = entry.title || '';
  document.getElementById('tl-description').value = entry.description || '';
  document.getElementById('tl-date').value        = entry.event_date || '';
  document.getElementById('timeline-modal').classList.add('open');
}

function closeTimelineModal() {
  document.getElementById('timeline-modal').classList.remove('open');
  clearTimelineImage();
}

async function submitTimeline() {
  const id          = document.getElementById('timeline-entry-id').value;
  const title       = document.getElementById('tl-title').value.trim();
  const description = document.getElementById('tl-description').value.trim();
  const date        = document.getElementById('tl-date').value;
  // Use the stored converted file — avoids DataTransfer/input.files unreliability
  const imageFile   = _pendingTimelineImage || document.getElementById('tl-image').files[0];
  const btn         = document.getElementById('btn-tl-submit');

  if (!title || !date) { alert('Title and date are required.'); return; }

  btn.disabled = true;
  btn.textContent = 'Saving…';

  let cover_image = null;
  const sb = getSupabase();

  if (imageFile) {
    if (sb) {
      // Derive a safe lowercase extension from MIME type first, then filename fallback
      const mimeExt = {
        'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png',
        'image/webp': 'webp', 'image/gif': 'gif',
        'image/heic': 'heic', 'image/heif': 'heif',
        'image/bmp': 'bmp', 'image/svg+xml': 'svg', 'image/tiff': 'tiff'
      };
      const ext  = mimeExt[imageFile.type] || imageFile.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `timeline/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await sb.storage
        .from('media')
        .upload(path, imageFile, { contentType: imageFile.type || 'image/jpeg', upsert: false });

      if (uploadError) {
        console.error('Timeline image upload error:', uploadError);
        alert('Photo upload failed: ' + uploadError.message + '\n\nThe milestone will be saved without a photo.');
      } else {
        const { data: urlData } = sb.storage.from('media').getPublicUrl(path);
        cover_image = urlData?.publicUrl || null;
      }
    } else {
      // No Supabase — use a local object URL (works for this session only)
      cover_image = URL.createObjectURL(imageFile);
    }
  }

  const payload = { title, description, event_date: date, ...(cover_image && { cover_image }) };

  if (sb) {
    if (id) {
      await sb.from('timeline_events').update(payload).eq('id', id);
    } else {
      await sb.from('timeline_events').insert(payload);
    }
    await loadTimeline();
  } else {
    if (id) {
      timelineEntries = timelineEntries.map(e => e.id === id ? { ...e, ...payload } : e);
    } else {
      timelineEntries.push({ id: Date.now().toString(), ...payload });
    }
    renderDynamicTimeline();
  }

  btn.disabled = false;
  btn.textContent = 'Save';
  closeTimelineModal();
}

async function deleteTimeline(id) {
  if (!confirm('Delete this milestone?')) return;
  const sb = getSupabase();
  if (sb) {
    await sb.from('timeline_events').delete().eq('id', id);
    await loadTimeline();
  } else {
    timelineEntries = timelineEntries.filter(e => e.id !== id);
    renderDynamicTimeline();
  }
}

// ══════════════════════════════════════════════════════════════
// HOME IMAGE CHANGES
// ══════════════════════════════════════════════════════════════

async function changeHomeImage(targetId, input) {
  const raw = input.files[0];
  if (!raw) return;

  const file = await normaliseImageFile(raw);
  if (!file) return;

  const url = URL.createObjectURL(file);
  const el  = document.getElementById(targetId);
  if (!el) return;
  el.style.backgroundImage = `url('${url}')`;
  const icon = el.querySelector('.material-symbols-outlined');
  if (icon) icon.style.display = 'none';
  const reader = new FileReader();
  reader.onload = e => localStorage.setItem('home_img_' + targetId, e.target.result);
  reader.readAsDataURL(file);
}

function loadHomeImages() {
  ['hero-bg', 'bento-featured-bg'].forEach(id => {
    const saved = localStorage.getItem('home_img_' + id);
    const el    = document.getElementById(id);
    if (saved && el) {
      // Add loading state
      el.classList.add('loading');
      
      // Create image to preload
      const img = new Image();
      img.onload = () => {
        el.style.backgroundImage = `url('${saved}')`;
        el.classList.remove('loading');
        el.classList.add('loaded');
        const icon = el.querySelector('.material-symbols-outlined');
        if (icon) icon.style.display = 'none';
      };
      img.src = saved;
    }
  });
}

// ══════════════════════════════════════════════════════════════
// DAYS TOGETHER COUNTER
// ══════════════════════════════════════════════════════════════

function updateDaysTogether() {
  const origin = new Date(2026, 5, 26); // June 26 2026
  const now    = new Date();
  const diff   = Math.floor((now - origin) / 86400000);
  const el     = document.getElementById('days-together');
  if (el) el.textContent = Math.max(0, diff).toLocaleString();
}

// ══════════════════════════════════════════════════════════════
// LOVE LETTER
// ══════════════════════════════════════════════════════════════

function loadLoveLetter() {
  // No-op - Love Letter section removed from home page
}

function saveLoveLetter() {
  // No-op - Love Letter section removed from home page
}

// ══════════════════════════════════════════════════════════════
// OUR SONGS  — persisted in Supabase `settings` table
// key: 'our_songs'  |  value: JSON string array [{ id, title, artist, embed }]
// Falls back to localStorage when Supabase is unavailable.
// ══════════════════════════════════════════════════════════════

// Extract Spotify track ID from a share link or embed URL
function extractSpotifyId(input) {
  if (!input) return null;
  const m = input.match(/spotify\.com\/(?:embed\/)?track\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

// ── Internal: read from Supabase or localStorage ─────────────
async function _fetchSongs() {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('settings')
      .select('value')
      .eq('key', 'our_songs')
      .maybeSingle();
    if (!error && data) {
      try { return JSON.parse(data.value); } catch { /* bad json */ }
    }
  }
  // fallback
  return JSON.parse(localStorage.getItem('ya-qalbi-songs') || '[]');
}

// ── Internal: write to Supabase and mirror to localStorage ───
async function _persistSongs(songs) {
  const json = JSON.stringify(songs);
  localStorage.setItem('ya-qalbi-songs', json);          // always mirror
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb
      .from('settings')
      .upsert({ key: 'our_songs', value: json, updated_at: new Date().toISOString() },
               { onConflict: 'key' });
    if (error) console.warn('Song save error:', error.message);
  }
}

// ── Render the song list ──────────────────────────────────────
function _renderSongs(songs) {
  const listEl = document.getElementById('song-list');
  const emptyEl = document.getElementById('song-empty');
  
  if (!listEl) return;

  if (!songs || songs.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    listEl.innerHTML = '';
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  listEl.innerHTML = '';

  songs.forEach((song, index) => {
    const spotifyId = extractSpotifyId(song.embed || '');
    const div = document.createElement('div');
    div.className = 'flex items-center gap-4 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group';
    div.innerHTML = `
      <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        <span class="material-symbols-outlined text-[20px]">music_note</span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="font-headline-md text-on-surface truncate">${song.title || '—'}</p>
        <p class="font-body-md text-secondary truncate">${song.artist || ''}</p>
      </div>
      <button onclick="openSongPlayer('${song.id}')"
        class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-110 transition-transform flex-shrink-0"
        aria-label="Play song">
        <span class="material-symbols-outlined text-[18px]">play_arrow</span>
      </button>
      <div data-partner-only class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onclick="editSong('${song.id}')" class="w-8 h-8 rounded-full bg-surface border border-outline-variant/40 flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[16px]">edit</span>
        </button>
        <button onclick="deleteSong('${song.id}')" class="w-8 h-8 rounded-full bg-surface border border-error/40 flex items-center justify-center text-error hover:bg-error hover:text-white transition-colors">
          <span class="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    `;
    listEl.appendChild(div);
  });
}

async function loadSongs() {
  const songs = await _fetchSongs();
  _renderSongs(songs);
}

async function saveSong() {
  const editId   = document.getElementById('song-edit-id')?.value || '';
  const title    = (document.getElementById('song-title-input')?.value  || '').trim();
  const artist   = (document.getElementById('song-artist-input')?.value || '').trim();
  const embed    = (document.getElementById('song-embed-input')?.value  || '').trim();
  if (!title) return;

  const btn = document.querySelector('[onclick="saveSong()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  const songs = await _fetchSongs();
  
  if (editId) {
    // Edit existing
    const index = songs.findIndex(s => s.id === editId);
    if (index !== -1) {
      songs[index] = { ...songs[index], title, artist, embed };
    }
  } else {
    // Add new
    songs.push({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title,
      artist,
      embed
    });
  }

  await _persistSongs(songs);

  if (btn) { btn.disabled = false; btn.textContent = 'Save'; }

  // Clear inputs, reset edit state, hide form
  document.getElementById('song-edit-id').value = '';
  ['song-title-input','song-artist-input','song-embed-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const form = document.getElementById('song-form');
  const cancelBtn = document.getElementById('song-cancel-btn');
  if (form) form.classList.add('hidden');
  if (cancelBtn) cancelBtn.classList.add('hidden');

  await loadSongs();
}

async function editSong(id) {
  const songs = await _fetchSongs();
  const song = songs.find(s => s.id === id);
  if (!song) return;

  document.getElementById('song-edit-id').value = id;
  const ti = document.getElementById('song-title-input');
  const ai = document.getElementById('song-artist-input');
  const ei = document.getElementById('song-embed-input');
  if (ti) ti.value = song.title  || '';
  if (ai) ai.value = song.artist || '';
  if (ei) ei.value = song.embed  || '';

  const actions   = document.getElementById('song-actions');
  const form      = document.getElementById('song-form');
  const cancelBtn = document.getElementById('song-cancel-btn');
  if (actions) { actions.classList.add('hidden'); actions.classList.remove('flex'); }
  if (form)    form.classList.remove('hidden');
  if (cancelBtn) cancelBtn.classList.remove('hidden');
  ti?.focus();
}

function cancelEditSong() {
  document.getElementById('song-edit-id').value = '';
  ['song-title-input','song-artist-input','song-embed-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Hide form and cancel button
  const form = document.getElementById('song-form');
  const cancelBtn = document.getElementById('song-cancel-btn');
  if (form) form.classList.add('hidden');
  if (cancelBtn) cancelBtn.classList.add('hidden');
  loadSongs();
}

async function deleteSong(id) {
  if (!confirm('Remove this song?')) return;
  const songs = await _fetchSongs();
  const filtered = songs.filter(s => s.id !== id);
  await _persistSongs(filtered);
  await loadSongs();
}

async function openSongPlayer(songId) {
  const wrap   = document.getElementById('song-player-wrap');
  const modal  = document.getElementById('song-modal');
  if (!wrap || !modal) return;

  // ── Step 1: Show modal + loader IMMEDIATELY (within the user gesture)
  //    so the browser treats iframe creation as user-initiated → autoplay works
  const loader = document.getElementById('song-loader');
  
  // Remove any existing iframe but keep loader
  const existingIframe = wrap.querySelector('iframe');
  if (existingIframe) existingIframe.remove();
  
  // Show loader with smooth transition
  if (loader) {
    loader.style.display    = 'flex';
    loader.style.opacity    = '1';
    loader.style.transition = 'opacity 0.3s ease';
  }
  modal.classList.add('open');

  // ── Step 2: Fetch songs and find the one to play
  const songs = await _fetchSongs();
  const song = songs.find(s => s.id === songId);
  if (!song) { closeSongPlayer(); return; }

  const embed     = song.embed || '';
  const spotifyId = extractSpotifyId(embed);
  if (!spotifyId) { closeSongPlayer(); return; }

  // Fill modal header
  const mt = document.getElementById('song-modal-title');
  const ma = document.getElementById('song-modal-artist');
  if (mt) mt.textContent = song.title  || '';
  if (ma) ma.textContent = song.artist || '';

  // Helper: fade loader out, fade iframe in
  function revealPlayer(iframe) {
    // Small delay to ensure iframe is ready
    setTimeout(() => {
      if (loader) {
        loader.style.transition = 'opacity 0.5s ease';
        loader.style.opacity    = '0';
        setTimeout(() => { if (loader.parentNode) loader.style.display = 'none'; }, 520);
      }
      iframe.style.transition = 'opacity 0.5s ease';
      iframe.style.opacity    = '1';
    }, 100);
  }

  // ── Spotify ──────────────────────────────────────────────────
  wrap.style.paddingTop = '0';
  wrap.style.height     = '152px';

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:0 0 1.5rem 1.5rem;opacity:0;';
  iframe.allow         = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  iframe.title         = 'Our Song';
  // Wait longer for Spotify to buffer and be ready to play
  iframe.addEventListener('load', () => {
    setTimeout(() => revealPlayer(iframe), 2500);
  });
  // Set src AFTER appending so the load fires correctly
  wrap.appendChild(iframe);
  iframe.src = `https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&autoplay=1`;
}

function closeSongPlayer() {
  const modal = document.getElementById('song-modal');
  const wrap  = document.getElementById('song-player-wrap');
  const loader = document.getElementById('song-loader');

  if (modal) modal.classList.remove('open');

  // Remove only the iframe, keep the loader in place
  const existingIframe = wrap.querySelector('iframe');
  if (existingIframe) existingIframe.remove();

  // Reset loader visibility
  if (loader) {
    loader.style.display    = 'flex';
    loader.style.opacity    = '1';
    loader.style.transition = 'opacity 0.3s ease';
  }
}

// ══════════════════════════════════════════════════════════════
// RECENT MEMORY (home page card)
// ══════════════════════════════════════════════════════════════

async function loadRecentMemory() {
  const wrap    = document.getElementById('recent-memory-wrap');
  const imgEl   = document.getElementById('recent-memory-img');
  const emptyEl = document.getElementById('recent-memory-empty');
  const caption = document.getElementById('recent-memory-caption');
  const titleEl = document.getElementById('recent-memory-title');
  const dateEl  = document.getElementById('recent-memory-date');
  if (!imgEl) return;

  let item = null;
  const sb = getSupabase();

  if (sb) {
    const { data, error } = await sb
      .from('media')
      .select('*')
      .eq('file_type', 'photo')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error) item = data;
  } else {
    const local = window._localMedia || [];
    item = local.find(m => m.file_type === 'photo') || null;
  }

  if (!item) {
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  imgEl.style.backgroundImage = `url('${item.file_url}')`;
  imgEl.style.backgroundSize  = 'cover';
  imgEl.style.backgroundPosition = 'center';

  if (item.title || item.taken_at) {
    if (caption) caption.classList.remove('hidden');
    if (titleEl) titleEl.textContent = item.title || '';
    if (dateEl && item.taken_at) {
      dateEl.textContent = new Date(item.taken_at + 'T00:00:00')
        .toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    }
  }
}

// ══════════════════════════════════════════════════════════════
// FILTER BUTTONS
// ══════════════════════════════════════════════════════════════

function initFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-primary-container','text-on-primary-container');
        b.classList.add('bg-surface-container-high','text-on-surface-variant');
      });
      btn.classList.add('bg-primary-container','text-on-primary-container');
      btn.classList.remove('bg-surface-container-high','text-on-surface-variant');

      const map = { 'All Memories':'all', 'Trips':'trips', 'Dates':'dates', 'Everyday':'everyday', 'Events':'events' };
      currentFilter = map[btn.textContent.trim()] || 'all';
      loadGallery();
    });
  });
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  loadHomeImages();
  loadLoveLetter();
  loadSongs();
  loadGallery();
  loadTimeline();
  loadRecentMemory();
  loadBucketList();
  updateDaysTogether();
  initFilterButtons();

  // Wire up Add Memory button
  const addMemoryBtn = document.querySelector('[data-partner-only].group');
  if (addMemoryBtn) addMemoryBtn.onclick = openUploadModal;

  // Hide scroll hint once user scrolls past hero
  const scrollHint = document.getElementById('hero-scroll-hint');
  if (scrollHint) {
    const hideHint = () => {
      if (window.scrollY > 60) {
        scrollHint.classList.add('hide');
        window.removeEventListener('scroll', hideHint);
      }
    };
    window.addEventListener('scroll', hideHint, { passive: true });
  }
});

// Called by login.js after partner signs in
function onPartnerSignIn() {
  loadLoveLetter();
  loadSongs();
  loadGallery();
  loadRecentMemory();
  loadBucketList();
  renderDynamicTimeline();
}

// Called by login.js after sign out
function onPartnerSignOut() {
  loadGallery();
  loadRecentMemory();
  loadBucketList();
  renderDynamicTimeline();
}

// Close app modals on backdrop click or Escape
document.addEventListener('DOMContentLoaded', () => {
  ['upload-modal','timeline-modal','song-modal','dream-complete-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', e => { if (e.target === el) {
      if (id === 'song-modal') closeSongPlayer(); else el.classList.remove('open');
    }});
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeUploadModal();
      closeTimelineModal();
      closeSongPlayer();
    }
  });
});

// ══════════════════════════════════════════════════════════════
// BUCKET LIST
// Persisted in Supabase `settings` table  key: 'bucket_list'
// value: JSON array of { id, text, done }
// Falls back to localStorage when Supabase is unavailable.
// ══════════════════════════════════════════════════════════════

async function _fetchBucketList() {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from('settings')
      .select('value')
      .eq('key', 'bucket_list')
      .maybeSingle();
    if (!error && data) {
      try { return JSON.parse(data.value); } catch { /* bad json */ }
    }
  }
  return JSON.parse(localStorage.getItem('ya-qalbi-bucket') || '[]');
}

async function _persistBucketList(items) {
  const json = JSON.stringify(items);
  localStorage.setItem('ya-qalbi-bucket', json);
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb
      .from('settings')
      .upsert({ key: 'bucket_list', value: json, updated_at: new Date().toISOString() },
               { onConflict: 'key' });
    if (error) console.warn('Bucket list save error:', error.message);
  }
}

function _renderBucketList(items) {
  const listEl    = document.getElementById('bucket-list');
  const emptyEl   = document.getElementById('bucket-empty');
  const barEl     = document.getElementById('bucket-progress-bar');
  const labelEl   = document.getElementById('bucket-progress-label');
  if (!listEl) return;

  if (!items || items.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (barEl)   barEl.style.width = '0%';
    if (labelEl) labelEl.textContent = 'Things we want to do together';
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');

  const done  = items.filter(i => i.done).length;
  const total = items.length;
  const pct   = Math.round((done / total) * 100);

  if (barEl)   barEl.style.width = `${pct}%`;
  if (labelEl) labelEl.textContent = `${done} of ${total} done · ${pct}%`;

  listEl.innerHTML = '';
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = `flex items-start gap-3 px-2 py-3 rounded-xl hover:bg-surface-container-high transition-colors group ${item.done ? 'opacity-80' : ''}`;

    // Completed memory thumbnail + date
    const memoryPreview = item.done && (item.completedPhoto || item.completedAt)
      ? `<div class="flex items-center gap-2 mt-1">
           ${item.completedPhoto ? `<img src="${item.completedPhoto}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0 ring-1 ring-primary/30 loading" onload="this.classList.remove('loading');this.classList.add('loaded');"/>` : ''}
           ${item.completedAt ? `<span class="font-label-sm text-primary/80">${new Date(item.completedAt + 'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>` : ''}
         </div>`
      : '';

    const partnerControls = isPartner()
      ? `<button onclick="deleteBucketItem('${item.id}')"
           class="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center text-outline-variant hover:text-error hover:bg-error/10 transition-all flex-shrink-0 mt-0.5">
           <span class="material-symbols-outlined text-[16px]">delete</span>
         </button>`
      : '';

    row.innerHTML = `
      <button onclick="${isPartner() ? `toggleBucketItem('${item.id}')` : ''}"
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5
               ${item.done ? 'bg-primary border-primary' : 'border-outline-variant/60 hover:border-primary'}"
        ${!isPartner() ? 'disabled' : ''}>
        ${item.done ? '<span class="material-symbols-outlined text-on-primary text-[14px]" style="font-variation-settings:\'FILL\' 1">check</span>' : ''}
      </button>
      <div class="flex-1 min-w-0">
        <span class="font-body-md text-on-surface ${item.done ? 'line-through text-secondary' : ''}">${item.text}</span>
        ${memoryPreview}
      </div>
      ${partnerControls}
    `;
    listEl.appendChild(row);
  });
}

async function loadBucketList() {
  const items = await _fetchBucketList();
  _renderBucketList(items);
}

function openBucketListAdd() {
  const form = document.getElementById('bucket-form');
  if (form) {
    form.classList.remove('hidden');
    document.getElementById('bucket-input')?.focus();
  }
}

function closeBucketListAdd() {
  const form  = document.getElementById('bucket-form');
  const input = document.getElementById('bucket-input');
  if (form)  form.classList.add('hidden');
  if (input) input.value = '';
}

async function saveBucketItem() {
  const input = document.getElementById('bucket-input');
  const text  = input?.value.trim();
  if (!text) return;

  const items = await _fetchBucketList();
  items.push({
    id:   crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    text,
    done: false
  });
  await _persistBucketList(items);
  closeBucketListAdd();
  _renderBucketList(items);
}

async function toggleBucketItem(id) {
  const items = await _fetchBucketList();
  const item  = items.find(i => i.id === id);
  if (!item) return;
  if (item.done) {
    // Un-tick — remove completion data instantly
    item.done = false;
    delete item.completedAt;
    delete item.completedPhoto;
    await _persistBucketList(items);
    _renderBucketList(items);
  } else {
    // Tick — open completion modal
    openDreamComplete(id, 'bucket', item.text);
  }
}

async function deleteBucketItem(id) {
  if (!confirm('Remove this item?')) return;
  const items    = await _fetchBucketList();
  const filtered = items.filter(i => i.id !== id);
  await _persistBucketList(filtered);
  _renderBucketList(filtered);
}

// ══════════════════════════════════════════════════════════════
// OUR DREAMS PAGE — shared helpers for Watch List & Places
// ══════════════════════════════════════════════════════════════

// Generic list helpers (persisted under a settings key)
async function _fetchList(key) {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb.from('settings').select('value').eq('key', key).maybeSingle();
    if (!error && data) { try { return JSON.parse(data.value); } catch {} }
  }
  return JSON.parse(localStorage.getItem('ya-qalbi-' + key) || '[]');
}

async function _persistList(key, items) {
  const json = JSON.stringify(items);
  localStorage.setItem('ya-qalbi-' + key, json);
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('settings')
      .upsert({ key, value: json, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) console.warn(key + ' save error:', error.message);
  }
}

function _renderSimpleList(items, listId, emptyId, { onToggle, onDelete, listKey }) {
  const listEl  = document.getElementById(listId);
  const emptyEl = document.getElementById(emptyId);
  if (!listEl) return;

  if (!items || items.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');
  listEl.innerHTML = '';

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = `flex items-start gap-3 px-2 py-3 rounded-xl hover:bg-surface-container-high transition-colors group ${item.done ? 'opacity-80' : ''}`;

    const memoryPreview = item.done && (item.completedPhoto || item.completedAt)
      ? `<div class="flex items-center gap-2 mt-1">
           ${item.completedPhoto ? `<img src="${item.completedPhoto}" class="w-8 h-8 rounded-lg object-cover flex-shrink-0 ring-1 ring-primary/30 loading" onload="this.classList.remove('loading');this.classList.add('loaded');"/>` : ''}
           ${item.completedAt ? `<span class="font-label-sm text-primary/80">${new Date(item.completedAt + 'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>` : ''}
         </div>`
      : '';

    const deleteBtn = isPartner()
      ? `<button onclick="${onDelete}('${item.id}')"
           class="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full flex items-center justify-center text-outline-variant hover:text-error hover:bg-error/10 transition-all flex-shrink-0 mt-0.5">
           <span class="material-symbols-outlined text-[16px]">delete</span>
         </button>` : '';

    const toggleCall = isPartner() ? `${onToggle}('${item.id}')` : '';

    row.innerHTML = `
      <button onclick="${toggleCall}"
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5
               ${item.done ? 'bg-primary border-primary' : 'border-outline-variant/60 hover:border-primary'}"
        ${!isPartner() ? 'disabled' : ''}>
        ${item.done ? '<span class="material-symbols-outlined text-on-primary text-[14px]" style="font-variation-settings:\'FILL\' 1">check</span>' : ''}
      </button>
      <div class="flex-1 min-w-0">
        <span class="font-body-md text-on-surface ${item.done ? 'line-through text-secondary' : ''}">${item.text}</span>
        ${memoryPreview}
      </div>
      ${deleteBtn}`;
    listEl.appendChild(row);
  });
}

// ── Watch List ────────────────────────────────────────────────
async function loadWatchList() {
  const items = await _fetchList('watch_list');
  _renderSimpleList(items, 'watch-list', 'watch-empty', {
    onToggle: 'toggleWatchItem', onDelete: 'deleteWatchItem'
  });
}
function openWatchListAdd()  { const f = document.getElementById('watch-form'); if(f) { f.classList.remove('hidden'); document.getElementById('watch-input')?.focus(); } }
function closeWatchListAdd() { const f = document.getElementById('watch-form'); if(f) f.classList.add('hidden'); const i = document.getElementById('watch-input'); if(i) i.value=''; }
async function saveWatchItem() {
  const text = document.getElementById('watch-input')?.value.trim();
  if (!text) return;
  const items = await _fetchList('watch_list');
  items.push({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), text, done: false });
  await _persistList('watch_list', items);
  closeWatchListAdd();
  _renderSimpleList(items, 'watch-list', 'watch-empty', { onToggle: 'toggleWatchItem', onDelete: 'deleteWatchItem' });
}
async function toggleWatchItem(id) {
  const items = await _fetchList('watch_list');
  const item = items.find(i => i.id === id); if (!item) return;
  if (item.done) {
    item.done = false; delete item.completedAt; delete item.completedPhoto;
    await _persistList('watch_list', items);
    _renderSimpleList(items, 'watch-list', 'watch-empty', { onToggle: 'toggleWatchItem', onDelete: 'deleteWatchItem' });
  } else {
    openDreamComplete(id, 'watch', item.text);
  }
}
async function deleteWatchItem(id) {
  if (!confirm('Remove this item?')) return;
  const items = (await _fetchList('watch_list')).filter(i => i.id !== id);
  await _persistList('watch_list', items);
  _renderSimpleList(items, 'watch-list', 'watch-empty', { onToggle: 'toggleWatchItem', onDelete: 'deleteWatchItem' });
}

// ── Places List ───────────────────────────────────────────────
async function loadPlaceList() {
  const items = await _fetchList('place_list');
  _renderSimpleList(items, 'place-list', 'place-empty', {
    onToggle: 'togglePlaceItem', onDelete: 'deletePlaceItem'
  });
}
function openPlaceListAdd()  { const f = document.getElementById('place-form'); if(f) { f.classList.remove('hidden'); document.getElementById('place-input')?.focus(); } }
function closePlaceListAdd() { const f = document.getElementById('place-form'); if(f) f.classList.add('hidden'); const i = document.getElementById('place-input'); if(i) i.value=''; }
async function savePlaceItem() {
  const text = document.getElementById('place-input')?.value.trim();
  if (!text) return;
  const items = await _fetchList('place_list');
  items.push({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), text, done: false });
  await _persistList('place_list', items);
  closePlaceListAdd();
  _renderSimpleList(items, 'place-list', 'place-empty', { onToggle: 'togglePlaceItem', onDelete: 'deletePlaceItem' });
}
async function togglePlaceItem(id) {
  const items = await _fetchList('place_list');
  const item = items.find(i => i.id === id); if (!item) return;
  if (item.done) {
    item.done = false; delete item.completedAt; delete item.completedPhoto;
    await _persistList('place_list', items);
    _renderSimpleList(items, 'place-list', 'place-empty', { onToggle: 'togglePlaceItem', onDelete: 'deletePlaceItem' });
  } else {
    openDreamComplete(id, 'place', item.text);
  }
}
async function deletePlaceItem(id) {
  if (!confirm('Remove this item?')) return;
  const items = (await _fetchList('place_list')).filter(i => i.id !== id);
  await _persistList('place_list', items);
  _renderSimpleList(items, 'place-list', 'place-empty', { onToggle: 'togglePlaceItem', onDelete: 'deletePlaceItem' });
}

// ── Called when navigating to dreams page ─────────────────────
function loadDreamsPage() {
  loadBucketList();
  loadWatchList();
  loadPlaceList();
}

// ══════════════════════════════════════════════════════════════
// DREAM COMPLETION MODAL
// ══════════════════════════════════════════════════════════════

let _pendingDreamPhoto = null;

function openDreamComplete(id, listKey, text) {
  document.getElementById('dream-complete-id').value   = id;
  document.getElementById('dream-complete-list').value = listKey;
  document.getElementById('dream-complete-name').textContent = text;
  // Default date to today
  document.getElementById('dream-complete-date').value =
    new Date().toISOString().slice(0, 10);
  clearDreamPhoto();
  document.getElementById('dream-complete-modal').classList.add('open');
}

function closeDreamComplete() {
  document.getElementById('dream-complete-modal').classList.remove('open');
  clearDreamPhoto();
}

async function previewDreamPhoto(input) {
  const raw = input.files[0];
  if (!raw) { clearDreamPhoto(); return; }
  const file = await normaliseImageFile(raw);
  if (!file) { clearDreamPhoto(); return; }
  _pendingDreamPhoto = file;
  const previewImg  = document.getElementById('dream-complete-preview-img');
  const previewWrap = document.getElementById('dream-complete-preview');
  const labelEl     = document.getElementById('dream-complete-file-label');
  previewImg.src = URL.createObjectURL(file);
  previewWrap.classList.remove('hidden');
  if (labelEl) labelEl.textContent = file.name;
}

function clearDreamPhoto() {
  _pendingDreamPhoto = null;
  const input      = document.getElementById('dream-complete-file');
  const previewImg = document.getElementById('dream-complete-preview-img');
  const previewWrap= document.getElementById('dream-complete-preview');
  const labelEl    = document.getElementById('dream-complete-file-label');
  if (input)       input.value = '';
  if (previewImg)  previewImg.src = '';
  if (previewWrap) previewWrap.classList.add('hidden');
  if (labelEl)     labelEl.textContent = 'Choose a photo…';
}

async function confirmDreamComplete() {
  const id       = document.getElementById('dream-complete-id').value;
  const listKey  = document.getElementById('dream-complete-list').value;
  const dateVal  = document.getElementById('dream-complete-date').value;
  const btn      = document.querySelector('#dream-complete-modal [onclick="confirmDreamComplete()"]');

  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  // Upload photo if present
  let photoUrl = null;
  if (_pendingDreamPhoto) {
    const sb = getSupabase();
    if (sb) {
      const ext  = _pendingDreamPhoto.name.split('.').pop().toLowerCase() || 'jpg';
      const path = `dreams/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from('media').upload(path, _pendingDreamPhoto, {
        contentType: _pendingDreamPhoto.type || 'image/jpeg', upsert: false
      });
      if (!error) {
        const { data } = sb.storage.from('media').getPublicUrl(path);
        photoUrl = data?.publicUrl || null;
      }
    } else {
      photoUrl = URL.createObjectURL(_pendingDreamPhoto);
    }
  }

  // Update the item in its list
  const fetchFn   = listKey === 'bucket' ? _fetchBucketList  : () => _fetchList(listKey + '_list');
  const persistFn = listKey === 'bucket' ? _persistBucketList : (items) => _persistList(listKey + '_list', items);
  const renderFn  = listKey === 'bucket'
    ? () => _fetchBucketList().then(_renderBucketList)
    : listKey === 'watch'
      ? () => _fetchList('watch_list').then(items => _renderSimpleList(items,'watch-list','watch-empty',{onToggle:'toggleWatchItem',onDelete:'deleteWatchItem'}))
      : () => _fetchList('place_list').then(items => _renderSimpleList(items,'place-list','place-empty',{onToggle:'togglePlaceItem',onDelete:'deletePlaceItem'}));

  const items = await fetchFn();
  const item  = items.find(i => i.id === id);
  if (item) {
    item.done = true;
    if (dateVal)  item.completedAt    = dateVal;
    if (photoUrl) item.completedPhoto = photoUrl;
    await persistFn(items);
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Mark Done ✓'; }
  closeDreamComplete();
  await renderFn();
}
