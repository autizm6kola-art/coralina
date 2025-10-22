// src/components/MenuPage.js
import React, { useEffect, useState } from 'react';
import { clearAllAnswers, getAllCorrectInputs } from '../utils/storage';
import BackButton from './BackButton';
import ProgressBar from './ProgressBar';
import { generateRanges } from '../utils/generateRanges';
import '../styles/menuPage.css';

// 🔧 НАСТРОЙКА: сколько заданий в одном диапазоне
const RANGE_SIZE = 2;

function MenuPage({ allTasks, onSelectRange }) {
  const [correctInputsKeys, setCorrectInputsKeys] = useState([]);
  const [totalInputs, setTotalInputs] = useState(0);

  useEffect(() => {
    const keys = getAllCorrectInputs();
    setCorrectInputsKeys(keys);

    const total = allTasks.reduce((sum, task) => {
      const blanksCount = task.units
        .flatMap((unit) => unit.parts)
        .filter((part) => part.type === 'blank').length;
      return sum + blanksCount;
    }, 0);

    setTotalInputs(total);
  }, [allTasks]);

  const ranges = generateRanges(allTasks, RANGE_SIZE); // ← используем настройку

  return (
    <div className="menu-container">
      <BackButton />

      <h1 className="menu-title">Коралина</h1>

      <ProgressBar correct={correctInputsKeys.length} total={totalInputs} />

      <p className="menu-progress-text">
        Правильных ответов {correctInputsKeys.length} из {totalInputs}
      </p>

      <div className="range-buttons-wrapper">
        {ranges.map((range, i) => {
          const totalForRange = range.taskIds.reduce((sum, id) => {
            const task = allTasks.find((t) => t.id === id);
            if (!task) return sum;
            const blanks = task.units
              .flatMap((unit) => unit.parts)
              .filter((part) => part.type === 'blank').length;
            return sum + blanks;
          }, 0);

          const correctForRange = range.taskIds.reduce((sum, id) => {
            const prefix = `coralina_input_correct_${id}_`;
            return (
              sum + correctInputsKeys.filter((key) => key.startsWith(prefix)).length
            );
          }, 0);

          let buttonClass = 'range-button';
          if (correctForRange === totalForRange && totalForRange > 0) {
            buttonClass += ' completed';
          } else if (correctForRange > 0) {
            buttonClass += ' partial';
          }

          return (
            <button
              key={i}
              className={buttonClass}
              onClick={() => onSelectRange(range.taskIds)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="reset-button-contaner">
        <button
          className="reset-button"
          onClick={() => {
            clearAllAnswers();
            window.location.reload();
          }}
        >
          Сбросить все ответы
        </button>
      </div>
    </div>
  );
}

export default MenuPage;
