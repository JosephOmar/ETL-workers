export const generateHalfHourSlots = (): string[] => {
  const slots: string[] = [];

  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      slots.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }

  return slots;
};