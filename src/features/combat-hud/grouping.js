export function groupByHeading(entries) {
  const groups = [];
  entries.forEach((entry, index) => {
    if (entry.isHeading) {
      groups.push({ label: entry.name, items: [] });
      return;
    }
    if (groups.length === 0) {
      groups.push({ label: "", items: [] });
    }
    groups[groups.length - 1].items.push({ ...entry, index });
  });
  return groups;
}
