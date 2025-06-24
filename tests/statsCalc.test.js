import { expectedStrokes, filterRounds, computeScoreTrend, computeRoundStrokesGained } from '../statsCalc.js';

describe('expectedStrokes', () => {
  test('returns base value for zero or negative distance', () => {
    expect(expectedStrokes(0)).toBeCloseTo(2);
    expect(expectedStrokes(-10)).toBeCloseTo(2);
  });

  test('increases with distance', () => {
    const d50 = expectedStrokes(50); // 2 + sqrt(50/50) = 3
    const d100 = expectedStrokes(100); // 2 + sqrt(100/50) = 2 + sqrt(2)
    expect(d50).toBeCloseTo(3);
    expect(d100).toBeGreaterThan(d50);
  });
});

describe('filterRounds', () => {
  const rounds = [
    { format: 9, course: 'A', date: new Date('2023-01-01') },
    { format: 18, course: 'B', date: new Date('2023-02-01') },
    { format: 9, course: 'A', date: new Date('2023-03-01') }
  ];

  test('filters by format', () => {
    const res = filterRounds(rounds, { format: '18', course: 'all' });
    expect(res).toHaveLength(1);
    expect(res[0].format).toBe(18);
  });

  test('filters by date range and course', () => {
    const res = filterRounds(rounds, {
      format: 'all',
      course: 'A',
      start: '2023-02-01',
      end: '2023-03-15'
    });
    expect(res).toHaveLength(1);
    expect(res[0].date).toEqual(new Date('2023-03-01'));
  });
});

describe('computeScoreTrend', () => {
  const rounds = [
    { date: new Date('2023-01-01'), score: 40, par: 36 },
    { date: new Date('2023-01-08'), score: 42, par: 36 },
    { date: new Date('2023-01-15'), score: 41, par: 36 },
    { date: new Date('2023-01-22'), score: 39, par: 36 }
  ];
  test('calculates moving average of net score', () => {
    const res = computeScoreTrend(rounds, 2);
    expect(res[1].avg).toBeCloseTo(5);
    expect(res[3].avg).toBeCloseTo(4);
  });
});

describe('computeRoundStrokesGained', () => {
  const rounds = [
    { date: new Date('2023-02-01'), holes:[{ distance:200, score:3 }] }
  ];
  test('returns strokes gained vs benchmark', () => {
    const res = computeRoundStrokesGained(rounds);
    expect(res[0].sg).toBeCloseTo(1);
  });
});
