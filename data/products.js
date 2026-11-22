// Shop. price in USD. sizes optional. photo optional (placeholder art if empty).
// { id, kind: "sticker"|"tee"|"cap", name: {en,nl,pap}, price, sizes: ["S","M"...], colors: ["Black"...], photo, soldOut }
// Extra optional fields: desc {en,nl,pap}, shape: "banner" (wide placeholder art).
window.DATA = window.DATA || {};
// Prices set by Rudo 2026-11-22: tees $87, caps $29, fuzzy dice $15. Sticker prices still placeholders.
window.DATA.products = [
  {
    id: "sticker-logo", kind: "sticker", price: 4, colors: [], sizes: [], photo: "",
    name: { en: "Logo die-cut sticker", nl: "Logo die-cut sticker", pap: "Sticker di logo (die-cut)" },
    desc: { en: "Weatherproof vinyl. Survives sun, salt and a car wash.", nl: "Weerbestendig vinyl. Overleeft zon, zout en de wasstraat.", pap: "Vinil resistente. E ta aguantá solo, salu i lavadó di outo." }
  },
  {
    id: "sticker-subi", kind: "sticker", shape: "banner", price: 15, colors: [], sizes: [], photo: "",
    name: { en: "Save the Subi windshield banner", nl: "Save the Subi voorruitbanner", pap: "Banner di Save the Subi pa vidrio di dilanti" },
    desc: { en: "The strip from the film. Sits across the top of the windshield.", nl: "De strip uit de film. Komt bovenaan je voorruit.", pap: "E strip di e pelíkula. E ta bai na tòp di bo vidrio di dilanti." }
  },
  {
    id: "tee-logo-black", kind: "tee", price: 87, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Black"], photo: "media/merch-tee-hopi-gazzz.jpg",
    name: { en: "HOPI GAZZZ tee", nl: "HOPI GAZZZ shirt", pap: "T-shirt HOPI GAZZZ" },
    desc: { en: "Heavy washed black tee. Salt Road chest logo, HOPI GAZZZ tach print on the back. Built for higher revs.", nl: "Zwaar washed zwart shirt. Salt Road logo op de borst, HOPI GAZZZ toerenteller op de rug.", pap: "T-shirt pretu pisá. Logo di Salt Road riba pechu, HOPI GAZZZ tach na lomba." }
  },
  {
    id: "tee-saltroad-sand", kind: "tee", price: 87, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Sand"], photo: "",
    name: { en: "Salt Road tee, sand", nl: "Salt Road-shirt, zand", pap: "Kamisa Salt Road, santu" },
    desc: { en: "Sand colour, like the road to the salt pans.", nl: "Zandkleurig, als de weg naar de zoutpannen.", pap: "Koló di santu, manera e kaminda pa e salina." }
  },
  {
    id: "cap-logo", kind: "cap", price: 29, sizes: [], colors: ["Black"], photo: "media/merch-cap.jpg",
    name: { en: "Logo cap", nl: "Logo-pet", pap: "Kachi di logo" },
    desc: { en: "Six panel, curved brim, adjustable strap.", nl: "Zes panelen, gebogen klep, verstelbaar bandje.", pap: "Seis panel, bisera kurvá, strap ahustabel." }
  },
  {
    id: "fuzzy-dice", kind: "dice", price: 15, sizes: [], colors: ["Black"], photo: "media/merch-fuzzy-dice.jpg",
    name: { en: "Fuzzy dice", nl: "Pluche dobbelstenen", pap: "Dado peludo" },
    desc: { en: "Hang them from the mirror. Embroidered Salt Road logo.", nl: "Hang ze aan je spiegel. Geborduurd Salt Road logo.", pap: "Kolg'é na bo spil. Logo di Salt Road bordá." }
  }
];
