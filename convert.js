const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'input.txt');
const outputPath = path.join(__dirname, 'output.json');

const rawText = fs.readFileSync(inputPath, 'utf-8');

// Разбиваем на страницы по "--- PAGE START ---"
const pageSections = rawText
  .split('--- PAGE START ---')
  .map(section => section.trim())
  .filter(Boolean);

const pages = [];

pageSections.forEach((sectionText, pageIndex) => {
  const lines = sectionText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('--- PAGE END ---'));

  const titleLine = lines.find(line => line.startsWith('#TITLE:'));
  const pageNumber = titleLine
    ? parseInt(titleLine.replace('#TITLE:', '').trim(), 10)
    : pageIndex + 1;

  // Удалим все служебные строки
  const contentLines = lines.filter(
    line => !line.startsWith('#') && !line.startsWith('---')
  );

  const units = [];
  const wordBank = new Set();

  contentLines.forEach((line, unitIndex) => {
    const parts = [];
    const regex = /\{\{(.*?)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const [fullMatch, word] = match;
      const start = match.index;
      const end = regex.lastIndex;

      if (start > lastIndex) {
        parts.push({
          type: 'text',
          content: line.slice(lastIndex, start),
        });
      }

      const blankId = `blank-${pageNumber}-${unitIndex}-${parts.length}`;

      parts.push({
        type: 'blank',
        id: blankId,
        correct: word.trim(),
      });

      wordBank.add(word.trim());
      lastIndex = end;
    }

    if (lastIndex < line.length) {
      parts.push({
        type: 'text',
        content: line.slice(lastIndex),
      });
    }

    units.push({
      id: `unit-${pageNumber}-${unitIndex + 1}`,
      parts,
    });
  });

  pages.push({
    id: pageNumber, // <<< добавлено для соответствия ожиданиям React-приложения
    page: pageNumber,
    type: 'drag',    // <<< можно указать тип задания, если будет нужно
    units,
    wordBank: Array.from(wordBank),
  });
});

fs.writeFileSync(outputPath, JSON.stringify({ pages }, null, 2), 'utf-8');

console.log(`✅ JSON успешно сохранён в ${outputPath}`);
