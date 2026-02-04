export const timeToMinutes = (t?: string) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const getRelativeDates = (
  baseDate: Date = new Date()
) => {
  const format = (d: Date) => d.toISOString().slice(0, 10);
  const dates: string[] = ["Select Date"];

  const current = new Date(baseDate);

  const dayOfWeek = (current.getDay() + 6) % 7;

  const monday = new Date(current);
  monday.setDate(current.getDate() - dayOfWeek);

  const previousSunday = new Date(monday);
  previousSunday.setDate(monday.getDate() - 1);

  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  dates.push(format(previousSunday));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(format(date));
  }

  dates.push(format(nextMonday));

  return dates;
};



export const toDateTime = (date: string, time: string) =>
  new Date(`${date}T${time}`);


export function getPeruRoundedTime(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find(p => p.type === "hour")?.value);
  const minute = Number(parts.find(p => p.type === "minute")?.value);

  let roundedHour = hour;
  let roundedMinute: number;

  roundedMinute = minute > 29 ? 35 : 5;

  return `${roundedHour.toString().padStart(2, "0")}:${roundedMinute
    .toString()
    .padStart(2, "0")}`;
}
