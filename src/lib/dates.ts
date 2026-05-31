export function parseDateTime(date: string, time = "00:00") {
  const [dayPart, monthPart, yearPart] = date.includes("/")
    ? date.split("/")
    : date.split("-").reverse();
  const [hourPart = "0", minutePart = "0"] = time.split(":");

  return new Date(
    Number(yearPart),
    Number(monthPart) - 1,
    Number(dayPart),
    Number(hourPart),
    Number(minutePart),
  );
}

export function formatDisplayDate(date: string) {
  const parsed = parseDateTime(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}
