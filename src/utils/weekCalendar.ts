export const startOfWeekMonday = (date: Date): Date => {
  const start = new Date(date);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const endOfWeekSunday = (weekStart: Date): Date => {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const shiftWeek = (weekStart: Date, deltaWeeks: number): Date => {
  const shifted = new Date(weekStart);
  shifted.setDate(shifted.getDate() + deltaWeeks * 7);
  shifted.setHours(0, 0, 0, 0);
  return shifted;
};

export const isSameDate = (left: Date, right: Date): boolean => {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const toDdMm = (date: Date): string => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${day}/${month}`;
};

export const formatWeekRangeLabel = (weekStart: Date): string => {
  const weekEnd = endOfWeekSunday(weekStart);
  return `${toDdMm(weekStart)} - ${toDdMm(weekEnd)}/${weekEnd.getFullYear()}`;
};
