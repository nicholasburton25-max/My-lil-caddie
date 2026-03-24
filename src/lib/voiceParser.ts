import type { Club, LieType, WindSpeed, WindDirection, ElevationType, ShotShape, ResultQuality } from '../types/shot';

export interface ParsedShotData {
  club?: Club;
  distance?: number;
  lie?: LieType;
  windSpeed?: WindSpeed;
  windDirection?: WindDirection;
  elevation?: ElevationType;
  shotShape?: ShotShape;
  resultQuality?: ResultQuality;
  holeNumber?: number;
  scoreOnHole?: number;
  putts?: number;
  courseName?: string;
}

// Word-to-number mapping for spoken numbers
const WORD_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000,
};

function parseSpokenNumber(text: string): number | null {
  // Try direct numeric parse
  const direct = parseInt(text);
  if (!isNaN(direct)) return direct;

  // Try word-to-number
  const lower = text.toLowerCase().trim();
  if (WORD_NUMBERS[lower] !== undefined) return WORD_NUMBERS[lower];

  // Handle compound numbers like "one hundred fifty" or "two hundred"
  const words = lower.split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    const val = WORD_NUMBERS[word];
    if (val === undefined) continue;
    if (val === 100) {
      current = (current || 1) * 100;
    } else if (val === 1000) {
      current = (current || 1) * 1000;
      total += current;
      current = 0;
    } else {
      current += val;
    }
  }
  total += current;

  return total > 0 ? total : null;
}

// Club aliases — what people might say
const CLUB_PATTERNS: [RegExp, Club][] = [
  // Driver
  [/\b(?:driver|big dog|big stick|one wood|1 wood)\b/i, 'Driver'],
  // Woods
  [/\b(?:3|three)\s*(?:wood|w)\b/i, '3W'],
  [/\b(?:5|five)\s*(?:wood|w)\b/i, '5W'],
  [/\b(?:7|seven)\s*(?:wood|w)\b/i, '7W'],
  // Hybrids
  [/\b(?:3|three)\s*(?:hybrid|h)\b/i, '3H'],
  [/\b(?:4|four)\s*(?:hybrid|h)\b/i, '4H'],
  [/\b(?:5|five)\s*(?:hybrid|h)\b/i, '5H'],
  [/\b(?:6|six)\s*(?:hybrid|h)\b/i, '6H'],
  // Irons
  [/\b(?:2|two)\s*(?:iron|i)\b/i, '2i'],
  [/\b(?:3|three)\s*(?:iron|i)\b/i, '3i'],
  [/\b(?:4|four)\s*(?:iron|i)\b/i, '4i'],
  [/\b(?:5|five)\s*(?:iron|i)\b/i, '5i'],
  [/\b(?:6|six)\s*(?:iron|i)\b/i, '6i'],
  [/\b(?:7|seven)\s*(?:iron|i)\b/i, '7i'],
  [/\b(?:8|eight)\s*(?:iron|i)\b/i, '8i'],
  [/\b(?:9|nine)\s*(?:iron|i)\b/i, '9i'],
  // Wedges
  [/\b(?:pitching\s*wedge|pw|p\.?w\.?|pitching)\b/i, 'PW'],
  [/\b(?:gap\s*wedge|gw|g\.?w\.?|approach\s*wedge|aw)\b/i, 'GW'],
  [/\b(?:sand\s*wedge|sw|s\.?w\.?)\b/i, 'SW'],
  [/\b(?:lob\s*wedge|lw|l\.?w\.?|60\s*degree|58\s*degree)\b/i, 'LW'],
  // Putter
  [/\b(?:putter|putt|flat\s*stick)\b/i, 'Putter'],
];

const LIE_PATTERNS: [RegExp, LieType][] = [
  [/\b(?:tee|tee\s*box|teeing)\b/i, 'tee'],
  [/\b(?:fairway|short\s*grass)\b/i, 'fairway'],
  [/\b(?:rough|thick|tall\s*grass|deep\s*rough|first\s*cut)\b/i, 'rough'],
  [/\b(?:sand|bunker|trap|beach)\b/i, 'sand'],
  [/\b(?:fringe|collar|apron)\b/i, 'fringe'],
  [/\b(?:green|on\s*the\s*green|putting\s*surface)\b/i, 'green'],
];

const WIND_SPEED_PATTERNS: [RegExp, WindSpeed][] = [
  [/\b(?:no\s*wind|calm|still)\b/i, 'calm'],
  [/\b(?:light\s*wind|light\s*breeze|slight\s*wind|little\s*wind)\b/i, 'light'],
  [/\b(?:moderate\s*wind|moderate|medium\s*wind|some\s*wind)\b/i, 'moderate'],
  [/\b(?:strong\s*wind|strong|windy|heavy\s*wind|gusty|gusting)\b/i, 'strong'],
];

const WIND_DIR_PATTERNS: [RegExp, WindDirection][] = [
  [/\bwind\s*(?:from\s*(?:the\s*)?)?northeast\b/i, 'NE'],
  [/\bwind\s*(?:from\s*(?:the\s*)?)?northwest\b/i, 'NW'],
  [/\bwind\s*(?:from\s*(?:the\s*)?)?southeast\b/i, 'SE'],
  [/\bwind\s*(?:from\s*(?:the\s*)?)?southwest\b/i, 'SW'],
  [/\bwind\s*(?:from\s*(?:the\s*)?)?north\b/i, 'N'],
  [/\bwind\s*(?:from\s*(?:the\s*)?)?south\b/i, 'S'],
  [/\bwind\s*(?:from\s*(?:the\s*)?)?east\b/i, 'E'],
  [/\bwind\s*(?:from\s*(?:the\s*)?)?west\b/i, 'W'],
];

const ELEVATION_PATTERNS: [RegExp, ElevationType][] = [
  [/\b(?:uphill|up\s*hill|elevated|above)\b/i, 'uphill'],
  [/\b(?:downhill|down\s*hill|below|downward)\b/i, 'downhill'],
  [/\b(?:flat|level|even)\b/i, 'flat'],
];

const SHAPE_PATTERNS: [RegExp, ShotShape][] = [
  [/\b(?:straight|right\s*at\s*it|dead\s*straight|pin\s*straight)\b/i, 'straight'],
  [/\b(?:draw|drew\s*it|slight\s*draw|baby\s*draw)\b/i, 'draw'],
  [/\b(?:fade|faded|slight\s*fade|baby\s*fade|cut)\b/i, 'fade'],
  [/\b(?:hook|hooked|big\s*hook|duck\s*hook|snap\s*hook)\b/i, 'hook'],
  [/\b(?:slice|sliced|big\s*slice|banana)\b/i, 'slice'],
  [/\b(?:push|pushed)\b/i, 'push'],
  [/\b(?:pull|pulled)\b/i, 'pull'],
];

const QUALITY_PATTERNS: [RegExp, ResultQuality][] = [
  [/\b(?:great|amazing|perfect|pure|striped|flushed|beautiful|incredible|awesome|nailed\s*it|crushed\s*it|money)\b/i, 'great'],
  [/\b(?:good|nice|solid|decent|fine|not\s*bad|pretty\s*good)\b/i, 'good'],
  [/\b(?:ok(?:ay)?|alright|meh|mediocre|average|so\s*so)\b/i, 'ok'],
  [/\b(?:poor|bad|terrible|awful|horrible|ugly|chunked|topped|shanked|duffed|fat|thin|whiffed|skulled)\b/i, 'poor'],
];

function matchFirst<T>(text: string, patterns: [RegExp, T][]): T | undefined {
  for (const [regex, value] of patterns) {
    if (regex.test(text)) return value;
  }
  return undefined;
}

export function parseVoiceInput(transcript: string): ParsedShotData {
  const text = transcript.toLowerCase();
  const result: ParsedShotData = {};

  // Parse club
  result.club = matchFirst(text, CLUB_PATTERNS);

  // Parse distance — look for patterns like "150 yards", "one fifty", "200"
  const distMatch = text.match(/(\d+)\s*(?:yard|yd|yds|yards)/i);
  if (distMatch) {
    result.distance = parseInt(distMatch[1]);
  } else {
    // Try "X yards" with word numbers
    const wordDistMatch = text.match(/((?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand)\s*(?:hundred|thousand|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten)?(?:\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety))?)\s*(?:yard|yd|yds|yards)/i);
    if (wordDistMatch) {
      const num = parseSpokenNumber(wordDistMatch[1]);
      if (num) result.distance = num;
    }
  }

  // Parse lie
  result.lie = matchFirst(text, LIE_PATTERNS);

  // Parse wind
  result.windSpeed = matchFirst(text, WIND_SPEED_PATTERNS);
  result.windDirection = matchFirst(text, WIND_DIR_PATTERNS);

  // Parse elevation
  result.elevation = matchFirst(text, ELEVATION_PATTERNS);

  // Parse shot shape
  result.shotShape = matchFirst(text, SHAPE_PATTERNS);

  // Parse quality
  result.resultQuality = matchFirst(text, QUALITY_PATTERNS);

  // Parse hole number - "hole 7", "hole seven", "7th hole"
  const holeMatch = text.match(/hole\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen)/i)
    || text.match(/(\d+)(?:st|nd|rd|th)\s+hole/i);
  if (holeMatch) {
    const num = parseSpokenNumber(holeMatch[1]);
    if (num && num >= 1 && num <= 18) result.holeNumber = num;
  }

  // Parse score - "scored a 4", "made a 5", "par", "birdie", "bogey", "double bogey", "eagle"
  if (/\beagle\b/i.test(text)) result.scoreOnHole = 2; // approximate
  if (/\bbirdie\b/i.test(text)) result.scoreOnHole = 3; // approximate
  if (/\bpar\b/i.test(text)) result.scoreOnHole = 4; // approximate
  if (/\bbogey\b/i.test(text) && !/double/i.test(text)) result.scoreOnHole = 5;
  if (/\bdouble\s*bogey\b/i.test(text)) result.scoreOnHole = 6;
  if (/\btriple\s*bogey\b/i.test(text)) result.scoreOnHole = 7;
  const scoreMatch = text.match(/(?:scored?\s*(?:a\s*)?|made\s*(?:a\s*)?)(\d+)/i);
  if (scoreMatch) result.scoreOnHole = parseInt(scoreMatch[1]);

  // Parse putts - "2 putts", "two putts", "one putt"
  const puttMatch = text.match(/(\d+|one|two|three|four|five|zero|no)\s*putt/i);
  if (puttMatch) {
    if (puttMatch[1] === 'no') {
      result.putts = 0;
    } else {
      const num = parseSpokenNumber(puttMatch[1]);
      if (num !== null) result.putts = num;
    }
  }

  return result;
}

// Generate a human-readable summary of what was parsed
export function summarizeParsed(data: ParsedShotData): string[] {
  const items: string[] = [];
  if (data.club) items.push(`Club: ${data.club}`);
  if (data.distance) items.push(`Distance: ${data.distance} yds`);
  if (data.lie) items.push(`Lie: ${data.lie}`);
  if (data.windSpeed) items.push(`Wind: ${data.windSpeed}`);
  if (data.windDirection) items.push(`Wind dir: ${data.windDirection}`);
  if (data.elevation) items.push(`Elevation: ${data.elevation}`);
  if (data.shotShape) items.push(`Shape: ${data.shotShape}`);
  if (data.resultQuality) items.push(`Quality: ${data.resultQuality}`);
  if (data.holeNumber) items.push(`Hole: ${data.holeNumber}`);
  if (data.scoreOnHole) items.push(`Score: ${data.scoreOnHole}`);
  if (data.putts !== undefined) items.push(`Putts: ${data.putts}`);
  return items;
}

// Step-specific parsers for guided voice flow
export function parseCourseName(transcript: string): string | null {
  const text = transcript.trim();
  return text.length > 0 ? text : null;
}

export function parseHoleNumber(transcript: string): number | null {
  const text = transcript.toLowerCase();
  // "hole 7", "7", "seven", "number 7"
  const match = text.match(/(?:hole\s+|number\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen)/i);
  if (match) {
    const num = parseSpokenNumber(match[1]);
    if (num && num >= 1 && num <= 18) return num;
  }
  return null;
}

export function parseClub(transcript: string): Club | null {
  return matchFirst(transcript.toLowerCase(), CLUB_PATTERNS) ?? null;
}

export function parseShotDetails(transcript: string): Pick<ParsedShotData, 'distance' | 'lie' | 'shotShape'> {
  const full = parseVoiceInput(transcript);
  const result: Pick<ParsedShotData, 'distance' | 'lie' | 'shotShape'> = {};
  if (full.distance) result.distance = full.distance;
  if (full.lie) result.lie = full.lie;
  if (full.shotShape) result.shotShape = full.shotShape;
  // Also try parsing a bare number as distance
  if (!result.distance) {
    const num = parseSpokenNumber(transcript.trim());
    if (num && num >= 1 && num <= 400) result.distance = num;
  }
  return result;
}

export function parseWind(transcript: string): Pick<ParsedShotData, 'windSpeed' | 'windDirection'> {
  const text = transcript.toLowerCase();
  const result: Pick<ParsedShotData, 'windSpeed' | 'windDirection'> = {};
  result.windSpeed = matchFirst(text, WIND_SPEED_PATTERNS);
  result.windDirection = matchFirst(text, WIND_DIR_PATTERNS);
  // Also match standalone direction words without "wind" prefix
  if (!result.windDirection) {
    const dirOnly: [RegExp, WindDirection][] = [
      [/\bnortheast\b/i, 'NE'], [/\bnorthwest\b/i, 'NW'],
      [/\bsoutheast\b/i, 'SE'], [/\bsouthwest\b/i, 'SW'],
      [/\bnorth\b/i, 'N'], [/\bsouth\b/i, 'S'],
      [/\beast\b/i, 'E'], [/\bwest\b/i, 'W'],
    ];
    result.windDirection = matchFirst(text, dirOnly);
  }
  return result;
}

export function parseElevation(transcript: string): ElevationType | null {
  return matchFirst(transcript.toLowerCase(), ELEVATION_PATTERNS) ?? null;
}

export function parseResult(transcript: string): Pick<ParsedShotData, 'resultQuality' | 'scoreOnHole' | 'putts'> {
  const full = parseVoiceInput(transcript);
  const result: Pick<ParsedShotData, 'resultQuality' | 'scoreOnHole' | 'putts'> = {};
  if (full.resultQuality) result.resultQuality = full.resultQuality;
  if (full.scoreOnHole) result.scoreOnHole = full.scoreOnHole;
  if (full.putts !== undefined) result.putts = full.putts;
  return result;
}
