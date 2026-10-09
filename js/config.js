window.BIRTHDAY_CONFIG = {

  audio: {
    soundtrack: "assets/music/song.mp3", // Set your song path here
    volume: 0.75                        // Clean ambient volume level
  },

  videos: {
    landing: "assets/page1.mp4",
    closed: "assets/page2-boxclosed.mp4",
    opening: "assets/page2-boxopening.mp4",
    open: "assets/page2-boxopened.mp4",
    dracarysFire: "assets/page2-dracarys.mp4",
    page3Animation: "assets/page3.mp4",
    page4: "assets/page4.mp4"
  },

  cardsPage2: [
    { id: "p2-card-1", title: "Memory I", image: "assets/cards/card1.jpg", hoverText: "Aar nijek koto dekhbi" },
    { id: "p2-card-2", title: "Memory II", image: "assets/cards/card2.jpg", hoverText: "Hmm onek sundor lagche" },
    { id: "p2-card-3", title: "Memory III", image: "assets/cards/card3.jpg", hoverText: "Ok onek dat ber korechis ebr bondho kor" },
    { id: "p2-card-4", title: "Memory IV", image: "assets/cards/card4.jpg", hoverText: "Hello priety" },
    { id: "p2-card-5", title: "Memory V", image: "assets/cards/card5.jpg", hoverText: "College er din gulo miss kori valo din chilo" }
  ],

  // Exactly 5 greeting cards for Page 3's 3D Messy Physical Bundle
  greetingsPage3: [
    {
      id: "greet-1",
      eyebrow: "",
      title: "Subho Jonmodin Shreya",
      text: "Wishing you a very happiest birthday, khub bhalo thak, sustho thak, enjoy kor, jani na tr valo lagbe ki, but joto ta pari chesta korlam, jibone onek unnoti kor success pa etai asa kori, Best of luck for your great future."
    },
    {
      id: "greet-2",
      eyebrow: "",
      title: "",
      text: "Tui joto ta amay chinis hoi to bondhu hisebe erom khub kom jonei ache but tui joto ta help koris amay erom hoi to keu korbe na in futureu, thank you for being my friend, ami jani na ami koto ta contribute kori amader friendship a but thanks."
    },
    {
      id: "greet-3",
      eyebrow: "",
      title: "",
      text: "Aj ker din ta ebong poroborti sob din e jeno tor valo katuk etai asa kori."
    },
    {
      id: "greet-4",
      eyebrow: "",
      title: "",
      text: "Ami sob somoi tor pase achi ebong thakbo always."
    },
    {
      id: "greet-5",
      eyebrow: "",
      title: "",
      text: "Aar besi kichu bolbo na, chakri peye bhule jas na byas etay chai."
    }
  ],

  page4: {
    kicker: "",
    title: "VALAR MORGHULIS",
    message: ""
  },

  timing: {
    pageTransition: 1600,
    chestButtonDelay: 2500,        // Delay before "OPEN CHEST" button appears over box 1
    crossfadeBlend: 450,           // Clean video-to-video crossfade without ghosting
    cardStartDelay: 900,          // Delay after box opens before cards eject
    cardPopDuration: 1800,        // Slow, smooth card emergence
    cardStagger: 220,
    cardSettle: 700,
    cardReturnDuration: 1800,     // Slow, smooth card retreat into chest
    cardReturnStagger: 180,
    page3CrossfadeDuration: 800,  // Smooth blend from fire smoke into Page 3
    page3ToPage4Crossfade: 1400
  }
};