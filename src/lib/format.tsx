export function fmtRp(n: number) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

export function timeAgo(d: number) {
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60) return s + " detik lalu";
  if (s < 3600) return Math.floor(s / 60) + " menit lalu";
  if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
  return Math.floor(s / 86400) + " hari lalu";
}

export function StarsStatic({ n }: { n: number }) {
  return (
    <span className="rating-static">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className={`fas fa-star${i + 1 <= n ? "" : " empty"}`} />
      ))}
    </span>
  );
}
