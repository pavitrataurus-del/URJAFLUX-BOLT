// src/components/numerology/numerologyEngine.ts

export type SystemType = "Pythagorean" | "Chaldean";

export interface NameBreakdown {
  value: number;
  reduced: number;
  letters: { char: string; val: number }[];
  vowels: { char: string; val: number }[];
  consonants: { char: string; val: number }[];
  vowelsValue: number;
  consonantsValue: number;
  vowelsReduced: number;
  consonantsReduced: number;
}

export interface NumerologyResult {
  lifePath: { value: number; isMaster: boolean; trace: string[] };
  destiny: { value: number; isMaster: boolean; trace: string[] };
  expression: { value: number; isMaster: boolean; trace: string[] };
  soulUrge: { value: number; isMaster: boolean; trace: string[] };
  personality: { value: number; isMaster: boolean; trace: string[] };
  birthdayNum: { value: number; isMaster: boolean; trace: string[] };
  maturity: { value: number; isMaster: boolean; trace: string[] };
  balance: { value: number; isMaster: boolean; trace: string[] };
  hiddenPassion: { value: number; count: number; frequencies: Record<number, number>; trace: string[] };
  subconsciousSelf: { value: number; trace: string[] };
  rationalThought: { value: number; trace: string[] };
  bridgeLP_Destiny: number;
  bridgeHearts_Personality: number;
  pinnacles: {
    p1: { value: number; startAge: number; endAge: number };
    p2: { value: number; startAge: number; endAge: number };
    p3: { value: number; startAge: number; endAge: number };
    p4: { value: number; startAge: number; endAge: number };
    trace: string[];
  };
  challenges: {
    c1: { value: number; startAge: number; endAge: number };
    c2: { value: number; startAge: number; endAge: number };
    c3: { value: number; startAge: number; endAge: number };
    c4: { value: number; startAge: number; endAge: number };
    trace: string[];
  };
  cycles: {
    cycle1: { value: number; name: string };
    cycle2: { value: number; name: string };
    cycle3: { value: number; name: string };
    trace: string[];
  };
  predictions: {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
    trace: string[];
  };
  karmicDebt: number[];
  karmicLessons: number[];
  arrows: {
    name: string;
    description: string;
    numbers: number[];
    present: boolean;
  }[];
  loShuGrid: Record<number, number>;
  traceLogs: string[];
}

// Gematria Values
export const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
};

export const CHALDEAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, u: 6, o: 7, f: 8,
  i: 1, k: 2, g: 3, h: 4, l: 5, m: 4, n: 5, p: 8,
  r: 2, s: 3, t: 4, q: 1, x: 5, y: 1, z: 7, j: 1,
  v: 6, w: 6
};

export function isMasterNumber(num: number): boolean {
  return num === 11 || num === 22 || num === 33;
}

export function reduceNumber(num: number, allowMaster = true): number {
  let current = num;
  while (current > 9) {
    if (allowMaster && isMasterNumber(current)) {
      break;
    }
    const digits = String(current).split("").map(Number);
    current = digits.reduce((sum, d) => sum + d, 0);
  }
  return current;
}

export function getLettersBreakdown(name: string, system: SystemType = "Pythagorean"): NameBreakdown {
  const map = system === "Pythagorean" ? PYTHAGOREAN_MAP : CHALDEAN_MAP;
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, "");
  
  const letters: { char: string; val: number }[] = [];
  const vowelsList = ["a", "e", "i", "o", "u"];
  
  let totalVal = 0;
  let vowelsVal = 0;
  let consonantsVal = 0;
  
  const vowels: { char: string; val: number }[] = [];
  const consonants: { char: string; val: number }[] = [];

  for (const char of cleanName) {
    const val = map[char] || 0;
    totalVal += val;
    letters.push({ char, val });
    if (vowelsList.includes(char)) {
      vowelsVal += val;
      vowels.push({ char, val });
    } else {
      consonantsVal += val;
      consonants.push({ char, val });
    }
  }

  return {
    value: totalVal,
    reduced: reduceNumber(totalVal, true),
    letters,
    vowels,
    consonants,
    vowelsValue: vowelsVal,
    consonantsValue: consonantsVal,
    vowelsReduced: reduceNumber(vowelsVal, true),
    consonantsReduced: reduceNumber(consonantsVal, true)
  };
}

export function calculateNumerology(
  dobStr?: string,
  fullName?: string,
  system: SystemType = "Pythagorean",
  referenceYear: number = new Date().getFullYear(),
  referenceMonth: number = new Date().getMonth() + 1,
  referenceDay: number = new Date().getDate()
): NumerologyResult | null {
  if (!dobStr || !fullName) return null;

  // Validate DOB format YYYY-MM-DD or DD-MM-YYYY
  const parts = dobStr.split("-");
  if (parts.length !== 3) return null;

  let year = 0;
  let month = 0;
  let day = 0;

  if (parts[0].length === 4) {
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const traceLogs: string[] = [];
  traceLogs.push(`[Universal Calculation Engine] Initializing Numerology analysis.`);
  traceLogs.push(`[Input Metadata] System: ${system}, DOB: ${dobStr} (Day: ${day}, Month: ${month}, Year: ${year}), Full Name: "${fullName}"`);

  // 1. Life Path Number
  // Standard method: Reduce Month, Day, and Year separately, then add and reduce
  const mRed = reduceNumber(month, true);
  const dRed = reduceNumber(day, true);
  const yRed = reduceNumber(year, true);
  const lpSum = mRed + dRed + yRed;
  const lpVal = reduceNumber(lpSum, true);
  const lpTrace = [
    `Formula: Reduce(Reduce(Month) + Reduce(Day) + Reduce(Year))`,
    `Month ${month} -> reduced to ${mRed}`,
    `Day ${day} -> reduced to ${dRed}`,
    `Year ${year} -> reduced to ${yRed}`,
    `Sum of components: ${mRed} + ${dRed} + ${yRed} = ${lpSum}`,
    `Final Life Path Number: ${lpVal}`
  ];
  traceLogs.push(`[Life Path] Derived: ${lpVal}`);

  // 2. Name Calculations
  const breakdown = getLettersBreakdown(fullName, system);
  
  // Expression / Destiny is the full name sum reduced
  const destVal = breakdown.reduced;
  const destTrace = [
    `Formula: Reduce(Sum(Name letter values))`,
    `Letters sum (${system}): ${breakdown.letters.map(l => `${l.char.toUpperCase()}(${l.val})`).join(" + ")} = ${breakdown.value}`,
    `Final Destiny / Expression Number: ${destVal}`
  ];
  traceLogs.push(`[Destiny / Expression] Derived: ${destVal}`);

  // Soul Urge / Heart's Desire
  const suVal = breakdown.vowelsReduced;
  const suTrace = [
    `Formula: Reduce(Sum(Name Vowels values))`,
    `Vowels sum: ${breakdown.vowels.map(l => `${l.char.toUpperCase()}(${l.val})`).join(" + ")} = ${breakdown.vowelsValue}`,
    `Final Soul Urge Number: ${suVal}`
  ];
  traceLogs.push(`[Soul Urge] Derived: ${suVal}`);

  // Personality
  const persVal = breakdown.consonantsReduced;
  const persTrace = [
    `Formula: Reduce(Sum(Name Consonants values))`,
    `Consonants sum: ${breakdown.consonants.map(l => `${l.char.toUpperCase()}(${l.val})`).join(" + ")} = ${breakdown.consonantsValue}`,
    `Final Personality Number: ${persVal}`
  ];
  traceLogs.push(`[Personality] Derived: ${persVal}`);

  // Birthday Number
  const bdayVal = reduceNumber(day, true);
  const bdayTrace = [
    `Formula: Reduce(Birth Day)`,
    `Birth Day: ${day}`,
    `Final Birthday Number: ${bdayVal}`
  ];
  traceLogs.push(`[Birthday] Derived: ${bdayVal}`);

  // Maturity Number
  const matSum = lpVal + destVal;
  const matVal = reduceNumber(matSum, true);
  const matTrace = [
    `Formula: Reduce(Life Path + Destiny)`,
    `Life Path (${lpVal}) + Destiny (${destVal}) = ${matSum}`,
    `Final Maturity Number: ${matVal}`
  ];
  traceLogs.push(`[Maturity] Derived: ${matVal}`);

  // Balance Number: reduce sum of initials of the full name
  const initials = fullName.split(/\s+/).filter(Boolean).map(part => part[0].toLowerCase());
  const initialsMap = system === "Pythagorean" ? PYTHAGOREAN_MAP : CHALDEAN_MAP;
  const initialsVal = initials.reduce((sum, init) => sum + (initialsMap[init] || 0), 0);
  const balVal = reduceNumber(initialsVal, true);
  const balTrace = [
    `Formula: Reduce(Sum(Initials values))`,
    `Initials: ${initials.map(i => i.toUpperCase()).join(", ")}`,
    `Initials sum: ${initials.map(i => `${i.toUpperCase()}(${initialsMap[i] || 0})`).join(" + ")} = ${initialsVal}`,
    `Final Balance Number: ${balVal}`
  ];
  traceLogs.push(`[Balance] Derived: ${balVal}`);

  // Hidden Passion: most frequent number among all letters in name
  const frequencies: Record<number, number> = {};
  breakdown.letters.forEach(l => {
    frequencies[l.val] = (frequencies[l.val] || 0) + 1;
  });
  let maxCount = 0;
  let hiddenPassionVal = 1;
  Object.keys(frequencies).forEach(k => {
    const num = parseInt(k, 10);
    if (frequencies[num] > maxCount) {
      maxCount = frequencies[num];
      hiddenPassionVal = num;
    }
  });
  const hpTrace = [
    `Formula: Mode of all numeric letter-vibrations in Full Name`,
    `Letter frequencies: ${Object.entries(frequencies).map(([num, count]) => `Digit ${num} matches ${count} times`).join("; ")}`,
    `Most frequent digit: ${hiddenPassionVal} (appears ${maxCount} times)`
  ];
  traceLogs.push(`[Hidden Passion] Derived: ${hiddenPassionVal}`);

  // Subconscious Self: 9 minus count of completely missing numbers (1 to 9)
  const uniqueDigits = new Set(breakdown.letters.map(l => l.val));
  const missingDigits: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (!uniqueDigits.has(d)) missingDigits.push(d);
  }
  const subSelfVal = 9 - missingDigits.length;
  const subSelfTrace = [
    `Formula: 9 - count(Missing Digits [1-9] in Name letters)`,
    `Unique digits present in name: ${Array.from(uniqueDigits).sort().join(", ")}`,
    `Missing digits: [${missingDigits.join(", ")}] (Count: ${missingDigits.length})`,
    `Subconscious Self Number: 9 - ${missingDigits.length} = ${subSelfVal}`
  ];
  traceLogs.push(`[Subconscious Self] Derived: ${subSelfVal}`);

  // Rational Thought: First name value + Birthday day
  const firstName = fullName.split(/\s+/)[0] || "";
  const firstNameBreakdown = getLettersBreakdown(firstName, system);
  const ratSum = firstNameBreakdown.value + day;
  const ratVal = reduceNumber(ratSum, true);
  const ratTrace = [
    `Formula: Reduce(Sum(First Name Letters) + Birth Day)`,
    `First Name "${firstName}" sum: ${firstNameBreakdown.value}`,
    `Birth Day: ${day}`,
    `Total sum: ${firstNameBreakdown.value} + ${day} = ${ratSum}`,
    `Final Rational Thought Number: ${ratVal}`
  ];
  traceLogs.push(`[Rational Thought] Derived: ${ratVal}`);

  // Bridge Numbers
  const bridgeLP_Destiny = Math.abs(lpVal - destVal);
  const bridgeHearts_Personality = Math.abs(suVal - persVal);

  // 3. Pinnacles (Ages dynamically calculated based on Life Path)
  // LP reduced to single digit for lifecycle timing
  const lpSingle = reduceNumber(lpVal, false);
  const endAge1 = 36 - lpSingle;
  const endAge2 = endAge1 + 9;
  const endAge3 = endAge2 + 9;

  const p1 = reduceNumber(dRed + mRed, true);
  const p2 = reduceNumber(dRed + yRed, true);
  const p3 = reduceNumber(p1 + p2, true);
  const p4 = reduceNumber(mRed + yRed, true);

  const pinnaclesTrace = [
    `Life Path Base Number for age calculations: ${lpSingle}`,
    `Pinnacle 1 (Age 0 to ${endAge1}): Reduce(Day + Month) = Reduce(${dRed} + ${mRed}) = ${p1}`,
    `Pinnacle 2 (Age ${endAge1 + 1} to ${endAge2}): Reduce(Day + Year) = Reduce(${dRed} + ${yRed}) = ${p2}`,
    `Pinnacle 3 (Age ${endAge2 + 1} to ${endAge3}): Reduce(P1 + P2) = Reduce(${p1} + ${p2}) = ${p3}`,
    `Pinnacle 4 (Age ${endAge3 + 1}+): Reduce(Month + Year) = Reduce(${mRed} + ${yRed}) = ${p4}`
  ];
  traceLogs.push(`[Pinnacles] P1:${p1}, P2:${p2}, P3:${p3}, P4:${p4}`);

  // 4. Challenges
  const c1 = Math.abs(dRed - mRed);
  const c2 = Math.abs(dRed - yRed);
  const c3 = Math.abs(c1 - c2);
  const c4 = Math.abs(mRed - yRed);

  const challengesTrace = [
    `Challenge 1 (Age 0 to ${endAge1}): |Day - Month| = |${dRed} - ${mRed}| = ${c1}`,
    `Challenge 2 (Age ${endAge1 + 1} to ${endAge2}): |Day - Year| = |${dRed} - ${yRed}| = ${c2}`,
    `Challenge 3 (Age ${endAge2 + 1} to ${endAge3}): |Challenge 1 - Challenge 2| = |${c1} - ${c2}| = ${c3}`,
    `Challenge 4 (Age ${endAge3 + 1}+): |Month - Year| = |${mRed} - ${yRed}| = ${c4}`
  ];
  traceLogs.push(`[Challenges] C1:${c1}, C2:${c2}, C3:${c3}, C4:${c4}`);

  // 5. Cycles
  const cycle1Val = mRed;
  const cycle2Val = dRed;
  const cycle3Val = yRed;
  const cyclesTrace = [
    `Cycle 1 (Youth Cycle - Month): ${cycle1Val}`,
    `Cycle 2 (Maturity Cycle - Day): ${cycle2Val}`,
    `Cycle 3 (Wisdom Cycle - Year): ${cycle3Val}`
  ];
  traceLogs.push(`[Cycles] Cy1:${cycle1Val}, Cy2:${cycle2Val}, Cy3:${cycle3Val}`);

  // 6. Predictions
  // Personal Year = Reference Year + Birth Month + Birth Day
  const refYearSum = reduceNumber(referenceYear, false);
  const pyVal = reduceNumber(refYearSum + month + day, true);

  // Personal Month = Personal Year + Reference Month
  const pmVal = reduceNumber(pyVal + referenceMonth, true);

  // Personal Day = Personal Month + Reference Day
  const pdVal = reduceNumber(pmVal + referenceDay, true);

  const predictionsTrace = [
    `Reference Year Evaluated: ${referenceYear}`,
    `Personal Year: Reduce(Reduce(Year: ${referenceYear}) + Birth Month: ${month} + Birth Day: ${day}) = ${pyVal}`,
    `Personal Month (Month: ${referenceMonth}): Reduce(Personal Year: ${pyVal} + Month: ${referenceMonth}) = ${pmVal}`,
    `Personal Day (Day: ${referenceDay}): Reduce(Personal Month: ${pmVal} + Day: ${referenceDay}) = ${pdVal}`
  ];
  traceLogs.push(`[Predictions] PY:${pyVal}, PM:${pmVal}, PD:${pdVal}`);

  // 7. Karmic Debts & Lessons
  const potentialDebts = [lpSum, breakdown.value, breakdown.vowelsValue, breakdown.consonantsValue, day];
  const karmicDebtSet = new Set<number>();
  const debtNumbers = [13, 14, 16, 19];
  potentialDebts.forEach(val => {
    if (debtNumbers.includes(val)) {
      karmicDebtSet.add(val);
    }
  });
  const karmicDebt = Array.from(karmicDebtSet);

  const karmicLessons = missingDigits;

  // 8. Lo Shu Grid (Vedic 3x3)
  // Standard digits from DOB (DD-MM-YYYY)
  const dobDigits = String(day) + String(month) + String(year);
  const loShuGrid: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) {
    loShuGrid[i] = 0;
  }
  for (const digitChar of dobDigits) {
    const digit = parseInt(digitChar, 10);
    if (digit >= 1 && digit <= 9) {
      loShuGrid[digit] += 1;
    }
  }

  // Arrows of strength & weakness
  const arrows = [
    { name: "Arrow of Determination", numbers: [1, 5, 9], present: false, description: "Unshakeable persistence, strong will power and resolve." },
    { name: "Arrow of Compassion / Spirituality", numbers: [3, 5, 7], present: false, description: "Strong intuitive awareness, empathy and connection to sacred vibrations." },
    { name: "Arrow of Intellect", numbers: [3, 6, 9], present: false, description: "Exceptional logical thinking, sharp memory, and analytical prowess." },
    { name: "Arrow of Emotional Stability", numbers: [2, 5, 8], present: false, description: "Balanced emotions, deep understanding, and high relational resonance." },
    { name: "Arrow of Practicality / Action", numbers: [1, 4, 7], present: false, description: "Grounded builder, excellent execution, converts ideas into reality." },
    { name: "Arrow of Planning", numbers: [4, 5, 6], present: false, description: "Strong strategist, detail-oriented organizer, visionary executor." },
    { name: "Arrow of Activity", numbers: [7, 8, 9], present: false, description: "High physical energy, loves to travel, quick to respond to action." },
    { name: "Arrow of Prosperity", numbers: [4, 3, 8], present: false, description: "Attracts abundance, financial success, and material achievements." }
  ];

  arrows.forEach(arr => {
    arr.present = arr.numbers.every(num => loShuGrid[num] > 0);
  });

  traceLogs.push(`[Universal Calculation Engine] Completed execution pipeline. No errors logged.`);

  return {
    lifePath: { value: lpVal, isMaster: isMasterNumber(lpVal), trace: lpTrace },
    destiny: { value: destVal, isMaster: isMasterNumber(destVal), trace: destTrace },
    expression: { value: destVal, isMaster: isMasterNumber(destVal), trace: destTrace },
    soulUrge: { value: suVal, isMaster: isMasterNumber(suVal), trace: suTrace },
    personality: { value: persVal, isMaster: isMasterNumber(persVal), trace: persTrace },
    birthdayNum: { value: bdayVal, isMaster: isMasterNumber(bdayVal), trace: bdayTrace },
    maturity: { value: matVal, isMaster: isMasterNumber(matVal), trace: matTrace },
    balance: { value: balVal, isMaster: isMasterNumber(balVal), trace: balTrace },
    hiddenPassion: { value: hiddenPassionVal, count: maxCount, frequencies, trace: hpTrace },
    subconsciousSelf: { value: subSelfVal, trace: subSelfTrace },
    rationalThought: { value: ratVal, trace: ratTrace },
    bridgeLP_Destiny,
    bridgeHearts_Personality,
    pinnacles: {
      p1: { value: p1, startAge: 0, endAge: endAge1 },
      p2: { value: p2, startAge: endAge1 + 1, endAge: endAge2 },
      p3: { value: p3, startAge: endAge2 + 1, endAge: endAge3 },
      p4: { value: p4, startAge: endAge3 + 1, endAge: 99 },
      trace: pinnaclesTrace
    },
    challenges: {
      c1: { value: c1, startAge: 0, endAge: endAge1 },
      c2: { value: c2, startAge: endAge1 + 1, endAge: endAge2 },
      c3: { value: c3, startAge: endAge2 + 1, endAge: endAge3 },
      c4: { value: c4, startAge: endAge3 + 1, endAge: 99 },
      trace: challengesTrace
    },
    cycles: {
      cycle1: { value: cycle1Val, name: "Youth Cycle (Month of Birth)" },
      cycle2: { value: cycle2Val, name: "Maturity Cycle (Day of Birth)" },
      cycle3: { value: cycle3Val, name: "Wisdom Cycle (Year of Birth)" },
      trace: cyclesTrace
    },
    predictions: {
      personalYear: pyVal,
      personalMonth: pmVal,
      personalDay: pdVal,
      trace: predictionsTrace
    },
    karmicDebt,
    karmicLessons,
    arrows,
    loShuGrid,
    traceLogs
  };
}

// Global static interpretation mapping database (knowledge references)
export const NUMEROLOGY_INTERPRETATIONS: Record<string, Record<number, { title: string; desc: string; sanskrit?: string; authority?: string }>> = {
  lifePath: {
    1: {
      title: "The Pioneer Leader (Surya Vibration)",
      desc: "Driven by autonomy, initiative, and original creativity. Destined to carve new pathways, demonstrate courageous command, and overcome self-doubt.",
      sanskrit: "Udyama Vibhava",
      authority: "Brihat Samhita, Surya Prakasha"
    },
    2: {
      title: "The Diplomatic Harmonizer (Chandra Vibration)",
      desc: "Characterized by deep empathy, intuitive listening, cooperation, and artistic detail. Highly responsive to environmental vibrations.",
      sanskrit: "Samatva Sadhana",
      authority: "Brihat Samhita, Chandra Purana"
    },
    3: {
      title: "The Creative Synthesizer (Guru Vibration)",
      desc: "Expresses abundance through speech, writing, and spiritual optimism. Destined to inspire others, uplift collective resonance, and spread joy.",
      sanskrit: "Vachaspatya Yoga",
      authority: "Brihat Samhita, Jataka Parijata"
    },
    4: {
      title: "The Master Architect (Rahu Vibration)",
      desc: "Grounded in pragmatic execution, systematic order, stamina, and stability. Translates ethereal blueprints into enduring solid structures.",
      sanskrit: "Sthapatya Karma",
      authority: "Mayamatam, Vishwakarma Prakash"
    },
    5: {
      title: "The Dynamic Explorer (Budha Vibration)",
      desc: "Thrives on versatile adaptation, sensory communication, and freedom. Highly intellectual agent of change and fast travel.",
      sanskrit: "Chara Drashta",
      authority: "Brihat Parasara Hora Sastra"
    },
    6: {
      title: "The Cosmic Guardian (Shukra Vibration)",
      desc: "Radiates protective healing, aesthetic beauty, domestic harmony, and absolute service. Holds natural affinity for vastu symmetry and community.",
      sanskrit: "Ranjana Shastra",
      authority: "Mayamatam, Ch. 4"
    },
    7: {
      title: "The Sacred Mystic (Ketu Vibration)",
      desc: "Reserved for metaphysical research, introspective analysis, and silence. Seeking the underlying spiritual truth behind material manifestations.",
      sanskrit: "Jnanatmaka Siddha",
      authority: "Brihat Parasara Hora Sastra, Ketu Grantha"
    },
    8: {
      title: "The Sovereign Executor (Shani Vibration)",
      desc: "Demands masterly command over material wealth, karmic justice, organization, and immense discipline. Harnesses long-term endurance.",
      sanskrit: "Dharma Adhikara",
      authority: "Saravali, Shani Sutra"
    },
    9: {
      title: "The Universal Humanitarian (Mangala Vibration)",
      desc: "The culmination of all numbers, holding unconditional love, theatrical passion, dramatic endings, and absolute planetary consciousness.",
      sanskrit: "Poornata Vibhuti",
      authority: "Brihat Samhita, Mangala Samhita"
    },
    11: {
      title: "Master Number: The Illuminator / Spiritual Messenger",
      desc: "Channels intense spiritual wisdom, prophetic visions, and profound sensitivity. Operates as an energetic lightning rod between realms.",
      sanskrit: "Divya Purusha",
      authority: "Brihat Samhita, Deva Vidya"
    },
    22: {
      title: "Master Number: The Master Builder",
      desc: "Possesses the unique capacity to turn the grandest spiritual ideals into physical realities. A systematic titan of massive global projects.",
      sanskrit: "Viswakarma Vibhuti",
      authority: "Mayamatam, Ch. 1"
    },
    33: {
      title: "Master Number: The Master Teacher / Cosmic Healer",
      desc: "The pinnacle of selfless devotion, pure protective nurture, and absolute energetic alignment. Heals others through sheer spiritual presence.",
      sanskrit: "Sadguru Prasada",
      authority: "Brihat Samhita, Guru Gita"
    }
  },
  destiny: {
    1: { title: "Executive Authority", desc: "Your destiny is to lead, innovate, and establish personal sovereignty." },
    2: { title: "Sympathetic Collaboration", desc: "Your destiny is to mediate, heal division, and craft beautiful connections." },
    3: { title: "Artistic Proclamation", desc: "Your destiny is to manifest joy and divine truth through high self-expression." },
    4: { title: "Enduring Foundation", desc: "Your destiny is to build sturdy structures and protect sacred orders." },
    5: { title: "Alchemical Adaptation", desc: "Your destiny is to experience absolute freedom, travel, and ignite change." },
    6: { title: "Benevolent Nurture", desc: "Your destiny is to create healing havens and teach protective wisdom." },
    7: { title: "Metaphysical Revelation", desc: "Your destiny is to decode secrets of the universe and perfect the mind." },
    8: { title: "Karmic Sovereign", desc: "Your destiny is to command material operations with high justice and balance." },
    9: { title: "Cosmic Alchemist", desc: "Your destiny is to serve the absolute whole and complete cosmic cycles." }
  },
  soulUrge: {
    1: { title: "Sovereign Independence", desc: "Your soul deeply craves to stand alone, innovate, and avoid external control." },
    2: { title: "Harmonic Communion", desc: "Your soul deeply craves intimate peace, partnerships, and unconditional resonance." },
    3: { title: "Creative Flourish", desc: "Your soul deeply craves artistic creation, playful learning, and spiritual beauty." },
    4: { title: "Secure Order", desc: "Your soul deeply craves systems, absolute truth, reliable routines, and safety." },
    5: { title: "Limitless Freedom", desc: "Your soul deeply craves adventure, spontaneous exploration, and sensory change." },
    6: { title: "Aesthetic Guardian", desc: "Your soul deeply craves to heal, protect, beautify, and hold loving duty." },
    7: { title: "Mystical Silence", desc: "Your soul deeply craves uninterrupted research, meditative quiet, and divine knowledge." },
    8: { title: "Material Achievement", desc: "Your soul deeply craves executive success, vast wealth, and powerful control." },
    9: { title: "Universal Redemption", desc: "Your soul deeply craves to heal the planet, forgive all debts, and love universally." }
  }
};

export const LUCKY_FACTORS: Record<number, { colors: string[]; days: string[]; directions: string[]; initials: string[]; stone: string }> = {
  1: { colors: ["Gold", "Ruby Red", "Yellow"], days: ["Sunday"], directions: ["East (Purva)"], initials: ["A", "I", "J", "Q", "Y"], stone: "Ruby / Manikya" },
  2: { colors: ["White", "Silver", "Cream"], days: ["Monday"], directions: ["North-West (Vayavya)"], initials: ["B", "K", "R"], stone: "Pearl / Moti" },
  3: { colors: ["Yellow", "Saffron", "Purple"], days: ["Thursday"], directions: ["North-East (Ishan)"], initials: ["C", "G", "L", "S"], stone: "Yellow Sapphire / Pukhraj" },
  4: { colors: ["Electric Blue", "Grey", "Bronze"], days: ["Saturday", "Sunday"], directions: ["South-West (Nairutya)"], initials: ["D", "M", "T"], stone: "Hessonite / Gomed" },
  5: { colors: ["Emerald Green", "Turquoise"], days: ["Wednesday"], directions: ["North (Uttara)"], initials: ["E", "H", "N", "X"], stone: "Emerald / Panna" },
  6: { colors: ["Diamond White", "Pink", "Aqua"], days: ["Friday"], directions: ["South-East (Agneya)"], initials: ["U", "V", "W"], stone: "Diamond / Heera" },
  7: { colors: ["Light Green", "Cat's Eye Grey"], days: ["Monday", "Thursday"], directions: ["Ketu Centre"], initials: ["O", "Z"], stone: "Cat's Eye / Lehsunia" },
  8: { colors: ["Dark Blue", "Charcoal", "Black"], days: ["Saturday"], directions: ["West (Pashchima)"], initials: ["F", "P"], stone: "Blue Sapphire / Neelam" },
  9: { colors: ["Coral Red", "Scarlet"], days: ["Tuesday"], directions: ["South (Dakshin)"], initials: ["M", "T", "R"], stone: "Red Coral / Moonga" }
};
