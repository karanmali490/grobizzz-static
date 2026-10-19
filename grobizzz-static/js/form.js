/**
 * Grobizzz Multi-Step Form Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const totalSteps = 8;
  let currentStep = 1;

  const form = document.getElementById('grobizzz-form');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const generateBtn = document.getElementById('generate-btn');
  const progressFill = document.getElementById('progress-fill');
  const currentStepDisplay = document.getElementById('current-step-display');
  const stepTitle = document.getElementById('step-title');
  const stepDesc = document.getElementById('step-desc');

  const stepMeta = {
    1: {
      title: 'Business Type & Details',
      desc: 'Select your business type first — the form and profile template will adapt to it.'
    },
    2: {
      title: 'Contact & Location',
      desc: 'How can customers reach you and where are you located?'
    },
    3: {
      title: 'Branding & Design',
      desc: 'Upload your logo and choose the colours that represent your brand.'
    },
    4: {
      title: 'Hero Section',
      desc: 'This is the first thing visitors see. Make it powerful.'
    },
    5: {
      title: 'Menu / Services',
      desc: 'What do you offer? Add the main categories of your business.'
    },
    6: {
      title: 'Gallery & Portfolio',
      desc: 'Upload photos and videos that showcase your space, food or products.'
    },
    7: {
      title: 'Ordering & Social Links',
      desc: 'Connect your delivery platforms and social media accounts.'
    },
    8: {
      title: 'Final Settings & Launch',
      desc: 'Choose your subdomain and launch your professional website.'
    }
  };

  // Business type → template + form behaviour
  const TYPE_CONFIG = {
    doctors: {
      label: 'Doctors',
      template: 'service',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'General · Dental · Skin · Child Care',
      namePh: 'e.g. Dr. Sharma Clinic',
      taglinePh: 'Healthcare you can trust',
      aboutPh: 'Tell patients about your practice, expertise and care...',
      offerLabel: 'Service categories',
      offerHelper: 'Add categories like Consultation, Treatments, Diagnostics...',
      featuredLabel: 'Featured services (optional)',
      featuredPh: 'e.g. General checkup, Dental cleaning, Skin treatment',
      featuredHint: 'List main medical services'
    },
    hotels: {
      label: 'Hotels',
      template: 'modern',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'Luxury · Budget · Business',
      namePh: 'e.g. Grand Palace Hotel',
      taglinePh: 'Comfortable stay, memorable experience',
      aboutPh: 'Tell guests about your hotel, rooms and amenities...',
      offerLabel: 'Room / facility categories',
      offerHelper: 'Add categories like Rooms, Suites, Banquet...',
      featuredLabel: 'Featured offers (optional)',
      featuredPh: 'e.g. Deluxe Room, Family Suite, Conference Hall',
      featuredHint: 'Highlight rooms or packages'
    },
    resorts: {
      label: 'Resorts',
      template: 'modern',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'Beach · Hill · Adventure',
      namePh: 'e.g. Green Valley Resort',
      taglinePh: 'Escape, relax, recharge',
      aboutPh: 'Tell guests about your resort and experiences...',
      offerLabel: 'Experience categories',
      offerHelper: 'Add categories like Stays, Activities, Dining...',
      featuredLabel: 'Featured packages (optional)',
      featuredPh: 'e.g. Weekend getaway, Couple package',
      featuredHint: 'Highlight stay packages'
    },
    'cafe-restaurant': {
      label: 'Cafe & Restaurant',
      template: 'restaurant',
      offerMode: 'menu',
      foodLinks: true,
      specialtyPh: 'Café · Lounge · Family Restaurant',
      namePh: 'e.g. Hyde-Out Cafe',
      taglinePh: 'A warm corner for long breakfasts & coffee',
      aboutPh: 'Tell customers about your cafe/restaurant, food and vibe...',
      offerLabel: 'Menu categories',
      offerHelper: 'Add categories like Breakfast, Pizza, Beverages...',
      featuredLabel: 'Featured menu items (optional)',
      featuredPh: 'e.g. English Breakfast, Cold Brew, Margherita Pizza',
      featuredHint: 'List popular dishes or drinks'
    },
    industry: {
      label: 'Industry',
      template: 'modern',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'Manufacturing · Trading · Export',
      namePh: 'e.g. Apex Industries',
      taglinePh: 'Quality products, trusted delivery',
      aboutPh: 'Tell clients about your industry and capabilities...',
      offerLabel: 'Product / service categories',
      offerHelper: 'Add categories for what you manufacture or supply...',
      featuredLabel: 'Featured offerings (optional)',
      featuredPh: 'e.g. Main product lines',
      featuredHint: 'Highlight key products or services'
    },
    'home-decors': {
      label: 'Home Decors',
      template: 'modern',
      offerMode: 'products',
      foodLinks: false,
      specialtyPh: 'Furniture · Lighting · Soft furnishings',
      namePh: 'e.g. HomeStyle Decor',
      taglinePh: 'Beautiful spaces start here',
      aboutPh: 'Tell customers about your decor products and style...',
      offerLabel: 'Product categories',
      offerHelper: 'Add categories like Furniture, Lights, Curtains...',
      featuredLabel: 'Featured products (optional)',
      featuredPh: 'e.g. Sofa sets, Wall art, Lamps',
      featuredHint: 'Highlight best sellers'
    },
    jewellers: {
      label: 'Jewellers',
      template: 'modern',
      offerMode: 'products',
      foodLinks: false,
      specialtyPh: 'Gold · Diamond · Silver',
      namePh: 'e.g. Shree Jewellers',
      taglinePh: 'Timeless designs, trusted purity',
      aboutPh: 'Tell customers about your jewellery collections...',
      offerLabel: 'Collection categories',
      offerHelper: 'Add categories like Gold, Diamond, Bridal...',
      featuredLabel: 'Featured collections (optional)',
      featuredPh: 'e.g. Bridal sets, Daily wear, Gold chains',
      featuredHint: 'Highlight popular collections'
    },
    'cake-shops': {
      label: 'Cake Shops',
      template: 'restaurant',
      offerMode: 'menu',
      foodLinks: true,
      specialtyPh: 'Custom cakes · Pastries · Bakery',
      namePh: 'e.g. Sweet Slice Bakery',
      taglinePh: 'Fresh bakes for every celebration',
      aboutPh: 'Tell customers about your cakes and bakery...',
      offerLabel: 'Menu / product categories',
      offerHelper: 'Add categories like Cakes, Pastries, Cookies...',
      featuredLabel: 'Featured items (optional)',
      featuredPh: 'e.g. Chocolate truffle, Red velvet, Cupcakes',
      featuredHint: 'List popular cakes or items'
    },
    automobile: {
      label: 'Automobile',
      template: 'service',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'Sales · Service · Spare parts',
      namePh: 'e.g. AutoCare Motors',
      taglinePh: 'Drive with confidence',
      aboutPh: 'Tell customers about your auto sales or service...',
      offerLabel: 'Service / product categories',
      offerHelper: 'Add categories like Service, Sales, Accessories...',
      featuredLabel: 'Featured services (optional)',
      featuredPh: 'e.g. Full service, Oil change, Body work',
      featuredHint: 'List main auto services'
    },
    agro: {
      label: 'Agro',
      template: 'modern',
      offerMode: 'products',
      foodLinks: false,
      specialtyPh: 'Seeds · Fertilizers · Equipment',
      namePh: 'e.g. GreenField Agro',
      taglinePh: 'Growing with farmers',
      aboutPh: 'Tell customers about your agro products and support...',
      offerLabel: 'Product categories',
      offerHelper: 'Add categories like Seeds, Fertilizers, Tools...',
      featuredLabel: 'Featured products (optional)',
      featuredPh: 'e.g. Hybrid seeds, Organic fertilizer',
      featuredHint: 'Highlight key agro products'
    },
    education: {
      label: 'Education',
      template: 'service',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'School · Coaching · Training',
      namePh: 'e.g. Bright Future Academy',
      taglinePh: 'Learning that shapes the future',
      aboutPh: 'Tell students and parents about your institute...',
      offerLabel: 'Course categories',
      offerHelper: 'Add categories like Courses, Batches, Programs...',
      featuredLabel: 'Featured courses (optional)',
      featuredPh: 'e.g. Class 10 Board, JEE Foundation, Spoken English',
      featuredHint: 'List popular courses'
    },
    'general-store': {
      label: 'General Store',
      template: 'modern',
      offerMode: 'products',
      foodLinks: false,
      specialtyPh: 'Grocery · Daily needs',
      namePh: 'e.g. City Mart',
      taglinePh: 'Everything you need, nearby',
      aboutPh: 'Tell customers about your store and products...',
      offerLabel: 'Product categories',
      offerHelper: 'Add categories like Grocery, Snacks, Household...',
      featuredLabel: 'Featured products (optional)',
      featuredPh: 'e.g. Daily essentials, Combo offers',
      featuredHint: 'Highlight popular items'
    },
    'salon-spa': {
      label: 'Salon & Spa',
      template: 'service',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'Hair · Skin · Nails · Spa',
      namePh: 'e.g. Glow & Grace Salon',
      taglinePh: 'Look good, feel confident',
      aboutPh: 'Tell customers about your salon, stylists and services...',
      offerLabel: 'Service categories',
      offerHelper: 'Add categories like Hair, Skin, Nails, Spa...',
      featuredLabel: 'Featured services (optional)',
      featuredPh: 'e.g. Haircut ₹300, Facial ₹800, Hair Colour ₹1500',
      featuredHint: 'List popular services and prices'
    },
    transportation: {
      label: 'Transportation',
      template: 'service',
      offerMode: 'services',
      foodLinks: false,
      specialtyPh: 'Taxi · Logistics · Fleet',
      namePh: 'e.g. CityRide Transport',
      taglinePh: 'On time. Every time.',
      aboutPh: 'Tell customers about your transport services...',
      offerLabel: 'Service categories',
      offerHelper: 'Add categories like Local, Outstation, Logistics...',
      featuredLabel: 'Featured services (optional)',
      featuredPh: 'e.g. Airport transfer, Tempo hire, Full truck',
      featuredHint: 'List main transport services'
    }
  };

  let selectedType = null;

  function applyTypeConfig(typeKey) {
    const cfg = TYPE_CONFIG[typeKey];
    if (!cfg) return;
    selectedType = typeKey;

    document.getElementById('field-category').value = typeKey;
    document.getElementById('field-template').value = cfg.template;

    document.querySelectorAll('.biz-type-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.type === typeKey);
    });

    document.querySelectorAll('.type-dependent').forEach(el => { el.hidden = false; });
    const bannerWrap = document.getElementById('block-after-type');
    const banner = document.getElementById('selected-type-banner');
    if (bannerWrap) bannerWrap.hidden = false;
    if (banner) {
      banner.textContent = 'Selected: ' + cfg.label + '  →  Template: ' + cfg.template;
    }

    const err = document.getElementById('biz-type-error');
    if (err) err.hidden = true;

    // Placeholders
    const nameEl = document.getElementById('field-business-name');
    const specEl = document.getElementById('field-specialty');
    const tagEl = document.getElementById('field-tagline');
    const aboutEl = document.getElementById('field-about');
    if (nameEl) { nameEl.placeholder = cfg.namePh; nameEl.required = true; }
    if (specEl) specEl.placeholder = cfg.specialtyPh;
    if (tagEl) { tagEl.placeholder = cfg.taglinePh; tagEl.required = true; }
    if (aboutEl) { aboutEl.placeholder = cfg.aboutPh; aboutEl.required = true; }

    // Step 5 labels
    const offerLabel = document.getElementById('offer-label');
    const offerHelper = document.getElementById('offer-helper');
    const featuredLabel = document.getElementById('featured-label');
    const featured = document.getElementById('field-featured');
    const featuredHint = document.getElementById('featured-hint');
    if (offerLabel) offerLabel.textContent = cfg.offerLabel;
    if (offerHelper) offerHelper.textContent = cfg.offerHelper;
    if (featuredLabel) featuredLabel.textContent = cfg.featuredLabel;
    if (featured) featured.placeholder = cfg.featuredPh;
    if (featuredHint) featuredHint.textContent = cfg.featuredHint;

    // Food links (Zomato / Swiggy)
    document.querySelectorAll('.field-food-only').forEach(el => {
      el.style.display = cfg.foodLinks ? '' : 'none';
    });

    // Show only matching mode blocks (menu / services / products)
    document.querySelectorAll('.field-mode-menu').forEach(el => {
      el.hidden = cfg.offerMode !== 'menu';
    });
    document.querySelectorAll('.field-mode-services').forEach(el => {
      el.hidden = cfg.offerMode !== 'services';
    });
    document.querySelectorAll('.field-mode-products').forEach(el => {
      el.hidden = cfg.offerMode !== 'products';
    });

    // Step 4 labels
    const s4hint = document.getElementById('step4-type-hint');
    const s5hint = document.getElementById('step5-type-hint');
    if (s4hint) s4hint.textContent = 'Business type: ' + cfg.label + ' · Template: ' + cfg.template;
    if (s5hint) s5hint.textContent = 'Business type: ' + cfg.label + ' · Filling as: ' + (cfg.offerMode === 'menu' ? 'Menu' : cfg.offerMode === 'products' ? 'Products' : 'Services');

    const s4cover = document.getElementById('step4-cover-label');
    const s4coverHelp = document.getElementById('step4-cover-help');
    const s4head = document.getElementById('step4-headline-label');
    const s4headHint = document.getElementById('step4-headline-hint');
    const s4sub = document.getElementById('step4-sub-label');
    const heroHead = document.getElementById('field-hero-headline');
    const heroSub = document.getElementById('field-hero-sub');

    if (cfg.offerMode === 'menu') {
      if (s4cover) s4cover.textContent = 'Restaurant / Cafe cover photo';
      if (s4coverHelp) s4coverHelp.textContent = 'Food, interior or ambience photo for the top banner';
      if (s4head) s4head.textContent = 'Headline (on banner)';
      if (s4headHint) s4headHint.textContent = 'Usually your cafe / restaurant name';
      if (s4sub) s4sub.textContent = 'Tagline under the name';
      if (heroHead) heroHead.placeholder = cfg.namePh || 'e.g. Hyde-Out Cafe';
      if (heroSub) heroSub.placeholder = cfg.taglinePh || 'A warm corner for breakfast & coffee';
      stepMeta[4] = { title: 'Cover & Hero', desc: 'Banner photo and buttons for your restaurant profile.' };
      stepMeta[5] = { title: 'Menu', desc: 'Add menu categories and featured dishes.' };
      updateSidebarLabel(5, 'Menu', 'Dishes & categories');
      updateSidebarLabel(4, 'Cover & Hero', 'Banner & buttons');
    } else if (cfg.offerMode === 'products') {
      if (s4cover) s4cover.textContent = 'Shop / brand cover photo';
      if (s4coverHelp) s4coverHelp.textContent = 'Store, products or brand image for the top banner';
      if (s4head) s4head.textContent = 'Headline (on banner)';
      if (s4headHint) s4headHint.textContent = 'Usually your shop / brand name';
      if (s4sub) s4sub.textContent = 'Tagline under the name';
      if (heroHead) heroHead.placeholder = cfg.namePh || 'Your business name';
      if (heroSub) heroSub.placeholder = cfg.taglinePh || 'Your short tagline';
      stepMeta[4] = { title: 'Cover & Hero', desc: 'Banner photo and contact buttons for your shop.' };
      stepMeta[5] = { title: 'Products', desc: 'Add product categories and featured products.' };
      updateSidebarLabel(5, 'Products', 'Catalogue');
      updateSidebarLabel(4, 'Cover & Hero', 'Banner & buttons');
    } else {
      if (s4cover) s4cover.textContent = 'Professional cover / clinic photo';
      if (s4coverHelp) s4coverHelp.textContent = 'Clinic, team or workspace photo for the top banner';
      if (s4head) s4head.textContent = 'Headline (on banner)';
      if (s4headHint) s4headHint.textContent = 'Usually doctor / business name';
      if (s4sub) s4sub.textContent = 'Qualification or tagline';
      if (heroHead) heroHead.placeholder = cfg.namePh || 'e.g. Dr. Sharma Clinic';
      if (heroSub) heroSub.placeholder = cfg.taglinePh || 'Healthcare you can trust';
      stepMeta[4] = { title: 'Cover & Hero', desc: 'Banner photo and enquiry / appointment buttons.' };
      stepMeta[5] = { title: 'Services', desc: 'Add service categories and featured services.' };
      updateSidebarLabel(5, 'Services', 'What you offer');
      updateSidebarLabel(4, 'Cover & Hero', 'Banner & buttons');
    }

    if (cfg.foodLinks) {
      stepMeta[7] = { title: 'Ordering & Social Links', desc: 'Connect Zomato, Swiggy and social accounts.' };
      updateSidebarLabel(7, 'Ordering & Social', 'Zomato, Swiggy, social');
    } else {
      stepMeta[7] = { title: 'Social & External Links', desc: 'Connect Instagram, Facebook and other links.' };
      updateSidebarLabel(7, 'Social Links', 'Instagram, Facebook…');
    }

    // Refresh title if user is currently on step 4 or 5
    if (typeof currentStep !== 'undefined' && stepMeta[currentStep]) {
      if (stepTitle) stepTitle.textContent = stepMeta[currentStep].title;
      if (stepDesc) stepDesc.textContent = stepMeta[currentStep].desc;
    }
  }

  function updateSidebarLabel(stepNum, strongText, spanText) {
    const item = document.querySelector('.step-item[data-step="' + stepNum + '"]');
    if (!item) return;
    const strong = item.querySelector('strong');
    const span = item.querySelector('.step-info span');
    if (strong) strong.textContent = strongText;
    if (span) span.textContent = spanText;
  }



  // About word count 80–100
  function countWords(text) {
    return String(text || '').trim().split(/\s+/).filter(Boolean).length;
  }
  function updateAboutWordCount() {
    var ta = document.getElementById('field-about');
    var el = document.getElementById('about-word-count');
    if (!ta || !el) return countWords(ta && ta.value);
    var n = countWords(ta.value);
    el.textContent = n + ' / 100 words';
    el.classList.remove('ok', 'warn', 'bad');
    if (n === 0) { /* neutral */ }
    else if (n >= 80 && n <= 100) el.classList.add('ok');
    else if (n > 100) el.classList.add('bad');
    else el.classList.add('warn');
    return n;
  }
  var aboutTa = document.getElementById('field-about');
  if (aboutTa) {
    aboutTa.addEventListener('input', updateAboutWordCount);
    updateAboutWordCount();
  }

  // Colour palette selection (Color Hunt style)
  function applyPalette(card) {
    if (!card) return;
    var grid = document.getElementById('palette-grid');
    if (grid) {
      grid.querySelectorAll('.palette-card').forEach(function (c) { c.classList.remove('selected'); });
    }
    card.classList.add('selected');
    var p = card.getAttribute('data-p');
    var s = card.getAttribute('data-s');
    var a = card.getAttribute('data-a');
    var h = card.getAttribute('data-h');
    var elP = document.getElementById('color_primary');
    var elS = document.getElementById('color_secondary');
    var elA = document.getElementById('color_accent');
    var elH = document.getElementById('color_highlight');
    if (elP) elP.value = p || '';
    if (elS) elS.value = s || '';
    if (elA) elA.value = a || '';
    if (elH) elH.value = h || '';
  }
  var paletteGrid = document.getElementById('palette-grid');
  if (paletteGrid) {
    paletteGrid.addEventListener('click', function (e) {
      var card = e.target.closest('.palette-card');
      if (!card) return;
      e.preventDefault();
      e.stopPropagation();
      applyPalette(card);
    });
  }

  const bizGrid = document.getElementById('biz-type-grid');
  if (bizGrid) {
    bizGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.biz-type-card');
      if (!card) return;
      e.preventDefault();
      applyTypeConfig(card.dataset.type);
    });
    // Also bind each card directly (more reliable)
    bizGrid.querySelectorAll('.biz-type-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        applyTypeConfig(card.getAttribute('data-type'));
      });
    });
  }

  // ---------- Navigation ----------
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');

    // Update sidebar
    document.querySelectorAll('.step-item').forEach(item => {
      const s = parseInt(item.dataset.step);
      item.classList.remove('active', 'completed');
      if (s === step) item.classList.add('active');
      if (s < step) item.classList.add('completed');
    });

    // Progress
    const percent = (step / totalSteps) * 100;
    progressFill.style.width = percent + '%';
    currentStepDisplay.textContent = step;

    // Title & description
    stepTitle.textContent = stepMeta[step].title;
    stepDesc.textContent = stepMeta[step].desc;

    // Buttons
    prevBtn.disabled = step === 1;
    if (step === totalSteps) {
      nextBtn.style.display = 'none';
      generateBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      generateBtn.style.display = 'none';
    }

    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Validation for current step
  function validateCurrentStep() {
    if (currentStep === 1) {
      var wn = updateAboutWordCount();
      var aboutEl = document.getElementById('field-about');
      if (aboutEl && aboutEl.value.trim()) {
        if (wn < 80) {
          alert('About text should be at least 80 words (currently ' + wn + ').');
          aboutEl.focus();
          return false;
        }
        if (wn > 100) {
          alert('About text should be at most 100 words (currently ' + wn + ').');
          aboutEl.focus();
          return false;
        }
      }
    }

    if (currentStep === 1) {
      if (!selectedType) {
        const err = document.getElementById('biz-type-error');
        if (err) err.hidden = false;
        alert('Please select a business type first.');
        return false;
      }
      const name = document.getElementById('field-business-name');
      const tagline = document.getElementById('field-tagline');
      const about = document.getElementById('field-about');
      let valid = true;
      [name, tagline, about].forEach(field => {
        if (field && !field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else if (field) {
          field.style.borderColor = '';
        }
      });
      if (!valid) {
        alert('Please fill Business Name, Tagline and About before continuing.');
      }
      return valid;
    }

    const currentSection = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const requiredFields = currentSection.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) {
      alert('Please fill all required fields marked with * before continuing.');
    }
    return valid;
  }

  nextBtn.addEventListener('click', () => {
    if (validateCurrentStep()) {
      goToStep(currentStep + 1);
    }
  });

  prevBtn.addEventListener('click', () => {
    goToStep(currentStep - 1);
  });

  // Allow clicking on completed steps in sidebar
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = parseInt(item.dataset.step);
      if (target < currentStep) {
        goToStep(target);
      }
    });
  });

  // ---------- Add / Remove Categories ----------
  const categoriesContainer = document.getElementById('categories-container');
  const addCategoryBtn = document.getElementById('add-category');

  addCategoryBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'category-row';
    row.innerHTML = `
      <input type="text" name="categories[]" placeholder="Category name (e.g. Pizza, Services...)" />
      <button type="button" class="btn-icon remove-category" title="Remove">×</button>
    `;
    categoriesContainer.appendChild(row);
  });

  categoriesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-category')) {
      const rows = categoriesContainer.querySelectorAll('.category-row');
      if (rows.length > 1) {
        e.target.closest('.category-row').remove();
      }
    }
  });

  // ---------- Image select preview + confirmation ----------
  var MAX_VIDEO_MB = 25;
  var OK_VIDEO = /\.(mp4|webm|mov|m4v)$/i;

  function setupImagePreview(inputName) {
    var input = form.querySelector('input[name="' + inputName + '"]');
    if (!input) return;

    input.addEventListener('change', function () {
      var box = input.closest('.upload-box');
      if (!box) return;

      var preview = box.querySelector('.upload-preview');
      if (!preview) {
        preview = document.createElement('div');
        preview.className = 'upload-preview';
        box.appendChild(preview);
      }

      var files = input.files;
      if (!files || !files.length) {
        preview.innerHTML = '';
        box.classList.remove('has-file');
        return;
      }

      var html = '';
      var validFiles = [];
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var isImg = file.type.indexOf('image/') === 0;
        var isVid = file.type.indexOf('video/') === 0 || OK_VIDEO.test(file.name);
        if (!isImg && !isVid) {
          html += '<p class="upload-err">✗ Skip ' + file.name + ' (use JPG/PNG or MP4/WebM)</p>';
          continue;
        }
        if (isVid && file.size > MAX_VIDEO_MB * 1024 * 1024) {
          html += '<p class="upload-err">✗ ' + file.name + ' too large (max ' + MAX_VIDEO_MB + ' MB)</p>';
          continue;
        }
        validFiles.push(file);
        var url = URL.createObjectURL(file);
        var sizeLabel = file.size > 1024 * 1024
          ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
          : Math.round(file.size / 1024) + ' KB';
        if (isVid) {
          html += '<video class="preview-video" src="' + url + '" controls playsinline></video>';
          html += '<p class="upload-ok">✓ Video: ' + file.name + ' (' + sizeLabel + ')</p>';
        } else {
          html += '<img src="' + url + '" alt="preview" class="preview-thumb" />';
          html += '<p class="upload-ok">✓ Image: ' + file.name + ' (' + sizeLabel + ')</p>';
        }
      }
      if (validFiles.length) box.classList.add('has-file');
      else box.classList.remove('has-file');
      preview.innerHTML = html || '<p class="upload-err">No valid files</p>';
    });
  }

  setupImagePreview('logo');
  setupImagePreview('favicon');
  setupImagePreview('hero_media');
  setupImagePreview('gallery_images');
  setupImagePreview('gallery_videos');

  // ---------- Color sync ----------
  document.querySelectorAll('.color-picker').forEach(picker => {
    const colorInput = picker.querySelector('input[type="color"]');
    const textInput = picker.querySelector('input[type="text"]');

    colorInput.addEventListener('input', () => {
      textInput.value = colorInput.value;
    });

    textInput.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
        colorInput.value = textInput.value;
      }
    });
  });


  // ===== Supabase helpers (static / no Node) =====
  
  async function requireAuth() {
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    if (!data || !data.session) {
      window.location.href = 'auth.html?next=' + encodeURIComponent('form.html');
      return null;
    }
    return data.session.user;
  }

  function getSupabase() {
    if (window.__grobizzzSb) return window.__grobizzzSb;
    var cfg = window.GROBIZZZ_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY === 'YOUR_ANON_KEY') {
      alert('Please set SUPABASE_URL and SUPABASE_ANON_KEY in js/config.js');
      throw new Error('Missing Supabase config');
    }
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase SDK not loaded. Check script tag in form.html');
    }
    window.__grobizzzSb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
    return window.__grobizzzSb;
  }

  function slugifyName(name) {
    return String(name || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'business';
  }

  async function uniqueSlug(sb, base) {
    var slug = base;
    var n = 0;
    while (n < 50) {
      var res = await sb.from('businesses').select('id').eq('slug', slug).maybeSingle();
      if (!res.data) return slug;
      n += 1;
      slug = base + '-' + n;
    }
    return base + '-' + Date.now();
  }

  async function uploadToStorage(sb, file, bucket) {
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var path = Date.now() + '-' + Math.random().toString(36).slice(2, 9) + '.' + ext;
    var up = await sb.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });
    if (up.error) throw new Error(up.error.message || 'Upload failed');
    var pub = sb.storage.from(bucket).getPublicUrl(path);
    return pub.data.publicUrl;
  }

  // ---------- Upload one file to Supabase via backend ----------
  async function uploadFile(file, bucket) {
    if (!file || !file.size) return null;
    const sb = getSupabase();
    return uploadToStorage(sb, file, bucket);
  }

  // ---------- Form Submit → upload images → create + publish ----------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const formData = new FormData(form);
    const raw = {};
    formData.forEach((value, key) => {
      if (key.endsWith('[]')) {
        const cleanKey = key.slice(0, -2);
        if (!raw[cleanKey]) raw[cleanKey] = [];
        raw[cleanKey].push(value);
      } else {
        raw[key] = value;
      }
    });

    const logoInput = form.querySelector('input[name="logo"]');
    const faviconInput = form.querySelector('input[name="favicon"]');
    const heroInput = form.querySelector('input[name="hero_media"]');
    const galleryInput = form.querySelector('input[name="gallery_images"]');
    const aboutImageInput = form.querySelector('input[name="about_image"]');

    generateBtn.textContent = 'Uploading images…';
    generateBtn.disabled = true;

    try {
      // 1) Upload images
      let logo_url = null;
      let cover_image_url = null;
      let favicon_url = null;
      let about_image_url = null;
      const gallery_urls = [];

      if (logoInput && logoInput.files && logoInput.files[0]) {
        generateBtn.textContent = 'Uploading logo…';
        logo_url = await uploadFile(logoInput.files[0], 'business-logos');
      }

      if (faviconInput && faviconInput.files && faviconInput.files[0]) {
        generateBtn.textContent = 'Uploading favicon…';
        favicon_url = await uploadFile(faviconInput.files[0], 'business-logos');
      }

      if (heroInput && heroInput.files && heroInput.files[0]) {
        const f = heroInput.files[0];
        if (f.type.startsWith('image/')) {
          generateBtn.textContent = 'Uploading cover…';
          cover_image_url = await uploadFile(f, 'business-covers');
        }
      }

      
      if (aboutImageInput && aboutImageInput.files && aboutImageInput.files[0]) {
        generateBtn.textContent = 'Uploading about image…';
        about_image_url = await uploadFile(aboutImageInput.files[0], 'business-gallery');
      }

      if (galleryInput && galleryInput.files && galleryInput.files.length) {
        const files = Array.from(galleryInput.files).slice(0, 20);
        for (let i = 0; i < files.length; i++) {
          generateBtn.textContent = 'Uploading gallery ' + (i + 1) + '/' + files.length + '…';
          const f = files[i];
          const ok = (f.type && (f.type.startsWith('image/') || f.type.startsWith('video/'))) || /\.(mp4|webm|mov|m4v)$/i.test(f.name || '');
          const isVid = (f.type && f.type.startsWith('video/')) || /\.(mp4|webm|mov|m4v)$/i.test(f.name || '');
          if (isVid && f.size > 25 * 1024 * 1024) { alert(f.name + ' is larger than 25 MB'); continue; }
          if (ok) {
            const url = await uploadFile(f, 'business-gallery');
            if (url) gallery_urls.push(url);
          }
        }
      }

      const videoInput = form.querySelector('input[name="gallery_videos"]');
      if (videoInput && videoInput.files && videoInput.files.length) {
        const vfiles = Array.from(videoInput.files).slice(0, 10);
        for (let i = 0; i < vfiles.length; i++) {
          generateBtn.textContent = 'Uploading video ' + (i + 1) + '/' + vfiles.length + '…';
          const url = await uploadFile(vfiles[i], 'business-gallery');
          if (url) gallery_urls.push(url);
        }
      }

      // 2) Build payload
      const cfg = TYPE_CONFIG[selectedType] || TYPE_CONFIG.other;
      const isMenu = cfg.offerMode === 'menu' || cfg.offerMode === 'products';

      const payload = {
        business_name: raw.business_name,
        category: raw.category || selectedType,
        template_slug: raw.template_slug || cfg.template,
        subcategory: raw.specialty_tags || null,
        tagline: raw.tagline,
        about: raw.about,
        description: raw.about,
        year_established: raw.year_established ? Number(raw.year_established) : null,
        phone: raw.phone_primary,
        whatsapp: raw.phone_whatsapp || raw.phone_primary,
        email: raw.email || null,
        address: raw.address,
        city: raw.city,
        pincode: raw.pincode || null,
        google_maps_url: raw.maps_link || null,
        primary_color: (document.getElementById('color_primary') && document.getElementById('color_primary').value) || raw.color_primary || '#c97b3a',
        secondary_color: (document.getElementById('color_secondary') && document.getElementById('color_secondary').value) || raw.color_secondary || '#1a1a1a',
        accent_color: (document.getElementById('color_accent') && document.getElementById('color_accent').value) || raw.color_accent || '#f5f0e8',
        instagram_url: raw.instagram || null,
        facebook_url: raw.facebook || null,
        youtube_url: raw.youtube || null,
        zomato_url: cfg.foodLinks ? (raw.zomato_link || null) : null,
        swiggy_url: cfg.foodLinks ? (raw.swiggy_link || null) : null,
        google_business_url: raw.google_business || null,
        seo_keywords: raw.seo_keywords || null,
        seo_description: raw.meta_description || null,
        logo_url: logo_url,
        cover_image_url: cover_image_url,
        favicon_url: favicon_url,
        gallery_urls: gallery_urls,
        publish: true,
        features: {
          whatsapp: true,
          call: true,
          maps: !!raw.maps_link,
          share: true,
          gallery: true,
          menu: isMenu,
          services: !isMenu,
          social: true,
          vcard: (function(){ var el=document.querySelector('input[name="add_to_contact"]'); return el ? el.checked !== false : true; })(),
          verified: false,
          show_reviews: (function(){ var el=document.querySelector('input[name="show_reviews"]'); return el ? el.checked : true; })(),
          about_image_url: about_image_url || null
        }
      };

      if (raw.hours) {
        payload.hours = [0,1,2,3,4,5,6].map(d => ({
          day_of_week: d, is_closed: false, open_time: '09:00', close_time: '23:00'
        }));
      }

      if (raw.featured_items) {
        payload.featured_items = String(raw.featured_items)
          .split(/[,\n]+/)
          .map(s => s.trim())
          .filter(Boolean);
      }

      // 3) Create + publish via Supabase (no Node)
      generateBtn.textContent = 'Creating profile…';
      const sb = getSupabase();
      const baseSlug = slugifyName(payload.business_name || payload.subdomain || 'business');
      const slug = await uniqueSlug(sb, baseSlug);

      // Resolve template id
      let templateId = null;
      if (payload.template_slug) {
        const { data: tpl } = await sb.from('templates').select('id').eq('slug', payload.template_slug).maybeSingle();
        if (tpl) templateId = tpl.id;
      }

      const row = {
        business_name: payload.business_name,
        slug,
        category: payload.category,
        subcategory: payload.subcategory || null,
        tagline: payload.tagline || null,
        description: payload.description || payload.about || null,
        about: payload.about || null,
        year_established: payload.year_established || null,
        phone: payload.phone || null,
        whatsapp: payload.whatsapp || payload.phone || null,
        email: payload.email || null,
        address: payload.address || null,
        city: payload.city || null,
        pincode: payload.pincode || null,
        google_maps_url: payload.google_maps_url || null,
        google_business_url: payload.google_business_url || null,
        instagram_url: payload.instagram_url || null,
        facebook_url: payload.facebook_url || null,
        youtube_url: payload.youtube_url || null,
        zomato_url: payload.zomato_url || null,
        swiggy_url: payload.swiggy_url || null,
        primary_color: payload.primary_color || '#c97b3a',
        secondary_color: payload.secondary_color || '#1a1a1a',
        accent_color: payload.accent_color || '#f5f0e8',
        template_id: templateId,
        features: payload.features || {},
        seo_keywords: payload.seo_keywords || null,
        seo_description: payload.seo_description || null,
        logo_url: payload.logo_url || null,
        cover_image_url: payload.cover_image_url || null,
        favicon_url: payload.favicon_url || null,
        status: 'draft',
        published_at: null
      };

      // Attach logged-in user (required)
      const user = await requireAuth();
      if (!user) return;
      row.user_id = user.id;
      // payment_status for publish gate
      if (!row.features) row.features = {};
      row.features = Object.assign({}, row.features, {
        payment_status: 'unpaid',
        is_live: false
      });

      const { data: business, error: insErr } = await sb.from('businesses').insert(row).select().single();
      if (insErr) throw new Error(insErr.message || 'Failed to create profile');

      // Gallery rows
      const galleryUrls = payload.gallery_urls || [];
      if (galleryUrls.length) {
        const rows = galleryUrls.map((url, i) => ({
          business_id: business.id,
          image_url: url,
          display_order: i
        }));
        await sb.from('gallery').insert(rows);
      }

      const siteCfg = window.GROBIZZZ_CONFIG || {};
      // Preview only — not live until payment + publish
      const previewUrl = 'profile.html?slug=' + encodeURIComponent(slug) + '&preview=1';
      alert(
        'Draft saved!\n\n' +
        business.business_name + '\n' +
        'Preview your website next.\n' +
        'Publish goes live only after payment.'
      );
      window.location.href = previewUrl;
    } catch (err) {
      console.error(err);
      alert('Unable to create profile. ' + (err.message || 'Please try again.'));
      generateBtn.textContent = 'Generate My Website 🚀';
      generateBtn.disabled = false;
    }
  });

  // Init — must be logged in
  requireAuth().then(function (user) {
    if (!user) return;
    goToStep(1);
  });
});
