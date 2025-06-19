export const courses = {
  export const courses = {
  "Golf Club Parco de' Medici": {
    tees: {
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
        totalDistance: 3378,
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
        totalDistance: 3060,
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
      "Percorso Blu": [1, 2, 3, 4, 5, 6, 7, 8, 9],
      "Percorso Bianco": [1, 2, 3, 4, 5, 6, 7, 8, 9],
      "Percorso Rosso": [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
    combinations18: {
  "Blu + Bianco": [
    { layout: "Giallo - Percorso Blu", holes: [1,2,3,4,5,6,7,8,9] },
    { layout: "Giallo - Percorso Bianco", holes: [1,2,3,4,5,6,7,8,9] }
  ],
  "Bianco + Rosso": [
    { layout: "Giallo - Percorso Bianco", holes: [1,2,3,4,5,6,7,8,9] },
    { layout: "Giallo - Percorso Rosso", holes: [1,2,3,4,5,6,7,8,9] }
  ],
  "Rosso + Blu": [
    { layout: "Giallo - Percorso Rosso", holes: [1,2,3,4,5,6,7,8,9] },
    { layout: "Giallo - Percorso Blu", holes: [1,2,3,4,5,6,7,8,9] }
  ]
}
  }
  "Golfclub Radstadt": {
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
    }
  }
};
