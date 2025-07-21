export function parseTimeString(time: string): [number, number, number] {
  // Match 12-hour format with optional seconds and AM/PM
  const twelveHourMatch = time.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)$/i,
  );
  if (twelveHourMatch) {
    let [_, hour, minute, second = '0', meridian] = twelveHourMatch;
    let h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const s = parseInt(second, 10);

    if (meridian.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (meridian.toUpperCase() === 'AM' && h === 12) h = 0;

    return [h, m, s];
  }

  // Match 24-hour format with optional seconds
  const twentyFourHourMatch = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    const [_, hour, minute, second = '0'] = twentyFourHourMatch;
    return [parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10)];
  }

  throw new Error('Invalid time format');
}
