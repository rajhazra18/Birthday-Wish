(() => {
  "use strict";

  const C = window.BIRTHDAY_CONFIG;
  const $ = (id) => document.getElementById(id);

  const app = $("birthdayApp");
  const landingVideo = $("landingVideo");
  const closedVideo = $("closedVideo");
  const openingVideo = $("openingVideo");
  const openVideo = $("openVideo");
  const fireVideo = $("fireVideo");
  const page3Video = $("page3Video");
  const page4Video = $("page4Video");
  const page4Text = $("page4Text");
  const page4Kicker = $("page4Kicker");
  const page4Title = $("page4Title");
  const page4Message = $("page4Message");

  const openSurprise = $("openSurprise");
  const chestOpenBtn = $("chestOpenBtn");
  const memoryDeck = $("memoryDeck");
  const memoryCards = $("memoryCards");
  const dracarysArea = $("dracarysArea");
  const dracarysButton = $("dracarysButton");
  const realmStatus = $("realmStatus");
  const realmTitle = $("realmTitle");
  const realmDescription = $("realmDescription");

  const bundleStage = document.querySelector(".bundle-stage");
  const cardBundle = $("cardBundle");
  const bundlePrevBtn = $("bundlePrevBtn");
  const bundleNextBtn = $("bundleNextBtn");
  const bundleCounter = $("bundleCounter");
  const nextPageArea = $("nextPageArea");
  const nextPageButton = $("nextPageButton");

  const page2Prev = $("page2Prev");
  const page3Prev = $("page3Prev");
  const page4Prev = $("page4Prev");

  const state = {
    page: "landing",
    scene: "landing",
    chestOpened: false,
    cardsSettled: false,
    dracarysStarted: false,
    fireStarted: false,
    page3Started: false,
    page3FirstCycleDone: false,
    page4Started: false,
    activeBundleIndex: 0,
    bundleCards: [],
    timers: []
  };

  const later = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    state.timers.push(id);
    return id;
  };

  function clearAllTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
  }

  function safePlay(video) {
    if (!video) return Promise.reject(new Error("No video"));
    const p = video.play();
    if (p && typeof p.catch === "function") {
      return p.catch(() => undefined);
    }
    return Promise.resolve();
  }

  function resetVideo(video) {
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0;
    } catch (_) {}
  }

  function stopVideo(video) {
    if (video) video.pause();
  }

  function visible(video, isVisible) {
    if (video) video.classList.toggle("is-visible", isVisible);
  }

  function setPage(pageName) {
    state.page = pageName;
    app.dataset.page = pageName;
  }

  function setRealmCopy(status, title, description) {
    if (realmStatus) realmStatus.textContent = status;
    if (realmTitle) realmTitle.textContent = title;
    if (realmDescription) realmDescription.textContent = description;
  }

  /**
   * Waits for the hardware decoder to render an active frame before fading in.
   * Includes a safety timeout fallback to avoid hanging.
   */
  function whenVideoRendering(video, callback) {
    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      callback();
    };

    if ("requestVideoFrameCallback" in video) {
      video.requestVideoFrameCallback(trigger);
    } else {
      video.addEventListener("playing", trigger, { once: true });
    }

    // Safety fallback
    setTimeout(trigger, 120);
  }

  /**
   * Crossfade between two videos with zero ghosting.
   */
  function crossfadeVideos(outgoingVideo, incomingVideo, blendDuration, onComplete) {
    incomingVideo.style.transitionDuration = `${blendDuration}ms`;
    safePlay(incomingVideo);

    whenVideoRendering(incomingVideo, () => {
      visible(incomingVideo, true);

      later(() => {
        if (outgoingVideo && outgoingVideo !== incomingVideo) {
          visible(outgoingVideo, false);
          stopVideo(outgoingVideo);
        }
        if (typeof onComplete === "function") onComplete();
      }, blendDuration + 50);
    });
  }

  /**
   * Listens for 100% full playback completion.
   * Requires currentTime > 1.0s to avoid false triggers on stale ended timestamps.
   */
  function onVideoComplete(video, callback) {
    let fired = false;
    const done = () => {
      if (fired) return;
      fired = true;
      video.removeEventListener("ended", done);
      video.removeEventListener("timeupdate", checkTime);
      callback();
    };

    const checkTime = () => {
      if (video.duration && video.currentTime > 1.0 && video.currentTime >= video.duration - 0.25) {
        done();
      }
    };

    video.addEventListener("ended", done, { once: true });
    video.addEventListener("timeupdate", checkTime);

    const maxWait = (video.duration && !isNaN(video.duration) ? video.duration : 12) * 1000 + 1000;
    later(done, maxWait);
  }

  /* ========================================================
     PAGE 1 -> PAGE 2
  ========================================================= */
  function enterRealm() {
    if (state.page !== "landing") return;
    setPage("realm");
    state.scene = "closed";

    page2Prev.disabled = false;
    page3Prev.disabled = true;
    page4Prev.disabled = true;

    chestOpenBtn.classList.remove("is-visible", "is-vanished");
    chestOpenBtn.classList.add("is-hidden");

    resetVideo(closedVideo);
    visible(closedVideo, true);
    safePlay(closedVideo);

    later(() => {
      stopVideo(landingVideo);
    }, C.timing.pageTransition);

    later(() => {
      if (state.page === "realm" && state.scene === "closed" && !state.chestOpened) {
        chestOpenBtn.classList.remove("is-hidden");
        chestOpenBtn.classList.add("is-visible");
      }
    }, C.timing.chestButtonDelay);
  }

  /* ========================================================
     PAGE 2: CHEST OPENING (FULL PLAYBACK)
  ========================================================= */
  function openChestSequence() {
    if (state.page !== "realm" || state.chestOpened) return;
    state.chestOpened = true;
    state.scene = "opening";

    chestOpenBtn.classList.remove("is-visible");
    chestOpenBtn.classList.add("is-vanished");

    // setRealmCopy("", "Let the moment unfold", "Treasures long hidden step into the light.");

    openingVideo.loop = false;
    resetVideo(openingVideo);
    crossfadeVideos(closedVideo, openingVideo, C.timing.crossfadeBlend, null);

    onVideoComplete(openingVideo, () => {
      if (state.page !== "realm") return;
      state.scene = "open";

      openVideo.loop = true;
      resetVideo(openVideo);
      crossfadeVideos(openingVideo, openVideo, C.timing.crossfadeBlend, () => {
        later(revealPage2Cards, C.timing.cardStartDelay);
      });
    });
  }

  function createPage2Cards() {
    memoryCards.replaceChildren();
    C.cardsPage2.forEach((card, index) => {
      const article = document.createElement("article");
      article.className = `memory-card memory-card--${index + 1}`;
      article.dataset.cardId = card.id;

      const frame = document.createElement("div");
      frame.className = "memory-card-frame";
      frame.innerHTML = `
        <div class="memory-card-image"></div>
        <div class="memory-card-caption">${card.title}</div>
      `;

      const imgBox = frame.querySelector(".memory-card-image");
      if (card.image) {
        const img = document.createElement("img");
        img.src = card.image;
        img.alt = card.title;
        img.loading = "lazy";
        imgBox.appendChild(img);
      }

      const msg = document.createElement("div");
      msg.className = "memory-message";
      msg.textContent = card.hoverText;

      article.append(frame, msg);
      memoryCards.appendChild(article);
    });
  }

  function revealPage2Cards() {
    if (state.scene !== "open" || state.page !== "realm") return;
    memoryDeck.classList.add("is-visible");
    const cards = [...memoryCards.querySelectorAll(".memory-card")];

    cards.forEach((card, index) => {
      const cs = getComputedStyle(card);
      const fx = cs.getPropertyValue("--final-x").trim() || "0vw";
      const fy = cs.getPropertyValue("--final-y").trim() || "0vh";
      const fry = cs.getPropertyValue("--final-ry").trim() || "0deg";
      const frz = cs.getPropertyValue("--final-rz").trim() || "0deg";

      card.animate([
        { offset: 0, opacity: 0, transform: "translate(-50%,-50%) translate3d(0, 18vh, 30px) scale(0.35)", filter: "blur(5px)" },
        { offset: 0.65, opacity: 1, transform: "translate(-50%,-50%) translate3d(0, -2vh, 120px) scale(0.96)", filter: "blur(0)" },
        { offset: 1, opacity: 1, transform: `translate(-50%, -50%) translate3d(${fx}, ${fy}, 0) rotateX(4deg) rotateY(${fry}) rotateZ(${frz}) scale(1)`, filter: "blur(0)" }
      ], {
        duration: C.timing.cardPopDuration,
        delay: index * C.timing.cardStagger,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both"
      });
    });

    const totalTime = (cards.length - 1) * C.timing.cardStagger + C.timing.cardPopDuration + C.timing.cardSettle;
    later(() => {
      if (state.scene !== "open" || state.page !== "realm") return;
      memoryDeck.classList.add("is-settled");
      state.cardsSettled = true;
      dracarysButton.disabled = false;
      dracarysArea.classList.remove("is-vanished");
      dracarysArea.classList.add("is-visible");
    }, totalTime);
  }

  /* ========================================================
     DRACARYS: SLOW CARD RETREAT, UI FADE & FULL FIRE PLAY
  ========================================================= */
  function startDracarys() {
    if (!state.cardsSettled || state.dracarysStarted || state.page !== "realm") return;
    state.dracarysStarted = true;
    dracarysButton.disabled = true;
    page2Prev.disabled = true;

    // Dissolve entire Page 2 UI away gracefully
    const page2El = $("page2");
    if (page2El) page2El.classList.add("is-dracarys-active");

    // Slower, majestic card retreat into chest
    const cards = [...memoryCards.querySelectorAll(".memory-card")].reverse();
    cards.forEach((card, reverseIdx) => {
      const cs = getComputedStyle(card);
      const fx = cs.getPropertyValue("--final-x").trim() || "0vw";
      const fy = cs.getPropertyValue("--final-y").trim() || "0vh";
      const fry = cs.getPropertyValue("--final-ry").trim() || "0deg";
      const frz = cs.getPropertyValue("--final-rz").trim() || "0deg";

      card.animate([
        { offset: 0, opacity: 1, transform: `translate(-50%, -50%) translate3d(${fx}, ${fy}, 0) rotateX(4deg) rotateY(${fry}) rotateZ(${frz}) scale(1)` },
        { offset: 0.45, opacity: 0.9, transform: "translate(-50%,-50%) translate3d(0, -1vh, 100px) scale(0.85)" },
        { offset: 1, opacity: 0, transform: "translate(-50%,-50%) translate3d(0, 18vh, 15px) scale(0.2)", filter: "blur(6px)" }
      ], {
        duration: C.timing.cardReturnDuration,
        delay: reverseIdx * C.timing.cardReturnStagger,
        easing: "cubic-bezier(0.35, 0, 0.25, 1)",
        fill: "both"
      });
    });

    const retreatTotal = (cards.length - 1) * C.timing.cardReturnStagger + C.timing.cardReturnDuration;

    later(() => {
      memoryDeck.classList.remove("is-visible", "is-settled");
      state.cardsSettled = false;

      // Reset and trigger Dracarys Fire Video cleanly
      state.fireStarted = true;
      fireVideo.loop = false;
      fireVideo.classList.remove("is-fading-out", "is-visible");
      resetVideo(fireVideo);

      crossfadeVideos(openVideo, fireVideo, C.timing.crossfadeBlend, null);

      // Pre-warm Page 3 video
      page3Video.src = C.videos.page3Animation;
      page3Video.loop = false;
      resetVideo(page3Video);

      // Guarantees Dracarys video plays 100% to completion
      onVideoComplete(fireVideo, () => {
        executePage3Crossfade();
      });

    }, retreatTotal + 200);
  }

  function executePage3Crossfade() {
    if (state.page3Started) return;
    state.page3Started = true;

    safePlay(page3Video);

    whenVideoRendering(page3Video, () => {
      setPage("page3");
      fireVideo.classList.add("is-fading-out");

      later(() => {
        visible(fireVideo, false);
        stopVideo(fireVideo);
        visible(openVideo, false);
        stopVideo(openVideo);
      }, C.timing.page3CrossfadeDuration);

      bundleStage.classList.remove("is-active");
      nextPageArea.classList.remove("is-visible");
      nextPageButton.disabled = true;

      // Page 3 video plays 1 full cycle before cards appear
      onVideoComplete(page3Video, () => {
        page3Video.loop = true;
        safePlay(page3Video);
        state.page3FirstCycleDone = true;

        setupPage3CardBundle();
        bundleStage.classList.add("is-active");
        page3Prev.disabled = false;

        later(() => {
          nextPageArea.classList.add("is-visible");
          nextPageButton.disabled = false;
        }, 800);
      });
    });
  }

  /* ========================================================
     PAGE 3: 3D MESSY CARD BUNDLE
  ========================================================= */
  const BUNDLE_TRANSFORMS = {
    0: { x: 0, y: 0, z: 140, rotZ: 0, rotY: 0, scale: 1, opacity: 1, zIndex: 50 },
    "-1": { x: -170, y: 32, z: 45, rotZ: -8.5, rotY: 14, scale: 0.94, opacity: 0.92, zIndex: 35 },
    "-2": { x: -285, y: -28, z: -25, rotZ: -16, rotY: 21, scale: 0.88, opacity: 0.74, zIndex: 20 },
    "-3": { x: -370, y: 45, z: -85, rotZ: -23, rotY: 26, scale: 0.82, opacity: 0.55, zIndex: 10 },
    "-4": { x: -440, y: -20, z: -140, rotZ: -28, rotY: 30, scale: 0.76, opacity: 0.4, zIndex: 5 },
    "1": { x: 180, y: -26, z: 55, rotZ: 9.5, rotY: -13, scale: 0.95, opacity: 0.93, zIndex: 40 },
    "2": { x: 295, y: 36, z: -15, rotZ: 17.5, rotY: -20, scale: 0.89, opacity: 0.78, zIndex: 25 },
    "3": { x: 380, y: -38, z: -75, rotZ: 24, rotY: -25, scale: 0.83, opacity: 0.6, zIndex: 12 },
    "4": { x: 450, y: 25, z: -130, rotZ: 29, rotY: -29, scale: 0.77, opacity: 0.42, zIndex: 6 }
  };

  const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V"];

  function setupPage3CardBundle() {
    cardBundle.replaceChildren();
    state.activeBundleIndex = 0;
    state.bundleCards = [];

    C.greetingsPage3.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = `bundle-card bundle-card--${index + 1}`;
      card.dataset.index = index;
      card.innerHTML = `
        <div class="bundle-card-inner">
          <span class="bundle-eyebrow">${item.eyebrow}</span>
          <h2>${item.title}</h2>
          <p>${item.text}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        if (state.activeBundleIndex !== index) {
          state.activeBundleIndex = index;
          renderBundleCards();
        }
      });

      cardBundle.appendChild(card);
      state.bundleCards.push(card);
    });

    renderBundleCards();
  }

  function renderBundleCards() {
    const total = state.bundleCards.length;
    const active = state.activeBundleIndex;

    state.bundleCards.forEach((card, index) => {
      const delta = index - active;
      const tf = BUNDLE_TRANSFORMS[delta] || (delta < 0 ? BUNDLE_TRANSFORMS["-4"] : BUNDLE_TRANSFORMS["4"]);

      card.style.transform = `translate(-50%, -50%) translate3d(${tf.x}px, ${tf.y}px, ${tf.z}px) rotateZ(${tf.rotZ}deg) rotateY(${tf.rotY}deg) scale(${tf.scale})`;
      card.style.opacity = tf.opacity;
      card.style.zIndex = tf.zIndex;

      card.classList.toggle("is-active-card", delta === 0);
    });

    bundleCounter.textContent = `${ROMAN_NUMERALS[active]} / ${ROMAN_NUMERALS[total - 1]}`;
    bundlePrevBtn.disabled = active === 0;
    bundleNextBtn.disabled = active === total - 1;
  }

  function bundleNext() {
    if (state.activeBundleIndex < state.bundleCards.length - 1) {
      state.activeBundleIndex++;
      renderBundleCards();
    }
  }

  function bundlePrev() {
    if (state.activeBundleIndex > 0) {
      state.activeBundleIndex--;
      renderBundleCards();
    }
  }

  /* ========================================================
     PAGE 4: VALAR MORGHULIS
  ========================================================= */
  function startPage4Transition() {
    if (state.page !== "page3" || state.page4Started) return;
    state.page4Started = true;

    page4Video.src = C.videos.page4;
    page4Video.loop = true;
    page4Video.muted = true;
    resetVideo(page4Video);
    safePlay(page4Video);

    whenVideoRendering(page4Video, () => {
      setPage("page4");
      page3Prev.disabled = true;
      page4Prev.disabled = false;

      page4Kicker.textContent = C.page4.kicker;
      page4Title.textContent = C.page4.title;
      page4Message.textContent = C.page4.message;
    });
  }

  /* ========================================================
     BACKWARD NAVIGATION (COMPLETE REPLAY OF PAGE 2)
  ========================================================= */
  function goBackToPage1() {
    clearAllTimers();
    const page2El = $("page2");
    if (page2El) page2El.classList.remove("is-dracarys-active");

    setPage("landing");
    state.scene = "landing";
    state.chestOpened = false;
    state.cardsSettled = false;
    state.dracarysStarted = false;
    state.fireStarted = false;

    page2Prev.disabled = true;
    chestOpenBtn.classList.remove("is-visible");
    chestOpenBtn.classList.add("is-vanished");

    stopRealmVideos();
    resetVideo(landingVideo);
    safePlay(landingVideo);
  }

  /**
   * Resets Page 2 fully so Dracarys and the chest replay cleanly from scratch.
   */
  function goBackToPage2FromPage3() {
    if (state.page !== "page3") return;
    clearAllTimers();

    const page2El = $("page2");
    if (page2El) page2El.classList.remove("is-dracarys-active");

    // Reset video and transition flags
    state.page3Started = false;
    state.page3FirstCycleDone = false;
    state.fireStarted = false;
    state.dracarysStarted = false;
    state.chestOpened = false;
    state.cardsSettled = false;
    state.scene = "closed";

    stopVideo(page3Video);
    resetVideo(page3Video);
    bundleStage.classList.remove("is-active");
    nextPageArea.classList.remove("is-visible");

    // Recreate fresh card DOM elements
    createPage2Cards();

    // Reset all video states and clean classes
    stopRealmVideos();

    // Return to Page 2
    setPage("realm");
    page3Prev.disabled = true;
    page2Prev.disabled = false;

    dracarysArea.classList.remove("is-visible");
    dracarysArea.classList.add("is-vanished");
    dracarysButton.disabled = true;

    chestOpenBtn.classList.remove("is-visible", "is-vanished");
    chestOpenBtn.classList.add("is-hidden");

    // Loop closed box freshly
    resetVideo(closedVideo);
    visible(closedVideo, true);
    safePlay(closedVideo);

    setRealmCopy("The chest is waiting", "What lies within", "Some surprises should be discovered, not announced.");

    // Fade in "OPEN CHEST" button after delay
    later(() => {
      if (state.page === "realm" && state.scene === "closed" && !state.chestOpened) {
        chestOpenBtn.classList.remove("is-hidden");
        chestOpenBtn.classList.add("is-visible");
      }
    }, C.timing.chestButtonDelay);
  }

  function goBackToPage3FromPage4() {
    if (state.page !== "page4") return;
    state.page4Started = false;
    stopVideo(page4Video);

    setPage("page3");
    page4Prev.disabled = true;
    page3Prev.disabled = false;
    nextPageButton.disabled = false;
    nextPageArea.classList.add("is-visible");
    bundleStage.classList.add("is-active");
    safePlay(page3Video);
  }

  function stopRealmVideos() {
    [closedVideo, openingVideo, openVideo, fireVideo].forEach((v) => {
      if (v) {
        v.classList.remove("is-visible", "is-fading-out");
        stopVideo(v);
        resetVideo(v);
      }
    });
  }

  function init() {
    landingVideo.src = C.videos.landing;
    closedVideo.src = C.videos.closed;
    openingVideo.src = C.videos.opening;
    openVideo.src = C.videos.open;
    fireVideo.src = C.videos.dracarysFire;

    createPage2Cards();

    openSurprise.addEventListener("click", enterRealm);
    chestOpenBtn.addEventListener("click", openChestSequence);
    dracarysButton.addEventListener("click", startDracarys);
    page2Prev.addEventListener("click", goBackToPage1);

    bundleNextBtn.addEventListener("click", bundleNext);
    bundlePrevBtn.addEventListener("click", bundlePrev);
    page3Prev.addEventListener("click", goBackToPage2FromPage3);
    nextPageButton.addEventListener("click", startPage4Transition);

    page4Prev.addEventListener("click", goBackToPage3FromPage4);

    window.addEventListener("keydown", (e) => {
      if (state.page === "page3") {
        if (e.key === "ArrowRight") bundleNext();
        if (e.key === "ArrowLeft") bundlePrev();
      }
    });

    setPage("landing");
    safePlay(landingVideo);
  }

  window.addEventListener("DOMContentLoaded", init);
})();