import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts';

// ============================================================
// CONSTANTS & CONFIG
// ============================================================

const GAMMA_API = 'https://gamma-api.polymarket.com';
const ENSEMBLE_API = 'https://ensemble-api.open-meteo.com/v1/ensemble';
const STORAGE_KEY = 'polymarket_weather_bot_v2';

const CITIES = {
  'new york': { lat: 40.7128, lon: -74.006, unit: 'fahrenheit', station: 'KLGA', tz: 'America/New_York' },
  'nyc': { lat: 40.7128, lon: -74.006, unit: 'fahrenheit', station: 'KLGA', tz: 'America/New_York' },
  'chicago': { lat: 41.8781, lon: -87.6298, unit: 'fahrenheit', station: 'KORD', tz: 'America/Chicago' },
  'miami': { lat: 25.7617, lon: -80.1918, unit: 'fahrenheit', station: 'KMIA', tz: 'America/New_York' },
  'dallas': { lat: 32.7767, lon: -96.797, unit: 'fahrenheit', station: 'KDFW', tz: 'America/Chicago' },
  'los angeles': { lat: 34.0522, lon: -118.2437, unit: 'fahrenheit', station: 'KLAX', tz: 'America/Los_Angeles' },
  'atlanta': { lat: 33.749, lon: -84.388, unit: 'fahrenheit', station: 'KATL', tz: 'America/New_York' },
  'seattle': { lat: 47.6062, lon: -122.3321, unit: 'fahrenheit', station: 'KSEA', tz: 'America/Los_Angeles' },
  'denver': { lat: 39.7392, lon: -104.9903, unit: 'fahrenheit', station: 'KDEN', tz: 'America/Denver' },
  'london': { lat: 51.5074, lon: -0.1278, unit: 'celsius', station: 'EGLC', tz: 'Europe/London' },
  'paris': { lat: 48.8566, lon: 2.3522, unit: 'celsius', station: 'LFPG', tz: 'Europe/Paris' },
  'tokyo': { lat: 35.6762, lon: 139.6503, unit: 'celsius', station: 'RJTT', tz: 'Asia/Tokyo' },
  'seoul': { lat: 37.5665, lon: 126.978, unit: 'celsius', station: 'RKSS', tz: 'Asia/Seoul' },
  'buenos aires': { lat: -34.6037, lon: -58.3816, unit: 'celsius', station: 'SABE', tz: 'America/Argentina/Buenos_Aires' },
  'ankara': { lat: 39.9334, lon: 32.8597, unit: 'celsius', station: 'LTAC', tz: 'Europe/Istanbul' },
  'sydney': { lat: -33.8688, lon: 151.2093, unit: 'celsius', station: 'YSSY', tz: 'Australia/Sydney' },
  'mumbai': { lat: 19.076, lon: 72.8777, unit: 'celsius', station: 'VABB', tz: 'Asia/Kolkata' },
  'cairo': { lat: 30.0444, lon: 31.2357, unit: 'celsius', station: 'HECA', tz: 'Africa/Cairo' },
  'mexico city': { lat: 19.4326, lon: -99.1332, unit: 'celsius', station: 'MMMX', tz: 'America/Mexico_City' },
  'toronto': { lat: 43.6532, lon: -79.3832, unit: 'celsius', station: 'CYYZ', tz: 'America/Toronto' },
  'berlin': { lat: 52.52, lon: 13.405, unit: 'celsius', station: 'EDDB', tz: 'Europe/Berlin' },
  'moscow': { lat: 55.7558, lon: 37.6173, unit: 'celsius', station: 'UUEE', tz: 'Europe/Moscow' },
  'dubai': { lat: 25.2048, lon: 55.2708, unit: 'celsius', station: 'OMDB', tz: 'Asia/Dubai' },
  'singapore': { lat: 1.3521, lon: 103.8198, unit: 'celsius', station: 'WSSS', tz: 'Asia/Singapore' },
  'bangkok': { lat: 13.7563, lon: 100.5018, unit: 'celsius', station: 'VTBS', tz: 'Asia/Bangkok' },
  'rio de janeiro': { lat: -22.9068, lon: -43.1729, unit: 'celsius', station: 'SBGL', tz: 'America/Sao_Paulo' },
  'rio': { lat: -22.9068, lon: -43.1729, unit: 'celsius', station: 'SBGL', tz: 'America/Sao_Paulo' },
  'istanbul': { lat: 41.0082, lon: 28.9784, unit: 'celsius', station: 'LTFM', tz: 'Europe/Istanbul' },
  'beijing': { lat: 39.9042, lon: 116.4074, unit: 'celsius', station: 'ZBAA', tz: 'Asia/Shanghai' },
  'lagos': { lat: 6.5244, lon: 3.3792, unit: 'celsius', station: 'DNMM', tz: 'Africa/Lagos' },
  'san francisco': { lat: 37.7749, lon: -122.4194, unit: 'fahrenheit', station: 'KSFO', tz: 'America/Los_Angeles' },
  'washington': { lat: 38.9072, lon: -77.0369, unit: 'fahrenheit', station: 'KDCA', tz: 'America/New_York' },
  'boston': { lat: 42.3601, lon: -71.0589, unit: 'fahrenheit', station: 'KBOS', tz: 'America/New_York' },
  'houston': { lat: 29.7604, lon: -95.3698, unit: 'fahrenheit', station: 'KIAH', tz: 'America/Chicago' },
  'phoenix': { lat: 33.4484, lon: -112.074, unit: 'fahrenheit', station: 'KPHX', tz: 'America/Phoenix' },
  'philadelphia': { lat: 39.9526, lon: -75.1652, unit: 'fahrenheit', station: 'KPHL', tz: 'America/New_York' },
  'nairobi': { lat: -1.2921, lon: 36.8219, unit: 'celsius', station: 'HKJK', tz: 'Africa/Nairobi' },
  'lima': { lat: -12.0464, lon: -77.0428, unit: 'celsius', station: 'SPJC', tz: 'America/Lima' },
  'taipei': { lat: 25.033, lon: 121.5654, unit: 'celsius', station: 'RCTP', tz: 'Asia/Taipei' },
  'hong kong': { lat: 22.3193, lon: 114.1694, unit: 'celsius', station: 'VHHH', tz: 'Asia/Hong_Kong' },
  'kuala lumpur': { lat: 3.139, lon: 101.6869, unit: 'celsius', station: 'WMKK', tz: 'Asia/Kuala_Lumpur' },
  'jakarta': { lat: -6.2088, lon: 106.8456, unit: 'celsius', station: 'WIII', tz: 'Asia/Jakarta' },
};

const DEFAULT_SETTINGS = {
  bankroll: 100,
  minEdge: 5,
  spreadInflation: 1.3,
  maxPositions: 5,
  maxPositionPct: 10,
  autoTrade: false,
  scanInterval: 300,
  takeProfitCents: 85,
  stopLossPct: 50,
  modelAgreementThreshold: 3,
  maxEntryPrice: 25,
  kellyFraction: 0.25,
};

// ============================================================
// MATH UTILITIES
// ============================================================

function erf(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

function normalCDF(x, mean, std) {
  if (std <= 0) return x >= mean ? 1 : 0;
  return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
}

function kellySize(modelProb, marketPrice, bankroll, fraction = 0.25) {
  if (modelProb <= marketPrice || marketPrice <= 0 || marketPrice >= 1) return 0;
  const edge = modelProb - marketPrice;
  const odds = (1 - marketPrice) / marketPrice;
  const kelly = (edge * odds - (1 - modelProb)) / odds;
  const clampedKelly = Math.max(0, Math.min(kelly, 0.25));
  return Math.floor(bankroll * clampedKelly * fraction * 100) / 100;
}

// ============================================================
// MARKET PARSING
// ============================================================

function extractCityFromTitle(title) {
  const lower = title.toLowerCase();
  // Try longest city names first to avoid partial matches
  const sortedCities = Object.keys(CITIES).sort((a, b) => b.length - a.length);
  for (const city of sortedCities) {
    if (lower.includes(city)) return city;
  }
  // Try to extract from pattern "temperature in X on"
  const match = lower.match(/(?:temperature|weather)\s+in\s+(.+?)\s+on\s/);
  if (match) {
    const extracted = match[1].trim();
    for (const city of sortedCities) {
      if (extracted.includes(city)) return city;
    }
    return extracted;
  }
  return null;
}

function extractDateFromTitle(title) {
  const lower = title.toLowerCase();
  // Pattern: "on February 10, 2026" or "on February 10" or "on Feb 10, 2026"
  const months = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
    jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

  const dateMatch = lower.match(/on\s+(\w+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/);
  if (dateMatch) {
    const monthStr = dateMatch[1];
    const day = dateMatch[2].padStart(2, '0');
    const monthNum = months[monthStr];
    if (!monthNum) return null;
    const year = dateMatch[3] || new Date().getFullYear().toString();
    return `${year}-${monthNum}-${day}`;
  }

  // Pattern: "2026-02-10" ISO format
  const isoMatch = title.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  return null;
}

function parseBucketOutcome(text) {
  if (!text) return null;
  const clean = text.trim();

  // Detect unit
  const isCelsius = clean.includes('°C') || clean.includes('°c');
  const isFahrenheit = clean.includes('°F') || clean.includes('°f');
  const unit = isCelsius ? 'C' : (isFahrenheit ? 'F' : null);

  // Remove unit symbols for parsing
  const numeric = clean.replace(/°[CF]/gi, '').trim();

  // "32 or lower" / "32 or less"
  let match = numeric.match(/^(-?\d+(?:\.\d+)?)\s+or\s+(?:lower|less|below)/i);
  if (match) {
    return { low: -Infinity, high: parseFloat(match[1]), unit, label: clean, type: 'lte' };
  }

  // "50 or higher" / "50 or more" / "50 or above" / "50+"
  match = numeric.match(/^(-?\d+(?:\.\d+)?)\s+or\s+(?:higher|more|above)/i);
  if (!match) match = numeric.match(/^(-?\d+(?:\.\d+)?)\+$/);
  if (match) {
    return { low: parseFloat(match[1]), high: Infinity, unit, label: clean, type: 'gte' };
  }

  // "33-34" or "33 - 34" or "33 to 34"
  match = numeric.match(/^(-?\d+(?:\.\d+)?)\s*[-–—to]+\s*(-?\d+(?:\.\d+)?)/i);
  if (match) {
    return { low: parseFloat(match[1]), high: parseFloat(match[2]), unit, label: clean, type: 'range' };
  }

  // Single number "33" (exact)
  match = numeric.match(/^(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const val = parseFloat(match[1]);
    return { low: val, high: val, unit, label: clean, type: 'exact' };
  }

  return null;
}

function bucketToCDFBounds(bucket) {
  if (!bucket) return { lower: -Infinity, upper: Infinity };
  switch (bucket.type) {
    case 'lte': return { lower: -Infinity, upper: bucket.high + 0.5 };
    case 'gte': return { lower: bucket.low - 0.5, upper: Infinity };
    case 'range': return { lower: bucket.low - 0.5, upper: bucket.high + 0.5 };
    case 'exact': return { lower: bucket.low - 0.5, upper: bucket.low + 0.5 };
    default: return { lower: -Infinity, upper: Infinity };
  }
}

// ============================================================
// API FUNCTIONS
// ============================================================

async function fetchWithRetry(url, retries = 2, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) {
        if (i < retries) { await new Promise(r => setTimeout(r, delay)); continue; }
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }
      return await resp.json();
    } catch (e) {
      if (i < retries) { await new Promise(r => setTimeout(r, delay)); continue; }
      throw e;
    }
  }
}

async function fetchWeatherEvents() {
  const allEvents = new Map();
  const errors = [];

  // Build search URLs — try BOTH proxy (Vite dev) and direct (production/CORS)
  const bases = ['/gamma', GAMMA_API];

  for (const base of bases) {
    if (allEvents.size >= 3) break; // already found enough

    // Strategy 1: Tag & text-based searches
    const searchURLs = [
      `${base}/events?limit=100&active=true&closed=false&tag=temperature`,
      `${base}/events?limit=100&active=true&closed=false&tag=weather`,
      `${base}/events?limit=100&active=true&closed=false&slug=temperature`,
      `${base}/events?limit=100&active=true&closed=false&_q=temperature`,
    ];

    for (const url of searchURLs) {
      try {
        const data = await fetchWithRetry(url, 1, 800);
        const events = normalizeEventResponse(data);
        events.forEach(e => { if (isWeatherEvent(e)) allEvents.set(e.id, e); });
      } catch (e) {
        errors.push(`${url.substring(0, 80)}: ${e.message}`);
      }
    }

    // Strategy 2: Broad pagination through all active events + client-side filter
    if (allEvents.size < 3) {
      for (let offset = 0; offset <= 400; offset += 100) {
        try {
          const url = `${base}/events?limit=100&offset=${offset}&active=true&closed=false&order=volume24hr&ascending=false`;
          const data = await fetchWithRetry(url, 1, 800);
          const events = normalizeEventResponse(data);
          events.forEach(e => { if (isWeatherEvent(e)) allEvents.set(e.id, e); });
          if (events.length < 100) break;
        } catch (e) {
          errors.push(`Broad search offset=${offset}: ${e.message}`);
          break; // if one fails, likely all will
        }
      }
    }
  }

  // Strategy 3: Fetch individual markets endpoint as last resort
  if (allEvents.size === 0) {
    for (const base of bases) {
      try {
        const data = await fetchWithRetry(`${base}/markets?limit=200&active=true&closed=false`, 1, 800);
        const markets = normalizeEventResponse(data);
        // Group markets into pseudo-events by their condition/event reference
        const grouped = {};
        markets.forEach(m => {
          if (!isWeatherMarket(m)) return;
          const eventSlug = m.eventSlug || m.event_slug || m.groupSlug || 'unknown';
          if (!grouped[eventSlug]) {
            grouped[eventSlug] = {
              id: eventSlug,
              title: m.eventTitle || m.question || '',
              slug: eventSlug,
              active: true,
              closed: false,
              markets: [],
            };
          }
          grouped[eventSlug].markets.push(m);
        });
        Object.values(grouped).forEach(e => allEvents.set(e.id, e));
        if (allEvents.size > 0) break;
      } catch (e) {
        errors.push(`Markets endpoint: ${e.message}`);
      }
    }
  }

  // Ensure all events have their markets populated
  const result = [];
  for (const event of allEvents.values()) {
    if (!event.markets || event.markets.length === 0) {
      // Try to fetch markets for this event
      for (const base of bases) {
        try {
          const data = await fetchWithRetry(`${base}/events/${event.id}`, 1, 800);
          if (data && data.markets) {
            event.markets = data.markets;
            break;
          }
        } catch {}
      }
    }
    result.push(event);
  }

  console.log(`[Market Discovery] Found ${result.length} weather events. Errors: ${errors.length}`, errors.slice(0, 5));
  return result;
}

function isWeatherMarket(market) {
  const text = `${market.question || ''} ${market.groupItemTitle || ''} ${market.eventTitle || ''}`.toLowerCase();
  return text.includes('temperature') || text.includes('°f') || text.includes('°c');
}

function normalizeEventResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.events)) return data.events;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

function isWeatherEvent(event) {
  const text = `${event.title || ''} ${event.slug || ''} ${event.description || ''}`.toLowerCase();
  return (
    text.includes('temperature') ||
    (text.includes('weather') && (text.includes('°f') || text.includes('°c') || text.includes('degree'))) ||
    text.includes('highest temp') ||
    text.includes('lowest temp')
  );
}

function parseEventToMarket(event) {
  const title = event.title || '';
  const city = extractCityFromTitle(title);
  const targetDate = extractDateFromTitle(title);
  const cityInfo = city ? CITIES[city] : null;

  const markets = event.markets || [];
  const buckets = markets.map(m => {
    const bucketText = m.groupItemTitle || m.question || '';
    const parsed = parseBucketOutcome(bucketText);
    let yesPrice = 0;
    try {
      const prices = typeof m.outcomePrices === 'string' ? JSON.parse(m.outcomePrices) : m.outcomePrices;
      yesPrice = parseFloat(prices?.[0] || 0);
    } catch { yesPrice = 0; }

    let tokenId = '';
    try {
      const tokens = typeof m.clobTokenIds === 'string' ? JSON.parse(m.clobTokenIds) : m.clobTokenIds;
      tokenId = tokens?.[0] || '';
    } catch { tokenId = ''; }

    return {
      id: m.id,
      label: bucketText,
      parsed,
      marketPrice: yesPrice,
      tokenId,
      active: m.active !== false,
      closed: m.closed === true,
      acceptingOrders: m.acceptingOrders !== false,
    };
  }).filter(b => b.parsed !== null);

  // Sort buckets by temperature
  buckets.sort((a, b) => {
    const aVal = a.parsed.low === -Infinity ? a.parsed.high : a.parsed.low;
    const bVal = b.parsed.low === -Infinity ? b.parsed.high : b.parsed.low;
    return aVal - bVal;
  });

  // Detect unit from buckets
  const detectedUnit = buckets.find(b => b.parsed.unit)?.parsed.unit;
  const tempUnit = detectedUnit === 'C' ? 'celsius' : (detectedUnit === 'F' ? 'fahrenheit' : (cityInfo?.unit || 'fahrenheit'));

  // Detect if market is resolved
  const hasSettledBucket = buckets.some(b => b.marketPrice >= 0.95);
  const today = new Date().toISOString().split('T')[0];
  const isPastDate = targetDate && targetDate < today;
  const allClosed = markets.length > 0 && markets.every(m => m.closed === true);
  const isResolved = hasSettledBucket || isPastDate || allClosed || (event.closed === true);

  return {
    eventId: event.id,
    title,
    slug: event.slug,
    city,
    cityInfo,
    targetDate,
    tempUnit,
    buckets,
    isResolved,
    hasSettledBucket,
    isPastDate,
    active: event.active !== false,
    volume: parseFloat(event.volume || 0),
  };
}

async function fetchEnsembleData(lat, lon, targetDate, tempUnit = 'fahrenheit') {
  const today = new Date();
  const target = new Date(targetDate + 'T12:00:00');
  const daysOut = Math.max(1, Math.ceil((target - today) / (1000 * 60 * 60 * 24)));
  const forecastDays = Math.min(16, Math.max(3, daysOut + 2));

  const [gfsData, ecmwfData] = await Promise.allSettled([
    fetchWithRetry(
      `${ENSEMBLE_API}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&models=gfs025&forecast_days=${forecastDays}&temperature_unit=${tempUnit}`,
      2, 1000
    ),
    fetchWithRetry(
      `${ENSEMBLE_API}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&models=ecmwf_ifs025&forecast_days=${forecastDays}&temperature_unit=${tempUnit}`,
      2, 1000
    ),
  ]);

  const result = { gfsMembers: [], ecmwfMembers: [], gfsMean: null, ecmwfMean: null, combinedMean: null, combinedStd: null };

  function extractMembers(apiResult, maxMember) {
    if (apiResult.status !== 'fulfilled' || !apiResult.value) return [];
    const daily = apiResult.value.daily;
    if (!daily || !daily.time) return [];

    const dates = daily.time;
    const dateIdx = dates.indexOf(targetDate);
    if (dateIdx === -1) return [];

    const members = [];
    for (let i = 0; i <= maxMember; i++) {
      // Try both zero-padded and non-padded keys
      const padded = `temperature_2m_max_member${String(i).padStart(2, '0')}`;
      const unpadded = `temperature_2m_max_member${i}`;
      const key = daily[padded] ? padded : (daily[unpadded] ? unpadded : null);

      if (key && daily[key][dateIdx] != null && !isNaN(daily[key][dateIdx])) {
        members.push(daily[key][dateIdx]);
      }
    }
    return members;
  }

  result.gfsMembers = extractMembers(gfsData, 30);
  result.ecmwfMembers = extractMembers(ecmwfData, 50);

  // Log fetch results for debugging
  if (gfsData.status === 'rejected') console.warn('GFS fetch failed:', gfsData.reason);
  if (ecmwfData.status === 'rejected') console.warn('ECMWF fetch failed:', ecmwfData.reason);

  // Compute stats
  if (result.gfsMembers.length > 0) result.gfsMean = mean(result.gfsMembers);
  if (result.ecmwfMembers.length > 0) result.ecmwfMean = mean(result.ecmwfMembers);

  const allMembers = [...result.gfsMembers, ...result.ecmwfMembers];
  if (allMembers.length > 1) {
    result.combinedMean = mean(allMembers);
    result.combinedStd = stddev(allMembers);
  } else if (allMembers.length === 1) {
    result.combinedMean = allMembers[0];
    result.combinedStd = 2.0; // fallback uncertainty
  }

  return result;
}

function daysBetween(d1, d2) {
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

// ============================================================
// CORE LOGIC: PROBABILITIES & EDGE DETECTION
// ============================================================

function computeBucketProbabilities(ensemble, buckets, spreadInflation = 1.3, biasCorrection = 0) {
  if (!ensemble.combinedMean || !ensemble.combinedStd || buckets.length === 0) return [];

  const mu = ensemble.combinedMean + biasCorrection;
  const sigma = Math.max(ensemble.combinedStd * spreadInflation, 0.5); // min 0.5 degree floor

  return buckets.map(bucket => {
    const bounds = bucketToCDFBounds(bucket.parsed);
    const lower = bounds.lower === -Infinity ? -100 : bounds.lower;
    const upper = bounds.upper === Infinity ? 200 : bounds.upper;
    const prob = normalCDF(upper, mu, sigma) - normalCDF(lower, mu, sigma);
    return {
      ...bucket,
      modelProb: Math.max(0, Math.min(1, prob)),
    };
  });
}

function detectEdges(bucketsWithProbs, settings) {
  return bucketsWithProbs
    .filter(b => {
      // Skip settled/resolved buckets
      if (b.marketPrice >= 0.98 || b.marketPrice <= 0.002) return false;
      if (b.closed || !b.active) return false;
      return true;
    })
    .map(b => {
      const absEdge = b.modelProb - b.marketPrice;
      const noModelProb = 1 - b.modelProb;
      const noMarketPrice = 1 - b.marketPrice;
      const noAbsEdge = noModelProb - noMarketPrice; // positive = NO is underpriced

      // --- YES BUY ---
      // Model says more likely than market thinks, and entry is cheap enough
      const yesEdge = absEdge;
      const isYesBuy = yesEdge > 0 && b.marketPrice <= settings.maxEntryPrice / 100;

      // --- NO BUY ---
      // Model says LESS likely than market thinks → NO shares are underpriced
      // This covers:
      //   1. "98¢ NO play": market at 95¢+, model says much lower → NO costs 2-5¢, huge upside
      //   2. "Mid-range NO": market at 20-60¢, model says <5% → NO at 40-80¢ is safe profit
      //   3. "Tail fade": market at 10-25¢ on a tail bucket, model says 0-2% → NO at 75-90¢
      const noEdge = noAbsEdge; // how much NO is underpriced
      const noCost = noMarketPrice; // what you pay per NO share
      const isNoBuy = noEdge > 0 && b.marketPrice > 0.05; // model prob < market price, bucket isn't near-zero already

      // Pick the better side, or both if both have edge
      let side = null;
      let bestEdge = 0;
      let bestPrice = 0;
      let bestModelProb = 0;

      if (isYesBuy && isNoBuy) {
        // Both sides have edge — pick the one with higher relative edge
        const yesRelEdge = yesEdge / b.marketPrice;
        const noRelEdge = noEdge / noMarketPrice;
        if (yesRelEdge >= noRelEdge) {
          side = 'YES'; bestEdge = yesEdge; bestPrice = b.marketPrice; bestModelProb = b.modelProb;
        } else {
          side = 'NO'; bestEdge = noEdge; bestPrice = noMarketPrice; bestModelProb = noModelProb;
        }
      } else if (isYesBuy) {
        side = 'YES'; bestEdge = yesEdge; bestPrice = b.marketPrice; bestModelProb = b.modelProb;
      } else if (isNoBuy) {
        side = 'NO'; bestEdge = noEdge; bestPrice = noMarketPrice; bestModelProb = noModelProb;
      }

      return {
        ...b,
        absEdge: bestEdge,
        relEdge: bestPrice > 0 ? (bestEdge / bestPrice) * 100 : 0,
        side,
        effectivePrice: bestPrice,
        effectiveModelProb: bestModelProb,
        edgeStrength: Math.abs(bestEdge) * 100,
        // Keep original values for display
        yesEdge: yesEdge * 100,
        noEdge: noEdge * 100,
        noCost,
      };
    })
    .filter(b => b.side !== null && b.edgeStrength >= settings.minEdge)
    .sort((a, b) => b.edgeStrength - a.edgeStrength);
}

function assessSignalConfidence(signal, ensemble, settings) {
  const modelAgreement = ensemble.gfsMean && ensemble.ecmwfMean
    ? Math.abs(ensemble.gfsMean - ensemble.ecmwfMean)
    : null;

  const modelsAgree = modelAgreement !== null && modelAgreement <= settings.modelAgreementThreshold;
  const strongEdge = signal.edgeStrength >= settings.minEdge * 2;
  const cheapEntry = signal.marketPrice <= 0.15;

  let confidence = 'LOW';
  if (modelsAgree && strongEdge) confidence = 'HIGH';
  else if (modelsAgree || strongEdge) confidence = 'MED';

  return {
    ...signal,
    confidence,
    modelAgreement,
    modelsAgree,
  };
}

// ============================================================
// PAPER TRADING SYSTEM
// ============================================================

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { trades: [], settings: { ...DEFAULT_SETTINGS }, nextTradeId: 1 };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function executePaperTrade(signal, market, settings, state) {
  const bankroll = computeBankroll(state);
  if (bankroll <= 0) return null;

  // Check max positions
  const openTrades = state.trades.filter(t => t.status === 'open');
  if (openTrades.length >= settings.maxPositions) return null;

  // Check if already have position in this bucket
  if (openTrades.some(t => t.bucketId === signal.id)) return null;

  // For YES: price = market YES price. For NO: price = 1 - market YES price (cost of NO share)
  const price = signal.effectivePrice || (signal.side === 'YES' ? signal.marketPrice : (1 - signal.marketPrice));
  const modelProb = signal.effectiveModelProb || (signal.side === 'YES' ? signal.modelProb : (1 - signal.modelProb));

  // Kelly sizing based on effective price and model prob
  const maxCost = bankroll * (settings.maxPositionPct / 100);
  let cost = kellySize(modelProb, price, bankroll, settings.kellyFraction);
  cost = Math.min(cost, maxCost);
  cost = Math.max(cost, 0.50); // minimum $0.50 trade
  if (cost > bankroll) return null;

  const shares = Math.floor((cost / price) * 100) / 100;
  const actualCost = Math.round(shares * price * 100) / 100;

  const trade = {
    id: state.nextTradeId,
    timestamp: new Date().toISOString(),
    eventTitle: market.title,
    city: market.city,
    targetDate: market.targetDate,
    bucketId: signal.id,
    bucketLabel: signal.label,
    side: signal.side,
    entryPrice: price,
    shares,
    cost: actualCost,
    modelProb,
    marketPrice: signal.marketPrice,
    edge: signal.absEdge,
    confidence: signal.confidence,
    status: 'open',
    exitPrice: null,
    exitReason: null,
    exitTimestamp: null,
    pnl: null,
  };

  return trade;
}

function checkTradeExits(trade, currentMarket) {
  if (trade.status !== 'open') return trade;

  // Find current price of the bucket
  const bucket = currentMarket?.buckets?.find(b => b.id === trade.bucketId);
  const currentPrice = bucket ? (trade.side === 'YES' ? bucket.marketPrice : (1 - bucket.marketPrice)) : null;

  // Check if market is resolved
  if (currentMarket?.isResolved) {
    const settledBucket = currentMarket.buckets.find(b => b.marketPrice >= 0.95);
    const won = settledBucket && settledBucket.id === trade.bucketId && trade.side === 'YES';
    const wonNo = settledBucket && settledBucket.id !== trade.bucketId && trade.side === 'NO';
    const didWin = won || wonNo;

    return {
      ...trade,
      status: 'closed',
      exitPrice: didWin ? 1.0 : 0.0,
      exitReason: didWin ? 'RESOLVED_WIN' : 'RESOLVED_LOSS',
      exitTimestamp: new Date().toISOString(),
      pnl: didWin ? (trade.shares * 1.0 - trade.cost) : -trade.cost,
    };
  }

  if (currentPrice === null) return trade;

  // Take profit
  const tpPrice = 0.85;
  if (currentPrice >= tpPrice) {
    const pnl = Math.round((trade.shares * currentPrice - trade.cost) * 100) / 100;
    return {
      ...trade,
      status: 'closed',
      exitPrice: currentPrice,
      exitReason: 'TAKE_PROFIT',
      exitTimestamp: new Date().toISOString(),
      pnl,
    };
  }

  // Stop loss
  const slPrice = trade.entryPrice * 0.5;
  if (currentPrice <= slPrice) {
    const pnl = Math.round((trade.shares * currentPrice - trade.cost) * 100) / 100;
    return {
      ...trade,
      status: 'closed',
      exitPrice: currentPrice,
      exitReason: 'STOP_LOSS',
      exitTimestamp: new Date().toISOString(),
      pnl,
    };
  }

  return trade;
}

function computeBankroll(state) {
  const settings = state.settings || DEFAULT_SETTINGS;
  let bankroll = settings.bankroll;
  for (const trade of state.trades) {
    if (trade.status === 'open') {
      bankroll -= trade.cost;
    } else if (trade.status === 'closed') {
      bankroll += (trade.pnl || 0);
    }
  }
  return Math.round(bankroll * 100) / 100;
}

function computeStats(trades) {
  const closed = trades.filter(t => t.status === 'closed');
  const wins = closed.filter(t => t.pnl > 0);
  const losses = closed.filter(t => t.pnl <= 0);
  const totalPnl = closed.reduce((s, t) => s + (t.pnl || 0), 0);
  const openTrades = trades.filter(t => t.status === 'open');
  const openCost = openTrades.reduce((s, t) => s + t.cost, 0);

  return {
    totalTrades: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate: closed.length > 0 ? (wins.length / closed.length * 100).toFixed(1) : '—',
    totalPnl: Math.round(totalPnl * 100) / 100,
    openPositions: openTrades.length,
    openCost: Math.round(openCost * 100) / 100,
    avgWin: wins.length > 0 ? Math.round(mean(wins.map(t => t.pnl)) * 100) / 100 : 0,
    avgLoss: losses.length > 0 ? Math.round(mean(losses.map(t => t.pnl)) * 100) / 100 : 0,
  };
}

// ============================================================
// REACT DASHBOARD COMPONENT
// ============================================================

export default function Dashboard() {
  const [state, setState] = useState(loadState);
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [ensemble, setEnsemble] = useState(null);
  const [signals, setSignals] = useState([]);
  const [allSignals, setAllSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle');
  const [lastScan, setLastScan] = useState(null);
  const [tab, setTab] = useState('scanner');
  const [logs, setLogs] = useState([]);
  const scanTimer = useRef(null);
  const settings = state.settings || DEFAULT_SETTINGS;

  const addLog = useCallback((msg, type = 'info') => {
    setLogs(prev => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 200));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setState(prev => {
      const next = { ...prev, settings: { ...prev.settings, ...newSettings } };
      saveState(next);
      return next;
    });
  }, []);

  // ---- MAIN SCAN FUNCTION ----
  const runScan = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setScanStatus('scanning');
    addLog('Starting market scan...', 'info');

    try {
      // 1. Fetch weather events
      addLog('Fetching weather markets from Polymarket...', 'info');
      const events = await fetchWeatherEvents();
      const parsed = events.map(parseEventToMarket).filter(m => m.buckets.length > 0);
      addLog(`Found ${parsed.length} weather markets (${parsed.filter(m => !m.isResolved).length} active)`, 'success');
      setMarkets(parsed);

      // 2. For each active market, fetch ensemble and compute edges
      const activeMarkets = parsed.filter(m => !m.isResolved && m.cityInfo && m.targetDate);
      const allNewSignals = [];

      for (const market of activeMarkets.slice(0, 15)) { // limit to 15 to avoid rate limits
        try {
          addLog(`Analyzing ${market.city} — ${market.targetDate}...`, 'info');
          const ens = await fetchEnsembleData(
            market.cityInfo.lat, market.cityInfo.lon,
            market.targetDate, market.tempUnit
          );

          if (!ens.combinedMean) {
            addLog(`No ensemble data for ${market.city} ${market.targetDate}`, 'warn');
            continue;
          }

          const withProbs = computeBucketProbabilities(ens, market.buckets, settings.spreadInflation);
          const edges = detectEdges(withProbs, settings);
          const assessed = edges.map(s => assessSignalConfidence(s, ens, settings));

          assessed.forEach(signal => {
            allNewSignals.push({
              ...signal,
              market,
              ensemble: ens,
            });
          });

          // Auto paper-trade if enabled
          if (settings.autoTrade) {
            for (const signal of assessed.filter(s => s.confidence !== 'LOW')) {
              setState(prev => {
                const trade = executePaperTrade(signal, market, prev.settings || settings, prev);
                if (trade) {
                  addLog(`📈 AUTO PAPER TRADE: ${trade.side} ${trade.bucketLabel} @ $${trade.entryPrice.toFixed(2)} — $${trade.cost.toFixed(2)}`, 'trade');
                  const next = {
                    ...prev,
                    trades: [...prev.trades, trade],
                    nextTradeId: prev.nextTradeId + 1,
                  };
                  saveState(next);
                  return next;
                }
                return prev;
              });
            }
          }

          // Check exits on open trades for this market
          setState(prev => {
            let changed = false;
            const updatedTrades = prev.trades.map(t => {
              if (t.status === 'open' && t.city === market.city && t.targetDate === market.targetDate) {
                const updated = checkTradeExits(t, { ...market, buckets: withProbs });
                if (updated.status !== t.status) {
                  changed = true;
                  addLog(`${updated.pnl >= 0 ? '✅' : '❌'} CLOSED: ${t.bucketLabel} — ${updated.exitReason} — P&L: $${(updated.pnl || 0).toFixed(2)}`, updated.pnl >= 0 ? 'success' : 'error');
                }
                return updated;
              }
              return t;
            });
            if (changed) {
              const next = { ...prev, trades: updatedTrades };
              saveState(next);
              return next;
            }
            return prev;
          });

          await new Promise(r => setTimeout(r, 300)); // rate limit pause
        } catch (e) {
          addLog(`Error analyzing ${market.city}: ${e.message}`, 'error');
        }
      }

      setAllSignals(allNewSignals);
      addLog(`Scan complete. Found ${allNewSignals.length} signals.`, 'success');
      setScanStatus('complete');
      setLastScan(new Date());
    } catch (e) {
      addLog(`Scan failed: ${e.message}`, 'error');
      setScanStatus('error');
    } finally {
      setLoading(false);
    }
  }, [loading, settings, addLog]);

  // ---- SELECT MARKET & FETCH DETAILS ----
  const selectMarket = useCallback(async (market) => {
    setSelectedMarket(market);
    setTab('analysis');

    if (market.cityInfo && market.targetDate) {
      try {
        const ens = await fetchEnsembleData(
          market.cityInfo.lat, market.cityInfo.lon,
          market.targetDate, market.tempUnit
        );
        setEnsemble(ens);

        const withProbs = computeBucketProbabilities(ens, market.buckets, settings.spreadInflation);
        const edges = detectEdges(withProbs, settings);
        const assessed = edges.map(s => assessSignalConfidence(s, ens, settings));
        setSignals(assessed);

        // Update market buckets with model probabilities
        setSelectedMarket(prev => ({
          ...prev,
          buckets: withProbs,
        }));
      } catch (e) {
        addLog(`Failed to load analysis for ${market.city}: ${e.message}`, 'error');
      }
    }
  }, [settings, addLog]);

  // ---- MANUAL PAPER TRADE ----
  const manualPaperTrade = useCallback((signal, market) => {
    setState(prev => {
      const currentSettings = prev.settings || DEFAULT_SETTINGS;
      const trade = executePaperTrade(signal, market, currentSettings, prev);
      if (!trade) {
        addLog('Cannot execute trade (check bankroll/position limits)', 'warn');
        return prev;
      }
      addLog(`📈 PAPER TRADE: ${trade.side} ${trade.bucketLabel} @ $${trade.entryPrice.toFixed(2)} — $${trade.cost.toFixed(2)}`, 'trade');
      const next = {
        ...prev,
        trades: [...prev.trades, trade],
        nextTradeId: prev.nextTradeId + 1,
      };
      saveState(next);
      return next;
    });
  }, [addLog]);

  // ---- AUTO SCAN TIMER ----
  const runScanRef = useRef(runScan);
  runScanRef.current = runScan;

  useEffect(() => {
    if (scanTimer.current) clearInterval(scanTimer.current);
    if (settings.scanInterval > 0) {
      scanTimer.current = setInterval(() => runScanRef.current(), settings.scanInterval * 1000);
    }
    return () => { if (scanTimer.current) clearInterval(scanTimer.current); };
  }, [settings.scanInterval]);

  // ---- INITIAL SCAN ----
  const didInitialScan = useRef(false);
  useEffect(() => {
    if (!didInitialScan.current) {
      didInitialScan.current = true;
      runScan();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bankroll = computeBankroll(state);
  const stats = computeStats(state.trades);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={S.root}>
      {/* ---- TOP BAR ---- */}
      <div style={S.topBar}>
        <div style={S.logo}>
          <span style={{ fontSize: 20, marginRight: 6 }}>⚡</span>
          <span style={S.logoText}>WEATHER EDGE</span>
          <span style={S.logoSub}>POLYMARKET SCANNER</span>
        </div>
        <div style={S.metrics}>
          <Metric label="BANKROLL" value={`$${bankroll.toFixed(2)}`} color={bankroll >= settings.bankroll ? '#00ffa3' : '#ff4757'} />
          <Metric label="OPEN" value={stats.openPositions} color="#4ecdc4" />
          <Metric label="W/L" value={`${stats.wins}/${stats.losses}`} color="#ffd93d" />
          <Metric label="WIN RATE" value={stats.winRate === '—' ? '—' : `${stats.winRate}%`} color="#a29bfe" />
          <Metric label="P&L" value={`${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}`} color={stats.totalPnl >= 0 ? '#00ffa3' : '#ff4757'} />
        </div>
        <div style={S.scanBox}>
          <button onClick={runScan} disabled={loading} style={S.scanBtn}>
            {loading ? '⟳ Scanning...' : '⚡ Scan Now'}
          </button>
          <div style={S.scanInfo}>
            {lastScan ? `Last: ${lastScan.toLocaleTimeString()}` : 'Never scanned'}
          </div>
        </div>
      </div>

      {/* ---- TABS ---- */}
      <div style={S.tabBar}>
        {['scanner', 'analysis', 'signals', 'trades', 'settings', 'log'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...S.tabBtn, ...(tab === t ? S.tabActive : {}) }}>
            {t === 'scanner' && '📡 '}
            {t === 'analysis' && '📊 '}
            {t === 'signals' && '🎯 '}
            {t === 'trades' && '💰 '}
            {t === 'settings' && '⚙️ '}
            {t === 'log' && '📋 '}
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'signals' && allSignals.length > 0 && (
              <span style={S.badge}>{allSignals.length}</span>
            )}
            {t === 'trades' && stats.openPositions > 0 && (
              <span style={S.badge}>{stats.openPositions}</span>
            )}
          </button>
        ))}
      </div>

      {/* ---- TAB CONTENT ---- */}
      <div style={S.content}>
        {tab === 'scanner' && <ScannerTab markets={markets} onSelect={selectMarket} loading={loading} />}
        {tab === 'analysis' && <AnalysisTab market={selectedMarket} ensemble={ensemble} signals={signals} settings={settings} onTrade={manualPaperTrade} />}
        {tab === 'signals' && <SignalsTab signals={allSignals} onTrade={manualPaperTrade} onSelect={selectMarket} />}
        {tab === 'trades' && <TradesTab trades={state.trades} bankroll={bankroll} stats={stats} settings={settings} />}
        {tab === 'settings' && <SettingsTab settings={settings} onUpdate={updateSettings} state={state} setState={setState} />}
        {tab === 'log' && <LogTab logs={logs} />}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function Metric({ label, value, color }) {
  return (
    <div style={S.metric}>
      <div style={S.metricLabel}>{label}</div>
      <div style={{ ...S.metricValue, color }}>{value}</div>
    </div>
  );
}

function ScannerTab({ markets, onSelect, loading }) {
  const active = markets.filter(m => !m.isResolved);
  const resolved = markets.filter(m => m.isResolved);

  return (
    <div>
      {markets.length === 0 && !loading && (
        <div style={S.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>No weather markets found</div>
          <div style={{ fontSize: 13, color: '#636e72' }}>
            Click "Scan Now" to search for active Polymarket weather markets.
            <br />If this persists, Polymarket may not have active temperature markets right now.
            <br />Check <a href="https://polymarket.com/browse?topic=weather" target="_blank" rel="noreferrer" style={{ color: '#4ecdc4' }}>polymarket.com/browse?topic=weather</a> to verify.
          </div>
        </div>
      )}

      {active.length > 0 && (
        <>
          <div style={S.sectionTitle}>✅ Active Markets ({active.length})</div>
          <div style={S.marketGrid}>
            {active.map(m => (
              <MarketCard key={m.eventId} market={m} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}

      {resolved.length > 0 && (
        <>
          <div style={{ ...S.sectionTitle, marginTop: 24, color: '#636e72' }}>❌ Resolved ({resolved.length})</div>
          <div style={S.marketGrid}>
            {resolved.map(m => (
              <MarketCard key={m.eventId} market={m} onSelect={onSelect} isResolved />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MarketCard({ market, onSelect, isResolved }) {
  const priceSum = market.buckets.reduce((s, b) => s + b.marketPrice, 0);
  return (
    <div onClick={() => onSelect(market)} style={{ ...S.card, ...(isResolved ? S.cardResolved : {}), cursor: 'pointer' }}>
      <div style={S.cardHeader}>
        <span style={S.cardCity}>{market.city ? market.city.replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown'}</span>
        <span style={{ ...S.cardStatus, color: isResolved ? '#ff4757' : '#00ffa3' }}>
          {isResolved ? '● RESOLVED' : '● LIVE'}
        </span>
      </div>
      <div style={S.cardDate}>{market.targetDate || 'No date'}</div>
      <div style={S.cardInfo}>
        <span>{market.buckets.length} buckets</span>
        <span style={{ color: '#636e72' }}>|</span>
        <span>{market.tempUnit === 'celsius' ? '°C' : '°F'}</span>
        <span style={{ color: '#636e72' }}>|</span>
        <span style={{ color: Math.abs(priceSum - 1.0) < 0.1 ? '#636e72' : '#ffd93d' }}>
          Σ={priceSum.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function AnalysisTab({ market, ensemble, signals, settings, onTrade }) {
  if (!market) return (
    <div style={S.emptyState}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div>Select a market from the Scanner tab to analyze</div>
    </div>
  );

  const ensembleChartData = ensemble ? buildEnsembleChart(ensemble) : [];
  const bucketChartData = market.buckets.map(b => ({
    name: b.label.replace(/°[CF]/g, '°'),
    market: Math.round(b.marketPrice * 10000) / 100,
    model: b.modelProb != null ? Math.round(b.modelProb * 10000) / 100 : null,
  }));

  return (
    <div>
      {market.isResolved && (
        <div style={S.warningBanner}>
          ⚠️ THIS MARKET IS RESOLVED — DO NOT TRADE. {market.isPastDate ? 'Target date has passed.' : 'A bucket has settled at 95%+.'}
        </div>
      )}

      <div style={S.sectionTitle}>{market.title}</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Tag label="City" value={market.city || '?'} />
        <Tag label="Date" value={market.targetDate || '?'} />
        <Tag label="Unit" value={market.tempUnit === 'celsius' ? '°C' : '°F'} />
        {ensemble?.gfsMean != null && <Tag label="GFS Mean" value={ensemble.gfsMean.toFixed(1)} color="#ff6b6b" />}
        {ensemble?.ecmwfMean != null && <Tag label="ECMWF Mean" value={ensemble.ecmwfMean.toFixed(1)} color="#4ecdc4" />}
        {ensemble?.combinedStd != null && <Tag label="Spread (σ)" value={ensemble.combinedStd.toFixed(1)} />}
        {ensemble?.gfsMean != null && ensemble?.ecmwfMean != null && (
          <Tag label="Model Δ" value={Math.abs(ensemble.gfsMean - ensemble.ecmwfMean).toFixed(1)}
            color={Math.abs(ensemble.gfsMean - ensemble.ecmwfMean) <= settings.modelAgreementThreshold ? '#00ffa3' : '#ffd93d'} />
        )}
      </div>

      {/* Ensemble Distribution Chart */}
      {ensembleChartData.length > 0 && (
        <div style={S.chartBox}>
          <div style={S.chartTitle}>Ensemble Member Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ensembleChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="temp" tick={{ fontSize: 11, fill: '#636e72' }} />
              <YAxis tick={{ fontSize: 11, fill: '#636e72' }} />
              <Tooltip contentStyle={S.tooltipStyle} />
              <Area type="monotone" dataKey="gfs" stackId="1" fill="#ff6b6b" fillOpacity={0.4} stroke="#ff6b6b" name="GFS" />
              <Area type="monotone" dataKey="ecmwf" stackId="2" fill="#4ecdc4" fillOpacity={0.4} stroke="#4ecdc4" name="ECMWF" />
              {ensemble.combinedMean && <ReferenceLine x={Math.round(ensemble.combinedMean)} stroke="#ffd93d" strokeDasharray="5 3" label={{ value: 'Mean', fill: '#ffd93d', fontSize: 11 }} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bucket Probability Comparison */}
      {bucketChartData.length > 0 && (
        <div style={S.chartBox}>
          <div style={S.chartTitle}>Market Price vs Model Probability (%)</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bucketChartData} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#636e72' }} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#636e72' }} domain={[0, 'auto']} />
              <Tooltip contentStyle={S.tooltipStyle} />
              <Bar dataKey="market" name="Market %" fill="#636e72" radius={[2, 2, 0, 0]} />
              <Bar dataKey="model" name="Model %" fill="#4ecdc4" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bucket Details Table */}
      <div style={S.chartBox}>
        <div style={S.chartTitle}>Bucket Analysis</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Bucket</th>
                <th style={S.th}>YES $</th>
                <th style={S.th}>NO $</th>
                <th style={S.th}>Model %</th>
                <th style={S.th}>YES Edge</th>
                <th style={S.th}>NO Edge</th>
                <th style={S.th}>Signal</th>
                <th style={S.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {market.buckets.map(b => {
                const isSettled = b.marketPrice >= 0.95 || b.marketPrice <= 0.005;
                const yesEdge = b.modelProb != null ? ((b.modelProb - b.marketPrice) * 100).toFixed(1) : null;
                const noEdge = b.modelProb != null ? (((1 - b.modelProb) - (1 - b.marketPrice)) * 100).toFixed(1) : null;
                const signal = signals.find(s => s.id === b.id);
                return (
                  <tr key={b.id} style={isSettled ? { opacity: 0.4, background: '#1a0a0a' } : {}}>
                    <td style={S.td}>{isSettled ? '🔒 ' : ''}{b.label}</td>
                    <td style={{ ...S.td, fontFamily: 'IBM Plex Mono, monospace' }}>${b.marketPrice.toFixed(2)}</td>
                    <td style={{ ...S.td, fontFamily: 'IBM Plex Mono, monospace', color: '#8a9bae' }}>${(1 - b.marketPrice).toFixed(2)}</td>
                    <td style={S.td}>{b.modelProb != null ? `${(b.modelProb * 100).toFixed(1)}%` : '—'}</td>
                    <td style={{ ...S.td, color: yesEdge > 0 ? '#00ffa3' : yesEdge < 0 ? '#ff4757' : '#636e72', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {yesEdge ? `${yesEdge > 0 ? '+' : ''}${yesEdge}%` : '—'}
                    </td>
                    <td style={{ ...S.td, color: noEdge > 0 ? '#00ffa3' : noEdge < 0 ? '#ff4757' : '#636e72', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {noEdge ? `${noEdge > 0 ? '+' : ''}${noEdge}%` : '—'}
                    </td>
                    <td style={S.td}>
                      {signal && (
                        <span style={{ ...S.badge2, background: signal.confidence === 'HIGH' ? '#00ffa3' : signal.confidence === 'MED' ? '#ffd93d' : '#636e72', color: '#0a0e17' }}>
                          {signal.side} — {signal.confidence}
                        </span>
                      )}
                    </td>
                    <td style={S.td}>
                      {signal && !market.isResolved && (
                        <button onClick={() => onTrade(signal, market)} style={{
                          ...S.tradeBtn,
                          background: signal.side === 'NO' ? '#ff6b6b' : '#00ffa3',
                        }}>
                          Paper {signal.side}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SignalsTab({ signals, onTrade, onSelect }) {
  if (signals.length === 0) return (
    <div style={S.emptyState}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
      <div>No signals found yet. Run a scan to discover edges.</div>
    </div>
  );

  return (
    <div>
      <div style={S.sectionTitle}>All Signals ({signals.length})</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>City</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Bucket</th>
              <th style={S.th}>Side</th>
              <th style={S.th}>Cost/Share</th>
              <th style={S.th}>Model %</th>
              <th style={S.th}>Edge</th>
              <th style={S.th}>Confidence</th>
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s, i) => {
              const effectivePrice = s.effectivePrice || (s.side === 'YES' ? s.marketPrice : (1 - s.marketPrice));
              const effectiveModelProb = s.effectiveModelProb || (s.side === 'YES' ? s.modelProb : (1 - s.modelProb));
              return (
              <tr key={i} style={s.confidence === 'HIGH' ? { background: '#0a1a15' } : {}}>
                <td style={S.td}>{s.market.city || '?'}</td>
                <td style={S.td}>{s.market.targetDate || '?'}</td>
                <td style={S.td}>{s.label}</td>
                <td style={{ ...S.td, color: s.side === 'YES' ? '#00ffa3' : '#ff6b6b', fontWeight: 600 }}>{s.side}</td>
                <td style={{ ...S.td, fontFamily: 'IBM Plex Mono, monospace' }}>
                  ${effectivePrice.toFixed(2)}
                  <span style={{ color: '#636e72', fontSize: 10 }}> {s.side === 'NO' ? '(NO)' : '(YES)'}</span>
                </td>
                <td style={{ ...S.td, fontFamily: 'IBM Plex Mono, monospace' }}>{(effectiveModelProb * 100).toFixed(1)}%</td>
                <td style={{ ...S.td, color: '#00ffa3', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>+{s.edgeStrength.toFixed(1)}%</td>
                <td style={S.td}>
                  <span style={{ ...S.badge2, background: s.confidence === 'HIGH' ? '#00ffa3' : s.confidence === 'MED' ? '#ffd93d' : '#636e72', color: '#0a0e17' }}>
                    {s.confidence}
                  </span>
                </td>
                <td style={S.td}>
                  <button onClick={() => onTrade(s, s.market)} style={{
                    ...S.tradeBtn,
                    background: s.side === 'NO' ? '#ff6b6b' : '#00ffa3',
                  }}>Trade</button>
                  {' '}
                  <button onClick={() => onSelect(s.market)} style={{ ...S.tradeBtn, background: '#1e2a3a' }}>View</button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TradesTab({ trades, bankroll, stats, settings }) {
  const sortedTrades = [...trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const openTrades = sortedTrades.filter(t => t.status === 'open');
  const closedTrades = sortedTrades.filter(t => t.status === 'closed');

  // Build cumulative P&L chart data
  const pnlData = [];
  let cumPnl = 0;
  const chronological = [...closedTrades].reverse();
  chronological.forEach((t, i) => {
    cumPnl += t.pnl || 0;
    pnlData.push({ trade: i + 1, pnl: Math.round(cumPnl * 100) / 100 });
  });

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatBox label="Available Bankroll" value={`$${bankroll.toFixed(2)}`} color={bankroll > 0 ? '#00ffa3' : '#ff4757'} />
        <StatBox label="In Positions" value={`$${stats.openCost.toFixed(2)}`} color="#4ecdc4" />
        <StatBox label="Total P&L" value={`${stats.totalPnl >= 0 ? '+' : ''}$${stats.totalPnl.toFixed(2)}`} color={stats.totalPnl >= 0 ? '#00ffa3' : '#ff4757'} />
        <StatBox label="Win Rate" value={stats.winRate === '—' ? '—' : `${stats.winRate}%`} color="#a29bfe" />
        <StatBox label="Avg Win" value={`+$${stats.avgWin.toFixed(2)}`} color="#00ffa3" />
        <StatBox label="Avg Loss" value={`$${stats.avgLoss.toFixed(2)}`} color="#ff4757" />
      </div>

      {/* Cumulative P&L Chart */}
      {pnlData.length > 0 && (
        <div style={S.chartBox}>
          <div style={S.chartTitle}>Cumulative P&L</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="trade" tick={{ fontSize: 11, fill: '#636e72' }} />
              <YAxis tick={{ fontSize: 11, fill: '#636e72' }} />
              <Tooltip contentStyle={S.tooltipStyle} />
              <ReferenceLine y={0} stroke="#636e72" />
              <Line type="monotone" dataKey="pnl" stroke="#4ecdc4" strokeWidth={2} dot={false} name="P&L ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Open Positions */}
      {openTrades.length > 0 && (
        <>
          <div style={S.sectionTitle}>📈 Open Positions ({openTrades.length})</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Time</th>
                  <th style={S.th}>Market</th>
                  <th style={S.th}>Side</th>
                  <th style={S.th}>Entry</th>
                  <th style={S.th}>Shares</th>
                  <th style={S.th}>Cost</th>
                  <th style={S.th}>Edge</th>
                  <th style={S.th}>Conf</th>
                </tr>
              </thead>
              <tbody>
                {openTrades.map(t => (
                  <tr key={t.id}>
                    <td style={S.td}>{new Date(t.timestamp).toLocaleString()}</td>
                    <td style={S.td}>{t.city} {t.targetDate}<br /><small style={{ color: '#636e72' }}>{t.bucketLabel}</small></td>
                    <td style={{ ...S.td, color: t.side === 'YES' ? '#00ffa3' : '#ff6b6b', fontWeight: 600 }}>{t.side}</td>
                    <td style={{ ...S.td, fontFamily: 'IBM Plex Mono' }}>${t.entryPrice.toFixed(2)}</td>
                    <td style={{ ...S.td, fontFamily: 'IBM Plex Mono' }}>{t.shares.toFixed(1)}</td>
                    <td style={{ ...S.td, fontFamily: 'IBM Plex Mono' }}>${t.cost.toFixed(2)}</td>
                    <td style={{ ...S.td, color: '#00ffa3', fontFamily: 'IBM Plex Mono' }}>+{(t.edge * 100).toFixed(1)}%</td>
                    <td style={S.td}>
                      <span style={{ ...S.badge2, background: t.confidence === 'HIGH' ? '#00ffa3' : t.confidence === 'MED' ? '#ffd93d' : '#636e72', color: '#0a0e17' }}>
                        {t.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Closed Trades */}
      <div style={{ ...S.sectionTitle, marginTop: 24 }}>📜 Trade History ({closedTrades.length})</div>
      {closedTrades.length === 0 ? (
        <div style={{ color: '#636e72', padding: 16 }}>No closed trades yet. Trades close when markets resolve, or hit TP/SL.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Time</th>
                <th style={S.th}>Market</th>
                <th style={S.th}>Side</th>
                <th style={S.th}>Entry</th>
                <th style={S.th}>Exit</th>
                <th style={S.th}>Reason</th>
                <th style={S.th}>P&L</th>
              </tr>
            </thead>
            <tbody>
              {closedTrades.map(t => (
                <tr key={t.id}>
                  <td style={S.td}>{new Date(t.timestamp).toLocaleDateString()}</td>
                  <td style={S.td}>{t.city} {t.targetDate}<br /><small style={{ color: '#636e72' }}>{t.bucketLabel}</small></td>
                  <td style={{ ...S.td, color: t.side === 'YES' ? '#00ffa3' : '#ff6b6b' }}>{t.side}</td>
                  <td style={{ ...S.td, fontFamily: 'IBM Plex Mono' }}>${t.entryPrice.toFixed(2)}</td>
                  <td style={{ ...S.td, fontFamily: 'IBM Plex Mono' }}>${(t.exitPrice || 0).toFixed(2)}</td>
                  <td style={S.td}>{t.exitReason}</td>
                  <td style={{ ...S.td, fontFamily: 'IBM Plex Mono', fontWeight: 600, color: (t.pnl || 0) >= 0 ? '#00ffa3' : '#ff4757' }}>
                    {(t.pnl || 0) >= 0 ? '+' : ''}${(t.pnl || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ settings, onUpdate, state, setState }) {
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={S.sectionTitle}>⚙️ Strategy Settings</div>

      <SettingRow label="Starting Bankroll ($)" value={settings.bankroll}
        onChange={v => onUpdate({ bankroll: parseFloat(v) || 100 })} type="number" min={10} max={100000} />
      <SettingRow label="Min Edge Threshold (%)" value={settings.minEdge}
        onChange={v => onUpdate({ minEdge: parseFloat(v) || 5 })} type="number" min={1} max={30} />
      <SettingRow label="Spread Inflation Factor" value={settings.spreadInflation}
        onChange={v => onUpdate({ spreadInflation: parseFloat(v) || 1.3 })} type="number" min={1} max={3} step="0.1" />
      <SettingRow label="Max Simultaneous Positions" value={settings.maxPositions}
        onChange={v => onUpdate({ maxPositions: parseInt(v) || 5 })} type="number" min={1} max={20} />
      <SettingRow label="Max Position Size (% bankroll)" value={settings.maxPositionPct}
        onChange={v => onUpdate({ maxPositionPct: parseFloat(v) || 10 })} type="number" min={1} max={25} />
      <SettingRow label="Max Entry Price (¢)" value={settings.maxEntryPrice}
        onChange={v => onUpdate({ maxEntryPrice: parseFloat(v) || 25 })} type="number" min={5} max={50} />
      <SettingRow label="Kelly Fraction" value={settings.kellyFraction}
        onChange={v => onUpdate({ kellyFraction: parseFloat(v) || 0.25 })} type="number" min={0.1} max={1} step="0.05" />
      <SettingRow label="Model Agreement Threshold (°)" value={settings.modelAgreementThreshold}
        onChange={v => onUpdate({ modelAgreementThreshold: parseFloat(v) || 3 })} type="number" min={1} max={10} />
      <SettingRow label="Scan Interval (seconds)" value={settings.scanInterval}
        onChange={v => onUpdate({ scanInterval: parseInt(v) || 300 })} type="number" min={60} max={3600} />

      <div style={{ ...S.settingRow, marginTop: 20 }}>
        <label style={S.settingLabel}>Auto Paper-Trade</label>
        <button onClick={() => onUpdate({ autoTrade: !settings.autoTrade })}
          style={{ ...S.toggleBtn, background: settings.autoTrade ? '#00ffa3' : '#1e2a3a', color: settings.autoTrade ? '#0a0e17' : '#c8d6e5' }}>
          {settings.autoTrade ? 'ON' : 'OFF'}
        </button>
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
        <button onClick={() => {
          if (confirm('Reset all trades? This cannot be undone.')) {
            setState(prev => {
              const next = { ...prev, trades: [], nextTradeId: 1 };
              saveState(next);
              return next;
            });
          }
        }} style={{ ...S.tradeBtn, background: '#ff4757', color: '#fff' }}>
          Reset All Trades
        </button>
        <button onClick={() => {
          if (confirm('Reset all settings to defaults?')) {
            onUpdate(DEFAULT_SETTINGS);
          }
        }} style={{ ...S.tradeBtn, background: '#1e2a3a' }}>
          Reset Settings
        </button>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: '#0d1117', borderRadius: 8, border: '1px solid #1e2a3a' }}>
        <div style={{ fontSize: 13, color: '#636e72', marginBottom: 8 }}>Strategy Reference</div>
        <div style={{ fontSize: 12, color: '#8a9bae', lineHeight: 1.8 }}>
          <strong style={{ color: '#4ecdc4' }}>Temperature Laddering:</strong> Buy YES across 3-5 adjacent buckets at ≤$0.15. One hit covers all losses.<br />
          <strong style={{ color: '#ff6b6b' }}>98¢ NO Play:</strong> Buy NO at ≤$0.08 on tail buckets where model shows 0 members. High win rate, small per-trade profit.<br />
          <strong style={{ color: '#ffd93d' }}>Timing:</strong> Best edges appear 4-6 hours after GFS/ECMWF runs (00Z, 06Z, 12Z, 18Z UTC).<br />
          <strong style={{ color: '#a29bfe' }}>Quarter-Kelly:</strong> Bet 25% of full Kelly size. Smooths volatility while retaining 75% of growth rate.<br />
          <strong style={{ color: '#00ffa3' }}>Model Agreement:</strong> Only trade when GFS and ECMWF means are within {settings.modelAgreementThreshold}° of each other.
        </div>
      </div>
    </div>
  );
}

function LogTab({ logs }) {
  return (
    <div>
      <div style={S.sectionTitle}>📋 Activity Log</div>
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {logs.map((l, i) => (
          <div key={i} style={{ ...S.logEntry, borderLeft: `3px solid ${l.type === 'error' ? '#ff4757' : l.type === 'success' ? '#00ffa3' : l.type === 'trade' ? '#ffd93d' : l.type === 'warn' ? '#ffd93d' : '#1e2a3a'}` }}>
            <span style={{ color: '#636e72', marginRight: 8, fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>{l.time}</span>
            <span>{l.msg}</span>
          </div>
        ))}
        {logs.length === 0 && <div style={{ color: '#636e72', padding: 16 }}>No activity yet.</div>}
      </div>
    </div>
  );
}

// ---- HELPERS ----

function Tag({ label, value, color = '#c8d6e5' }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
      <span style={{ color: '#636e72', marginRight: 4 }}>{label}:</span>
      <span style={{ color, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 8, padding: '12px 16px', minWidth: 120 }}>
      <div style={{ fontSize: 11, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'IBM Plex Mono, monospace' }}>{value}</div>
    </div>
  );
}

function SettingRow({ label, value, onChange, type, min, max, step }) {
  return (
    <div style={S.settingRow}>
      <label style={S.settingLabel}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        min={min} max={max} step={step} style={S.settingInput} />
    </div>
  );
}

function buildEnsembleChart(ensemble) {
  const allTemps = [...ensemble.gfsMembers, ...ensemble.ecmwfMembers];
  if (allTemps.length === 0) return [];

  const min = Math.floor(Math.min(...allTemps)) - 3;
  const max = Math.ceil(Math.max(...allTemps)) + 3;
  const bins = {};
  for (let t = min; t <= max; t++) bins[t] = { temp: t, gfs: 0, ecmwf: 0 };

  ensemble.gfsMembers.forEach(v => {
    const bin = Math.round(v);
    if (bins[bin]) bins[bin].gfs++;
  });
  ensemble.ecmwfMembers.forEach(v => {
    const bin = Math.round(v);
    if (bins[bin]) bins[bin].ecmwf++;
  });

  return Object.values(bins);
}

// ============================================================
// STYLES
// ============================================================

const S = {
  root: { minHeight: '100vh', background: '#0a0e17', color: '#c8d6e5', fontFamily: "'DM Sans', sans-serif" },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#0d1117', borderBottom: '1px solid #1e2a3a', flexWrap: 'wrap', gap: 12 },
  logo: { display: 'flex', alignItems: 'center', gap: 4 },
  logoText: { fontFamily: 'IBM Plex Mono, monospace', fontWeight: 700, fontSize: 15, color: '#00ffa3', letterSpacing: 1 },
  logoSub: { fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#636e72', marginLeft: 8, letterSpacing: 1 },
  metrics: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' },
  metric: { textAlign: 'center' },
  metricLabel: { fontSize: 9, color: '#636e72', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  metricValue: { fontSize: 15, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' },
  scanBox: { display: 'flex', alignItems: 'center', gap: 8 },
  scanBtn: { background: '#00ffa3', color: '#0a0e17', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'opacity 0.2s' },
  scanInfo: { fontSize: 11, color: '#636e72', fontFamily: 'IBM Plex Mono, monospace' },
  tabBar: { display: 'flex', gap: 2, padding: '0 20px', background: '#0d1117', borderBottom: '1px solid #1e2a3a', overflowX: 'auto' },
  tabBtn: { background: 'none', border: 'none', color: '#636e72', padding: '10px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderBottom: '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  tabActive: { color: '#00ffa3', borderBottomColor: '#00ffa3' },
  badge: { background: '#ff4757', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 6, fontWeight: 700 },
  badge2: { borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 },
  content: { padding: 20, maxWidth: 1200, margin: '0 auto' },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#e2e8f0' },
  emptyState: { textAlign: 'center', padding: 60, color: '#636e72' },
  marketGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  card: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 8, padding: 14, transition: 'border-color 0.2s' },
  cardResolved: { opacity: 0.5, borderColor: '#2a1a1a' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardCity: { fontSize: 14, fontWeight: 700, color: '#e2e8f0' },
  cardStatus: { fontSize: 10, fontWeight: 600, letterSpacing: 0.5 },
  cardDate: { fontSize: 12, color: '#636e72', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 8 },
  cardInfo: { display: 'flex', gap: 8, fontSize: 11, color: '#8a9bae' },
  chartBox: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 8, padding: 16, marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#8a9bae' },
  tooltipStyle: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 6, fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #1e2a3a', color: '#636e72', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 },
  td: { padding: '8px 10px', borderBottom: '1px solid #0d1117', fontSize: 12 },
  tradeBtn: { background: '#00ffa3', color: '#0a0e17', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  warningBanner: { background: '#2a1010', border: '1px solid #ff4757', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ff4757', fontWeight: 600, fontSize: 14 },
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e2a3a' },
  settingLabel: { fontSize: 13, color: '#c8d6e5' },
  settingInput: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 4, padding: '6px 10px', color: '#c8d6e5', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, width: 100, textAlign: 'right' },
  toggleBtn: { border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  logEntry: { padding: '6px 12px', fontSize: 12, lineHeight: 1.5, marginBottom: 2 },
};
