export const courses = {
  "Golf Club Parco de' Medici (IT)": {
    tees: {
      "Giallo": {
        cr: null,
        slope: null,
        par: null,
        totalDistance: null,
        holes: []
      },
      "Giallo - Percorso Blu": {
        cr: 70.7,
        slope: 135,
        par: 37,
        totalDistance: 3225,
        holes: [
          { number: 1, par: 4, hcp: 10, distance: 383 },
          { number: 2, par: 5, hcp: 18, distance: 489 },
          { number: 3, par: 3, hcp: 16, distance: 170 },
          { number: 4, par: 4, hcp: 2, distance: 367 },
          { number: 5, par: 5, hcp: 14, distance: 485 },
          { number: 6, par: 3, hcp: 6, distance: 146 },
          { number: 7, par: 4, hcp: 8, distance: 322 },
          { number: 8, par: 4, hcp: 4, distance: 358 },
          { number: 9, par: 5, hcp: 12, distance: 505 }
        ]
      },
      "Giallo - Percorso Bianco": {
        cr: 70.7,
        slope: 135,
        par: 35,
        totalDistance: 2877,
        holes: [
          { number: 1, par: 4, hcp: 3, distance: 390 },
          { number: 2, par: 3, hcp: 7, distance: 191 },
          { number: 3, par: 5, hcp: 5, distance: 520 },
          { number: 4, par: 3, hcp: 15, distance: 150 },
          { number: 5, par: 4, hcp: 13, distance: 273 },
          { number: 6, par: 4, hcp: 11, distance: 313 },
          { number: 7, par: 3, hcp: 9, distance: 172 },
          { number: 8, par: 5, hcp: 17, distance: 500 },
          { number: 9, par: 4, hcp: 1, distance: 368 }
        ]
      },
      "Giallo - Percorso Rosso": {
        cr: 70.7,
        slope: 135,
        par: 35,
        totalDistance: 2689,
        holes: [
          { number: 1, par: 4, hcp: 7, distance: 343 },
          { number: 2, par: 3, hcp: 15, distance: 126 },
          { number: 3, par: 4, hcp: 17, distance: 313 },
          { number: 4, par: 4, hcp: 1, distance: 359 },
          { number: 5, par: 3, hcp: 11, distance: 180 },
          { number: 6, par: 5, hcp: 11, distance: 454 },
          { number: 7, par: 4, hcp: 9, distance: 302 },
          { number: 8, par: 4, hcp: 5, distance: 302 },
          { number: 9, par: 4, hcp: 3, distance: 310 }
        ]
      }
    },
    combinations9: {
      "Percorso Blu": {
        layout: "Giallo - Percorso Blu",
        holes: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      "Percorso Bianco": {
        layout: "Giallo - Percorso Bianco",
        holes: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      "Percorso Rosso": {
        layout: "Giallo - Percorso Rosso",
        holes: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      }
    },
    combinations18: {
      "Blu + Bianco": [
        { layout: "Giallo - Percorso Blu", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { layout: "Giallo - Percorso Bianco", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
      ],
      "Bianco + Rosso": [
        { layout: "Giallo - Percorso Bianco", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { layout: "Giallo - Percorso Rosso", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
      ],
      "Rosso + Blu": [
        { layout: "Giallo - Percorso Rosso", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { layout: "Giallo - Percorso Blu", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
      ]
    }
  },

  "Golf Resort Kremstal (AT)": {
    tees: {
      "Giallo": {
        cr: null,
        slope: null,
        par: null,
        totalDistance: null,
        holes: []
      },
      "Giallo - A - Bergergutkurs": {
        cr: 71.3,
        slope: 127,
        par: 36,
        totalDistance: 2909,
        holes: [
          { number: 1, par: 4, hcp: 5, distance: 343 },
          { number: 2, par: 3, hcp: 15, distance: 154 },
          { number: 3, par: 5, hcp: 3, distance: 493 },
          { number: 4, par: 4, hcp: 1, distance: 404 },
          { number: 5, par: 4, hcp: 7, distance: 343 },
          { number: 6, par: 4, hcp: 17, distance: 259 },
          { number: 7, par: 5, hcp: 11, distance: 481 },
          { number: 8, par: 3, hcp: 13, distance: 180 },
          { number: 9, par: 5, hcp: 9, distance: 252 }
        ]
      },
      "Giallo - B - Panoramakurs": {
        cr: 71.3,
        slope: 127,
        par: 36,
        totalDistance: 2994,
        holes: [
          { number: 1, par: 4, hcp: 2, distance: 384 },
          { number: 2, par: 3, hcp: 12, distance: 190 },
          { number: 3, par: 5, hcp: 8, distance: 465 },
          { number: 4, par: 4, hcp: 16, distance: 304 },
          { number: 5, par: 4, hcp: 6, distance: 344 },
          { number: 6, par: 4, hcp: 10, distance: 333 },
          { number: 7, par: 4, hcp: 4, distance: 368 },
          { number: 8, par: 3, hcp: 18, distance: 133 },
          { number: 9, par: 5, hcp: 14, distance: 473 }
        ]
      },
      "Giallo - C - Cherndlgutkurs": {
        cr: 68.1,
        slope: 121,
        par: 35,
        totalDistance: 2568,
        holes: [
          { number: 1, par: 3, hcp: 11, distance: 140 },
          { number: 2, par: 4, hcp: 7, distance: 337 },
          { number: 3, par: 5, hcp: 15, distance: 410 },
          { number: 4, par: 3, hcp: 17, distance: 131 },
          { number: 5, par: 4, hcp: 9, distance: 326 },
          { number: 6, par: 4, hcp: 3, distance: 302 },
          { number: 7, par: 5, hcp: 5, distance: 435 },
          { number: 8, par: 3, hcp: 13, distance: 169 },
          { number: 9, par: 4, hcp: 1, distance: 318 }
        ]
      }
    },
    combinations9: {
      "A - Bergergutkurs": {
        layout: "Giallo - A - Bergergutkurs",
        holes: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      "B - Panoramakurs": {
        layout: "Giallo - B - Panoramakurs",
        holes: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      "C - Cherndlgutkurs": {
        layout: "Giallo - C - Cherndlgutkurs",
        holes: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      }
    },
    combinations18: {
      "A + B": [
        { layout: "Giallo - A - Bergergutkurs", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { layout: "Giallo - B - Panoramakurs", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
      ],
      "B + A": [
        { layout: "Giallo - B - Panoramakurs", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { layout: "Giallo - A - Bergergutkurs", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
      ],
      "C + C": [
        { layout: "Giallo - C - Cherndlgutkurs", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        { layout: "Giallo - C - Cherndlgutkurs", holes: [1, 2, 3, 4, 5, 6, 7, 8, 9] }
      ]
    }
  },
  
  "Golfclub Radstadt (AT)": {
    tees: {
      "Giallo": {
        cr: 70.6,
        slope: 127,
        par: 72,
        totalDistance: 5868,
        holes: [
          { number: 1, par: 4, hcp: 16, distance: 269 },
          { number: 2, par: 4, hcp: 2, distance: 385 },
          { number: 3, par: 4, hcp: 4, distance: 330 },
          { number: 4, par: 5, hcp: 14, distance: 435 },
          { number: 5, par: 4, hcp: 12, distance: 333 },
          { number: 6, par: 3, hcp: 18, distance: 139 },
          { number: 7, par: 5, hcp: 8, distance: 465 },
          { number: 8, par: 3, hcp: 10, distance: 161 },
          { number: 9, par: 5, hcp: 6, distance: 477 },
          { number: 10, par: 3, hcp: 15, distance: 164 },
          { number: 11, par: 5, hcp: 1, distance: 441 },
          { number: 12, par: 3, hcp: 17, distance: 107 },
          { number: 13, par: 4, hcp: 13, distance: 366 },
          { number: 14, par: 4, hcp: 9, distance: 302 },
          { number: 15, par: 4, hcp: 7, distance: 411 },
          { number: 16, par: 4, hcp: 5, distance: 362 },
          { number: 17, par: 5, hcp: 3, distance: 526 },
          { number: 18, par: 3, hcp: 11, distance: 195 }
        ]
      }
    },
    combinations9: {
      "Front 9": [1, 2, 3, 4, 5, 6, 7, 8, 9],
      "Back 9": [10, 11, 12, 13, 14, 15, 16, 17, 18]
    }
  }
};
