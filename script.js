/**
 * MUHAMMAD IDRIS MARZUKI - PORTFOLIO INTERACTIVITY & ANIMATIONS SCRIPT
 * Dual Theme (Dark/Light), Typewriter Rotator, Spotlight Cursor Glow, 
 * 3D Card Tilt, Animated Counter, Scroll Progress, and Filtering.
 */

// Immediate Theme Initialization (prevents flash of wrong theme)
(function () {
  const savedTheme = localStorage.getItem("portfolio_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const activeTheme = savedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", activeTheme);
})();

document.addEventListener("DOMContentLoaded", function () {
  // ---------------------------------------------------------
  // 1. TOP SCROLL PROGRESS BAR
  // ---------------------------------------------------------
  const scrollProgressBar = document.getElementById("scrollProgress");
  function updateScrollProgress() {
    if (!scrollProgressBar) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    scrollProgressBar.style.width = progress + "%";
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  // ---------------------------------------------------------
  // 2. THEME TOGGLE SYSTEM (DARK / LIGHT MODE)
  // ---------------------------------------------------------
  const themeToggleBtns = document.querySelectorAll(".theme-toggle");

  function updateThemeUI(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio_theme", theme);

    themeToggleBtns.forEach(function (btn) {
      if (theme === "light") {
        btn.innerHTML = '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
        btn.setAttribute("title", "Mode Terang Aktif (Klik untuk Mode Gelap)");
        btn.setAttribute("aria-label", "Switch to Dark Mode");
      } else {
        btn.innerHTML = '<i class="fa-solid fa-moon" style="color: #38bdf8;"></i>';
        btn.setAttribute("title", "Mode Gelap Aktif (Klik untuk Mode Terang)");
        btn.setAttribute("aria-label", "Switch to Light Mode");
      }
    });

    // Adapt particles color seamlessly
    if (window.pJSDom && window.pJSDom.length > 0) {
      const isLight = theme === "light";
      const pColors = isLight ? ["#0284c7", "#4f46e5", "#0891b2"] : ["#38bdf8", "#818cf8", "#22d3ee"];
      const lineColor = isLight ? "#0284c7" : "#38bdf8";
      try {
        const pJS = window.pJSDom[0].pJS;
        pJS.particles.color.value = pColors;
        pJS.particles.line_linked.color = lineColor;
        pJS.fn.particlesRefresh();
      } catch (err) {
        // Silent catch
      }
    }
  }

  const initialTheme = document.documentElement.getAttribute("data-theme") || "dark";
  updateThemeUI(initialTheme);

  themeToggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      updateThemeUI(next);
    });
  });

  // ---------------------------------------------------------
  // 3. DYNAMIC TYPEWRITER ROTATOR IN HERO
  // ---------------------------------------------------------
  const dynamicWordEl = document.getElementById("dynamicWord");
  if (dynamicWordEl) {
    const phrases = [
      "Laravel & Flask Web Apps",
      "Flutter Mobile Applications",
      "FastAPI Backend APIs",
      "Modern UI/UX in Figma",
      "Scalable Software Architecture"
    ];
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let isDeleting = false;
    let typingSpeed = 90;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        dynamicWordEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        dynamicWordEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end of word
        isDeleting = true;
        typingSpeed = 2200;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 450;
      }

      setTimeout(typeLoop, typingSpeed);
    }

    setTimeout(typeLoop, 1500);
  }

  // ---------------------------------------------------------
  // 4. INTERACTIVE 3D PERSPECTIVE TILT ON PORTRAIT
  // ---------------------------------------------------------
  const portraitWrapper = document.querySelector(".portrait-wrapper");
  const portraitCard = document.querySelector(".portrait-card");

  if (portraitWrapper && portraitCard) {
    portraitWrapper.addEventListener("mousemove", function (e) {
      const rect = portraitWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / (rect.height / 2)) * 10;
      const rotateY = (x / (rect.width / 2)) * 10;
      portraitCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    portraitWrapper.addEventListener("mouseleave", function () {
      portraitCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  }

  // ---------------------------------------------------------
  // 5. SPOTLIGHT CURSOR HOVER ILLUMINATION
  // ---------------------------------------------------------
  const spotlightCards = document.querySelectorAll(".spotlight-card");
  spotlightCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // ---------------------------------------------------------
  // 5B. SMOOTH ANIMATED CUSTOM CURSOR SYSTEM (DESKTOP)
  // ---------------------------------------------------------
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  const cursorGlow = document.getElementById("cursorGlow");

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let mouseX = -500, mouseY = -500;
    let ringX = -500, ringY = -500;
    let glowX = -500, glowY = -500;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorDot) {
        cursorDot.style.opacity = "1";
        cursorDot.style.left = mouseX + "px";
        cursorDot.style.top = mouseY + "px";
      }
      if (cursorRing) {
        cursorRing.style.opacity = "1";
      }
      if (cursorGlow) {
        cursorGlow.style.opacity = "1";
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      if (cursorDot) cursorDot.style.opacity = "0";
      if (cursorRing) cursorRing.style.opacity = "0";
      if (cursorGlow) cursorGlow.style.opacity = "0";
    });

    document.addEventListener("mouseenter", function () {
      if (cursorDot) cursorDot.style.opacity = "1";
      if (cursorRing) cursorRing.style.opacity = "1";
    });

    // Smooth physics trailing animation (lerp factor: 0.18 for ring, 0.10 for ambient glow)
    function animateCursorPhysics() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (cursorRing) {
        cursorRing.style.left = ringX + "px";
        cursorRing.style.top = ringY + "px";
      }

      if (cursorGlow) {
        glowX += (mouseX - glowX) * 0.10;
        glowY += (mouseY - glowY) * 0.10;
        cursorGlow.style.left = glowX + "px";
        cursorGlow.style.top = glowY + "px";
      }

      requestAnimationFrame(animateCursorPhysics);
    }
    requestAnimationFrame(animateCursorPhysics);

    // Interactive Hover expansion on buttons, links, cards, pills
    const hoverSelectors = "a, button, input, textarea, select, .bento-card, .portfolio-card, .social-pill, .tab-btn, .theme-toggle, .btn-primary, .btn-secondary, .cert-card, .stat-item, .portrait-card";

    document.addEventListener("mouseover", function (e) {
      if (e.target && e.target.closest && e.target.closest(hoverSelectors)) {
        cursorRing?.classList.add("cursor-hover");
        cursorDot?.classList.add("cursor-hover");
      }
    });

    document.addEventListener("mouseout", function (e) {
      if (e.target && e.target.closest && e.target.closest(hoverSelectors)) {
        cursorRing?.classList.remove("cursor-hover");
        cursorDot?.classList.remove("cursor-hover");
      }
    });

    document.addEventListener("mousedown", function () {
      cursorRing?.classList.add("cursor-active");
    });

    document.addEventListener("mouseup", function () {
      cursorRing?.classList.remove("cursor-active");
    });
  }

  // ---------------------------------------------------------
  // 5C. INTERACTIVE 3D PERSPECTIVE TILT ON PORTFOLIO CARDS
  // ---------------------------------------------------------
  const portfolioCards = document.querySelectorAll(".portfolio-card");
  portfolioCards.forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (-y / (rect.height / 2)) * 6;
      const rotY = (x / (rect.width / 2)) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px) scale(1.015)`;
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
    });
  });

  // ---------------------------------------------------------
  // 6. ANIMATED NUMBER COUNTERS (COUNT-UP)
  // ---------------------------------------------------------
  const counterElements = document.querySelectorAll(".count-animate");
  let countersAnimated = false;

  function runCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counterElements.forEach(function (el) {
      const target = parseInt(el.getAttribute("data-target"), 10) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1600;
      const startTime = performance.now();

      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * target);

        el.innerText = currentVal + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          el.innerText = target + suffix;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const statsSection = document.querySelector(".stats-strip");
  if (statsSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounters();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsSection);
  } else {
    runCounters();
  }

  // ---------------------------------------------------------
  // 7. MOBILE MENU DRAWER TOGGLE
  // ---------------------------------------------------------
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-link");

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      const isActive = mobileDrawer.classList.toggle("active");
      mobileToggle.innerHTML = isActive 
        ? '<i class="fa-solid fa-xmark"></i>' 
        : '<i class="fa-solid fa-bars"></i>';
    });

    document.addEventListener("click", function (e) {
      if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove("active");
        mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        mobileDrawer.classList.remove("active");
        mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  // ---------------------------------------------------------
  // 8. HEADER SCROLL EFFECT & ACTIVE SECTION SPY
  // ---------------------------------------------------------
  const header = document.querySelector(".site-header");
  const sections = document.querySelectorAll("section[id]");

  function onScroll() {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }

    const scrollY = window.pageYOffset + 120;
    sections.forEach(function (current) {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute("id");
      const navItem = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navItem?.classList.add("active");
      } else {
        navItem?.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------------
  // 9. PORTFOLIO FILTER & DYNAMIC PAGINATION
  // ---------------------------------------------------------
  const wrapper = document.getElementById("portfolio-wrapper");
  const pageNumbersContainer = document.getElementById("page-numbers");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (wrapper) {
    const allCards = Array.from(wrapper.getElementsByClassName("portfolio-card-link"));
    let activeCategory = "all";
    let currentPage = 1;

    function getFilteredCards() {
      if (activeCategory === "all") return allCards;
      return allCards.filter(function (card) {
        return card.getAttribute("data-category") === activeCategory;
      });
    }

    function perPage() {
      return window.matchMedia("(max-width: 768px)").matches ? 3 : 6;
    }

    function displayPage(page) {
      const filtered = getFilteredCards();
      const itemsPerPage = perPage();
      const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

      if (page > totalPages) page = totalPages;
      if (page < 1) page = 1;
      currentPage = page;

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;

      allCards.forEach(function (card) {
        card.style.display = "none";
        card.style.opacity = "0";
      });

      filtered.forEach(function (card, idx) {
        if (idx >= start && idx < end) {
          card.style.display = "block";
          setTimeout(function () {
            card.style.opacity = "1";
          }, 30);
        }
      });

      renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
      if (!pageNumbersContainer) return;
      pageNumbersContainer.innerHTML = "";

      if (totalPages <= 1) return;

      for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement("button");
        pageLink.type = "button";
        pageLink.innerText = i;
        pageLink.className = `page-number ${i === currentPage ? "active" : ""}`;
        pageLink.setAttribute("aria-label", "Go to page " + i);

        pageLink.onclick = function (e) {
          e.preventDefault();
          currentPage = i;
          displayPage(currentPage);
          document.getElementById("portfolios")?.scrollIntoView({ behavior: "smooth" });
        };

        pageNumbersContainer.appendChild(pageLink);
      }
    }

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeCategory = btn.getAttribute("data-filter") || "all";
        currentPage = 1;
        displayPage(currentPage);
      });
    });

    window.nextPage = function () {
      const filtered = getFilteredCards();
      const totalPages = Math.ceil(filtered.length / perPage());
      if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentPage);
      }
    };

    window.prevPage = function () {
      if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
      }
    };

    window.addEventListener("resize", function () {
      displayPage(currentPage);
    });

    // First initial render
    displayPage(1);
  }

  // ---------------------------------------------------------
  // 10. CREDENTIAL LIGHTBOX & VIEWER MODAL
  // ---------------------------------------------------------
  const CERTIFICATES_DATA = {
    "dicoding-ai": {
      title: "Belajar Dasar AI",
      issuer: "Dicoding Indonesia",
      badge: "PDF",
      date: "Jan 2026 – Jan 2029",
      downloadUrl: "images/certificates/cert-dicoding-ai.jpg",
      pages: [
        "images/certificates/cert-dicoding-ai.jpg",
        "images/certificates/cert-dicoding-ai-p2.jpg"
      ]
    },
    "revou-data": {
      title: "Intro to Data Analytics",
      issuer: "RevoU",
      badge: "IMAGE",
      date: "2024 · No Expired",
      downloadUrl: "images/certificates/cert-revou-data.jpg",
      pages: [
        "images/certificates/cert-revou-data.jpg"
      ]
    },
    "huawei-storage": {
      title: "HCIA-Storage V5.0 Course",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-storage.png",
      pages: [
        "images/certificates/cert-huawei-storage.png"
      ]
    },
    "huawei-bigdata": {
      title: "Big Data Mining",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2024 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-bigdata.png",
      pages: [
        "images/certificates/cert-huawei-bigdata.png"
      ]
    },
    "huawei-python": {
      title: "Python Programming Basic",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-python.png",
      pages: [
        "images/certificates/cert-huawei-python.png"
      ]
    },
    "huawei-algo": {
      title: "Algorithm & Design",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-algo.png",
      pages: [
        "images/certificates/cert-huawei-algo.png"
      ]
    },
    "huawei-ai-basic": {
      title: "AI Basic",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-ai-basic.png",
      pages: [
        "images/certificates/cert-huawei-ai-basic.png"
      ]
    },
    "huawei-ai-overview": {
      title: "Overview of AI",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-ai-overview.png",
      pages: [
        "images/certificates/cert-huawei-ai-overview.png"
      ]
    },
    "huawei-network": {
      title: "Computer Network",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-network.png",
      pages: [
        "images/certificates/cert-huawei-network.png"
      ]
    },
    "huawei-network-cra": {
      title: "Computer Network (CRA)",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-network-cra.png",
      pages: [
        "images/certificates/cert-huawei-network-cra.png"
      ]
    },
    "huawei-datamgmt": {
      title: "Data Management & Analytics",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-datamgmt.png",
      pages: [
        "images/certificates/cert-huawei-datamgmt.png"
      ]
    },
    "huawei-datamgmt-cra": {
      title: "Data Management (CRA)",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-datamgmt-cra.png",
      pages: [
        "images/certificates/cert-huawei-datamgmt-cra.png"
      ]
    },
    "huawei-inforep": {
      title: "Information Representation & Data Organization",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-inforep.png",
      pages: [
        "images/certificates/cert-huawei-inforep.png"
      ]
    },
    "huawei-inforep-cra": {
      title: "Information Representation (CRA)",
      issuer: "Huawei ICT Academy",
      badge: "IMAGE",
      date: "2025 · No Expired",
      downloadUrl: "images/certificates/cert-huawei-inforep-cra.png",
      pages: [
        "images/certificates/cert-huawei-inforep-cra.png"
      ]
    }
  };

  const modal = document.getElementById("credViewerModal");
  if (modal) {
    const stageImg = document.getElementById("credStageImg");
    const stageWrap = document.getElementById("credStageWrap");
    const docName = document.getElementById("credDocName");
    const thumbList = document.getElementById("credThumbList");
    const pageText = document.getElementById("credPageText");
    const zoomVal = document.getElementById("credZoomVal");
    const btnClose = document.getElementById("credModalClose");
    const btnDownload = document.getElementById("credModalDownload");
    const btnPrev = document.getElementById("credPagePrev");
    const btnNext = document.getElementById("credPageNext");
    const btnZoomIn = document.getElementById("credZoomIn");
    const btnZoomOut = document.getElementById("credZoomOut");
    const btnZoomReset = document.getElementById("credZoomReset");
    const btnToggleSidebar = document.getElementById("credToggleSidebar");
    const sidebar = document.getElementById("credSidebar");

    let currentCert = null;
    let currentPageIdx = 0;
    let currentZoom = 100;

    function renderStage() {
      if (!currentCert) return;
      const pages = currentCert.pages;
      stageImg.src = pages[currentPageIdx];
      pageText.textContent = `${currentPageIdx + 1} / ${pages.length}`;
      zoomVal.textContent = `${currentZoom}%`;
      stageWrap.style.transform = `scale(${currentZoom / 100})`;

      // Update sidebar active thumb
      const thumbs = thumbList.querySelectorAll(".cred-thumb-item");
      thumbs.forEach((th, idx) => {
        if (idx === currentPageIdx) {
          th.classList.add("active");
        } else {
          th.classList.remove("active");
        }
      });
    }

    function openCertViewer(certId) {
      const data = CERTIFICATES_DATA[certId];
      if (!data) return;
      currentCert = data;
      currentPageIdx = 0;
      currentZoom = 100;

      docName.textContent = data.title;
      if (btnDownload) {
        btnDownload.href = data.downloadUrl || data.pages[0];
        btnDownload.setAttribute("download", `${data.title.replace(/[^a-zA-Z0-9_-]/g, "_")}`);
      }

      // Build thumbnail strip
      thumbList.innerHTML = "";
      data.pages.forEach((pageImg, idx) => {
        const item = document.createElement("div");
        item.className = `cred-thumb-item ${idx === 0 ? "active" : ""}`;
        item.innerHTML = `
          <div class="cred-thumb-wrap">
            <img src="${pageImg}" alt="Halaman ${idx + 1}">
          </div>
          <span class="cred-thumb-num">${idx + 1}</span>
        `;
        item.addEventListener("click", function () {
          currentPageIdx = idx;
          renderStage();
        });
        thumbList.appendChild(item);
      });

      renderStage();
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeCertViewer() {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    // Attach click listeners to all open-cert buttons/links
    document.querySelectorAll("[data-open-cert]").forEach((el) => {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        const certId = this.getAttribute("data-open-cert");
        openCertViewer(certId);
      });
    });

    if (btnClose) btnClose.addEventListener("click", closeCertViewer);

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeCertViewer();
    });

    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("active")) return;
      if (e.key === "Escape") closeCertViewer();
      if (e.key === "ArrowRight") {
        if (currentCert && currentPageIdx < currentCert.pages.length - 1) {
          currentPageIdx++;
          renderStage();
        }
      }
      if (e.key === "ArrowLeft") {
        if (currentCert && currentPageIdx > 0) {
          currentPageIdx--;
          renderStage();
        }
      }
    });

    if (btnPrev) {
      btnPrev.addEventListener("click", function () {
        if (currentCert && currentPageIdx > 0) {
          currentPageIdx--;
          renderStage();
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener("click", function () {
        if (currentCert && currentPageIdx < currentCert.pages.length - 1) {
          currentPageIdx++;
          renderStage();
        }
      });
    }

    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", function () {
        if (currentZoom < 250) {
          currentZoom += 25;
          renderStage();
        }
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", function () {
        if (currentZoom > 50) {
          currentZoom -= 25;
          renderStage();
        }
      });
    }

    if (btnZoomReset) {
      btnZoomReset.addEventListener("click", function () {
        currentZoom = 100;
        renderStage();
      });
    }

    if (btnToggleSidebar && sidebar) {
      btnToggleSidebar.addEventListener("click", function () {
        sidebar.classList.toggle("hidden");
        this.classList.toggle("active");
      });
    }
  }

  // ---------------------------------------------------------
  // 11. CERTIFICATE CAROUSEL & CATEGORY FILTERING
  // ---------------------------------------------------------
  const certTrack = document.getElementById("certTrack");
  const btnCertPrev = document.getElementById("certSlidePrev");
  const btnCertNext = document.getElementById("certSlideNext");
  const certFilterBtns = document.querySelectorAll("[data-cert-filter]");
  const certSlides = document.querySelectorAll(".cert-carousel-slide");

  function updateCertNavButtons() {
    if (!certTrack || !btnCertPrev || !btnCertNext) return;
    const maxScroll = certTrack.scrollWidth - certTrack.clientWidth;
    btnCertPrev.disabled = certTrack.scrollLeft <= 4;
    btnCertNext.disabled = certTrack.scrollLeft >= maxScroll - 4;
  }

  if (certTrack && btnCertPrev && btnCertNext) {
    btnCertPrev.addEventListener("click", function () {
      const slide = certTrack.querySelector(".cert-carousel-slide:not(.hidden)");
      const scrollStep = slide ? slide.offsetWidth + 24 : 320;
      certTrack.scrollBy({ left: -scrollStep, behavior: "smooth" });
    });

    btnCertNext.addEventListener("click", function () {
      const slide = certTrack.querySelector(".cert-carousel-slide:not(.hidden)");
      const scrollStep = slide ? slide.offsetWidth + 24 : 320;
      certTrack.scrollBy({ left: scrollStep, behavior: "smooth" });
    });

    certTrack.addEventListener("scroll", updateCertNavButtons, { passive: true });
    window.addEventListener("resize", updateCertNavButtons, { passive: true });
    setTimeout(updateCertNavButtons, 200);
  }

  if (certFilterBtns.length && certSlides.length) {
    certFilterBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        certFilterBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        const targetFilter = this.getAttribute("data-cert-filter");
        certSlides.forEach((slide) => {
          const category = slide.getAttribute("data-category");
          if (targetFilter === "all" || category === targetFilter) {
            slide.classList.remove("hidden");
          } else {
            slide.classList.add("hidden");
          }
        });

        if (certTrack) {
          certTrack.scrollTo({ left: 0, behavior: "smooth" });
          setTimeout(updateCertNavButtons, 150);
        }
      });
    });
  }
});
