// src/lib/reservations.ts

export type Reservation = {
  id: string;
  guestName: string;
  startAt: string; // ISO string
  endAt: string;   // ISO string
  note?: string;
};

export const toDate = (iso: string) => new Date(iso);

/**
 * 予約の時間帯が重なっているか判定
 * end === start は「重ならない」とする
 */
export const isOverlapping = (
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean => {
  return aStart < bEnd && bStart < aEnd;
};

export const hasConflict = (
  reservations: Reservation[],
  startAt: string,
  endAt: string
): boolean => {
  const newStart = toDate(startAt);
  const newEnd = toDate(endAt);

  return reservations.some((r) => {
    const existStart = toDate(r.startAt);
    const existEnd = toDate(r.endAt);
    return isOverlapping(newStart, newEnd, existStart, existEnd);
  });
};
