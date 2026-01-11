"use client";

import { useMemo, useState } from "react";
import { hasConflict, type Reservation } from "@/lib/reservations";


const uuid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toISO = (localDateTime: string) => new Date(localDateTime).toISOString();

const format = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [guestName, setGuestName] = useState("");
  const [startAt, setStartAt] = useState(""); // datetime-local
  const [endAt, setEndAt] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>("");

  const sorted = useMemo(() => {
    return [...reservations].sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [reservations]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = guestName.trim();
    if (!name) return setError("予約者名を入力してください。");
    if (!startAt || !endAt) return setError("開始と終了の日時を入力してください。");

    const startISO = toISO(startAt);
    const endISO = toISO(endAt);

    if (new Date(startISO) >= new Date(endISO)) {
      return setError("日時の範囲外です。開始 < 終了にしてください。");
    }

    if (hasConflict(reservations, startISO, endISO)) {
      return setError("その時間帯はすでに予約が入ってる（重複）ので登録できません。");
    }

    const newItem: Reservation = {
      id: uuid(),
      guestName: name,
      startAt: startISO,
      endAt: endISO,
      note: note.trim() ? note.trim() : undefined,
    };

    setReservations((prev) => [newItem, ...prev]);

    // reset
    setGuestName("");
    setStartAt("");
    setEndAt("");
    setNote("");
  };

  const onDelete = (id: string) => setReservations((prev) => prev.filter((r) => r.id !== id));

  return (
    <main className="mx-auto max-w-3xl p-6 font-sans">
      <h1 className="text-2xl font-bold">予約システム（MVP）</h1>
      <p className="mt-1 text-sm text-gray-600">
        追加・一覧・削除・重複チェックまで。永続化は次に入れる。
      </p>

      <section className="mt-6 rounded-xl border p-4">
        <h2 className="text_toggle text-lg font-semibold">新規予約</h2>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">予約者名</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="例）山田 花子"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm">開始</span>
              <input
                className="rounded-lg border px-3 py-2"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm">終了</span>
              <input
                className="rounded-lg border px-3 py-2"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-sm">メモ（任意）</span>
            <textarea
              className="min-h-20 rounded-lg border px-3 py-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="要望など"
            />
          </label>

          {error ? <div className="rounded-lg border border-pink-400 p-2 text-sm">{error}</div> : null}

          <button className="w-40 rounded-lg bg-black px-4 py-2 font-semibold text-white" type="submit">
            予約を追加
          </button>
        </form>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">予約一覧</h2>

        {sorted.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">予約なし。</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {sorted.map((r) => (
              <li key={r.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{r.guestName}</div>
                    <div className="mt-1 text-sm text-gray-700">
                      {format(r.startAt)} 〜 {format(r.endAt)}
                    </div>
                    {r.note ? <div className="mt-2 text-sm">{r.note}</div> : null}
                  </div>

                  <button
                    className="rounded-lg border px-3 py-2 text-sm"
                    onClick={() => onDelete(r.id)}
                    type="button"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
