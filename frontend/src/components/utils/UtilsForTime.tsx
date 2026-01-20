export const timeToMinutes = (t?: string) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const getRelativeDates = (baseDate: Date = new Date()) => {
  const format = (d: Date) => d.toISOString().slice(0, 10);

  const today = new Date(baseDate);
  const yesterday = new Date(baseDate);
  const tomorrow = new Date(baseDate);

  yesterday.setDate(today.getDate() - 1);
  tomorrow.setDate(today.getDate() + 1);

  return [
    "Select Date",
    format(yesterday),
    format(today),
    format(tomorrow),
  ];
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

  if (minute < 5) {
    roundedMinute = 35;
    roundedHour = (hour - 1 + 24) % 24;
  } else if (minute < 35) {
    roundedMinute = 5;
  } else {
    roundedMinute = 35;
  }

  return `${roundedHour.toString().padStart(2, "0")}:${roundedMinute
    .toString()
    .padStart(2, "0")}`;
}
