
// src/components/DropBlank.js
import React from 'react';
import { useDrop } from 'react-dnd';
import '../styles/dropBlank.css';

function DropBlank({ id, currentWord, onDrop, checked, correct, correctWord }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'word',
    drop: (item) => {
      const droppedWord = item.word;
      if (droppedWord === correctWord) {
        onDrop(id, droppedWord);
      } else {
        // Ошибка: shake-анимация
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 500);
        }
      }
    },
    canDrop: (item) => {
      return item.word === correctWord;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [correctWord, id, onDrop]);

  const borderColor = isOver && canDrop ? '#003cffff' : isOver && !canDrop ? '#003cffff' : '#ccc';

  return (
    <span
      id={id}
      ref={drop}
      className={`drop-blank ${checked ? (correct ? 'correct' : 'incorrect') : ''}`}
      style={{ borderColor }}
    >
      {currentWord || '____'}
    </span>
  );
}

export default DropBlank;

