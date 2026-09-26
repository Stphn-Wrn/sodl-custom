function pad(value) {
  return String(value).padStart(2, "0");
}

export function formatTime(seconds) {
  let total = Math.floor(Number(seconds));
  if (!Number.isFinite(total) || total < 0) {
    total = 0;
  }
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${minutes}:${pad(secs)}`;
}
