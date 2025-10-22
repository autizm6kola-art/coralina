export function generateRanges(tasks, rangeSize = 10) {
  const sorted = [...tasks].sort((a, b) => Number(a.id) - Number(b.id));
  const ranges = [];

  for (let i = 0; i < sorted.length; i += rangeSize) {
    const chunk = sorted.slice(i, i + rangeSize);
    if (chunk.length > 0) {
      ranges.push({
        index: ranges.length, // порядковый номер
        taskIds: chunk.map((t) => t.id),
      });
    }
  }

  return ranges;
}
