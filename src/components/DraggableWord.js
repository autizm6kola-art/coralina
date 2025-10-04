

import React from 'react';
import { useDrag } from 'react-dnd';
import '../styles/draggableWord.css';

function DraggableWord({ word, style }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'word',
    item: { word },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="draggable-word"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        ...style,
      }}
    >
      {word}
    </div>
  );
}

export default DraggableWord;
