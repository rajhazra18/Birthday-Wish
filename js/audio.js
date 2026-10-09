(() => {
  "use strict";

  // =========================================================
  // GLOBAL MUSIC CONFIG
  // =========================================================

  const AUDIO_SRC =
    window.BIRTHDAY_CONFIG?.audio?.soundtrack ||
    "assets/music/song.mp3";

  const VOLUME =
    typeof window.BIRTHDAY_CONFIG?.audio?.volume === "number"
      ? window.BIRTHDAY_CONFIG.audio.volume
      : 0.55;


  // =========================================================
  // GLOBAL STATE
  // =========================================================

  let audio = null;

  // true only when the user explicitly stopped the music
  let userManuallyStopped = false;

  // Prevents repeated initialization
  let initialized = false;


  // =========================================================
  // GLOBAL MUSIC BUTTON
  // =========================================================

  const btn = document.getElementById("globalMusicBtn");
  const label = document.getElementById("musicBtnLabel");
  const icon = btn?.querySelector(".music-btn-icon");


  // =========================================================
  // CREATE AUDIO ONLY ONCE
  // =========================================================

  function initAudio() {

    if (audio) {
      return audio;
    }

    audio = new Audio(AUDIO_SRC);

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = VOLUME;

    audio.addEventListener("play", updateButtonUI);
    audio.addEventListener("pause", updateButtonUI);
    audio.addEventListener("ended", updateButtonUI);
    audio.addEventListener("error", handleAudioError);

    return audio;
  }


  // =========================================================
  // BUTTON UI
  // =========================================================

  function updateButtonUI() {

    if (!btn) return;

    const isPlaying =
      audio &&
      !audio.paused &&
      !audio.ended;

    if (isPlaying) {

      btn.classList.add("is-playing");
      btn.classList.remove("is-stopped");

      if (label) {
        label.textContent = "Pause Music";
      }

      if (icon) {
        icon.textContent = "♫";
      }

      btn.setAttribute("aria-label", "Pause music");

    } else {

      btn.classList.remove("is-playing");
      btn.classList.add("is-stopped");

      if (label) {
        label.textContent = "Play Music";
      }

      if (icon) {
        icon.textContent = "▶";
      }

      btn.setAttribute("aria-label", "Play music");
    }
  }


  // =========================================================
  // PLAY MUSIC
  // =========================================================

  async function playMusic() {

    if (userManuallyStopped) {
      return false;
    }

    const sound = initAudio();

    try {

      await sound.play();

      updateButtonUI();

      return true;

    } catch (error) {

      // Browser blocked autoplay.
      // This is expected on some browsers.

      updateButtonUI();

      return false;
    }
  }


  // =========================================================
  // PAUSE MUSIC
  // =========================================================

  function pauseMusic() {

    userManuallyStopped = true;

    if (audio && !audio.paused) {
      audio.pause();
    }

    updateButtonUI();
  }


  // =========================================================
  // RESUME MUSIC
  // =========================================================

  async function resumeMusic() {

    userManuallyStopped = false;

    await playMusic();
  }


  // =========================================================
  // SINGLE TOGGLE BUTTON
  // =========================================================

  function toggleMusic(event) {

    if (event) {
      event.stopPropagation();
    }

    if (!audio || audio.paused) {
      resumeMusic();
    } else {
      pauseMusic();
    }
  }


  // =========================================================
  // FIRST USER INTERACTION
  //
  // IMPORTANT:
  //
  // This listener runs in CAPTURE phase.
  // Therefore it can attempt to start the music BEFORE
  // the page-navigation button's own click handler runs.
  // =========================================================

  function handleFirstInteraction() {

    if (userManuallyStopped) {
      removeInteractionListeners();
      return;
    }

    playMusic();

    removeInteractionListeners();
  }


  function addInteractionListeners() {

    document.addEventListener(
      "pointerdown",
      handleFirstInteraction,
      {
        capture: true,
        once: true
      }
    );

    document.addEventListener(
      "keydown",
      handleFirstInteraction,
      {
        capture: true,
        once: true
      }
    );
  }


  function removeInteractionListeners() {

    document.removeEventListener(
      "pointerdown",
      handleFirstInteraction,
      true
    );

    document.removeEventListener(
      "keydown",
      handleFirstInteraction,
      true
    );
  }


  // =========================================================
  // AUDIO ERROR
  // =========================================================

  function handleAudioError() {

    console.warn(
      "Background music could not be loaded:",
      AUDIO_SRC
    );

    updateButtonUI();
  }


  // =========================================================
  // GLOBAL BUTTON
  // =========================================================

  if (btn) {

    btn.addEventListener(
      "click",
      toggleMusic
    );

  }


  // =========================================================
  // INITIALIZE
  // =========================================================

  if (!initialized) {

    initialized = true;

    initAudio();

    // IMPORTANT:
    // First attempt to autoplay immediately.
    playMusic();

    // If browser blocks autoplay,
    // start on the FIRST permitted interaction.
    addInteractionListeners();

  }

})();