// Why Salt Road Cinema exists: the community gets project cars back on the road. Copy + a live "right now" strip.
(() => {
  const now = document.getElementById("story-now");
  if (!now) return;
  const I = window.SRC_I18N, C = window.SRC, D = window.DATA || {};
  I.add({
    en: {
      "story.helpH": "How can <em>you</em> help?", "story.helpP": "Pick a way. Every bit puts a project car back on the road.",
      "story.h": "Bring them <em>back.</em>",
      "story.p1": "Salt Road Cinema films one car project at a time.<br>**Bringing back cars and projects against all odds.**",
      "story.p2": "",
      "story.close": "Sponsored by people who love cars.",
      "story.f1": "A car gets stuck", "story.f1s": "Blown engine, crashed front, no budget.",
      "story.f2": "The island chips in", "story.f2s": "Parts, tools, money, a sticker spot. Every bit counts.",
      "story.f3": "It drives again, on camera", "story.f3s": "Every step filmed. Your name in the video.",
      "story.nowLbl": "In the garage now", "story.nowCar": "2003 Subaru WRX", "story.nowRaised": "raised of", "story.nowBuilt": "built", "story.nowGo": "See the build",
      "story.nowNext": "When she drives, the next car rolls in.",
      "story.w1": "Wear the merch", "story.w1s": "Every tee and cap funds the build.",
      "story.w2": "Fund a part", "story.w2s": "Real parts, real prices. Pick one.",
      "story.w3": "Buy a sticker spot", "story.w3s": "Your logo rides on the car.",
      "story.w4": "Lend or donate gear", "story.w4s": "Engine hoist, jack, tools. We need them.",
      "story.w5": "Bring your project", "story.w5s": "Got a car that needs saving? Tell us."
    },
    nl: {
      "story.helpH": "Hoe kan <em>jij</em> helpen?", "story.helpP": "Kies een manier. Alles helpt een projectauto terug de weg op.",
      "story.h": "Breng ze <em>terug.</em>",
      "story.p1": "Salt Road Cinema filmt één autoproject tegelijk.<br>**We halen auto's en projecten terug, tegen alle verwachtingen in.**",
      "story.p2": "",
      "story.close": "Gesponsord door mensen die van auto's houden.",
      "story.f1": "Een auto staat stil", "story.f1s": "Motor kapot, voorkant in elkaar, geen budget.",
      "story.f2": "Het eiland helpt mee", "story.f2s": "Onderdelen, gereedschap, geld, een stickerplek. Alles telt.",
      "story.f3": "Hij rijdt weer, op camera", "story.f3s": "Elke stap gefilmd. Jouw naam in de video.",
      "story.nowLbl": "Nu in de garage", "story.nowCar": "2003 Subaru WRX", "story.nowRaised": "opgehaald van", "story.nowBuilt": "gebouwd", "story.nowGo": "Bekijk de build",
      "story.nowNext": "Als zij rijdt, komt de volgende auto binnen.",
      "story.w1": "Draag de merch", "story.w1s": "Elk shirt en elke pet betaalt mee.",
      "story.w2": "Betaal een onderdeel", "story.w2s": "Echte onderdelen, echte prijzen. Kies er één.",
      "story.w3": "Koop een stickerplek", "story.w3s": "Jouw logo rijdt mee op de auto.",
      "story.w4": "Leen of doneer gereedschap", "story.w4s": "Motorkraan, krik, gereedschap. We hebben het nodig.",
      "story.w5": "Breng je project", "story.w5s": "Een auto die gered moet worden? Vertel het ons."
    },
    pap: {
      "story.helpH": "Kon <em>bo</em> por yuda?", "story.helpP": "Skohe un manera. Tur kos ta yuda un outo di proyekto bèk riba kaminda.",
      "story.h": "Trese nan <em>bèk.</em>",
      "story.p1": "Salt Road Cinema ta filma un proyekto di outo pa biaha.<br>**Nos ta trese outo i proyekto bèk, kontra tur pronóstiko.**",
      "story.p2": "",
      "story.close": "Patrosiná pa hende ku ta stima outo.",
      "story.f1": "Un outo ta keda pegá", "story.f1s": "Motor dañá, dilanti kibrá, no tin plaka.",
      "story.f2": "E isla ta yuda", "story.f2s": "Pida, hèrmèntnan, plaka, un lugá pa sticker. Tur kos ta konta.",
      "story.f3": "E ta kore atrobe, riba kámara", "story.f3s": "Tur paso filmá. Bo nòmber den e video.",
      "story.nowLbl": "Den garashi awor", "story.nowCar": "2003 Subaru WRX", "story.nowRaised": "kolektá di", "story.nowBuilt": "trahá", "story.nowGo": "Wak e build",
      "story.nowNext": "Ora e kore, e siguiente outo ta drenta.",
      "story.w1": "Bisti e merch", "story.w1s": "Tur t-shirt i pèchi ta yuda paga.",
      "story.w2": "Paga un pida", "story.w2s": "Pida berdadero, preis berdadero. Skohe un.",
      "story.w3": "Kumpra un lugá pa sticker", "story.w3s": "Bo logo ta kore riba e outo.",
      "story.w4": "Fia òf duna hèrmèntnan", "story.w4s": "Grua di motor, krik, hèrmèntnan. Nos mester nan.",
      "story.w5": "Trese bo proyekto", "story.w5s": "Bo tin un outo ku mester salbashon? Bisa nos."
    }
  });
  const usd = n => "$" + Number(n).toLocaleString("en-US");
  const render = () => {
    const t = k => I.t(k), P = D.PARTS || window.PARTS || [];
    const pct = P.length ? Math.round(P.filter(p => p.status === "fitted").length / P.length * 100) : 0;
    const raised = C.raisedUSD || 0, goal = C.goalUSD || 1;
    now.innerHTML = `
      <div class="sn-car"><span class="sn-lbl">${t("story.nowLbl")}</span><b>${t("story.nowCar")}</b><p>${t("story.nowNext")}</p></div>
      <div class="sn-num"><b>${usd(raised)}</b><span>${t("story.nowRaised")} ${usd(goal)}</span><i class="sn-bar"><em style="width:${Math.max(1.5, raised / goal * 100).toFixed(1)}%"></em></i></div>
      <div class="sn-num"><b>${pct}%</b><span>${t("story.nowBuilt")}</span></div>
      <a class="btn btn-pan" href="subi.html">${t("story.nowGo")}</a>`;
  };
  render();
  document.addEventListener("langchange", render);
  // "Lend or donate gear" jumps to the garage, where every tool can be sponsored
  document.querySelectorAll("[data-to-garage]").forEach(a => a.addEventListener("click", e => {
    const g = document.getElementById("tune"); if (!g) return;
    e.preventDefault(); g.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
})();
