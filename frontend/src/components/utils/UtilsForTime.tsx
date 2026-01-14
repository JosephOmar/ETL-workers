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
