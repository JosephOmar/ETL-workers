export const timeToMinutes = (t?: string) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const getRelativeDates = (
  baseDate: Date = new Date(),
  daysBefore: number = 5,
  daysAfter: number = 1
) => {
  const format = (d: Date) => d.toISOString().slice(0, 10);
  const dates: string[] = ["Select Date"];

  for (let i = -daysBefore; i <= daysAfter; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    dates.push(format(date));
  }

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
