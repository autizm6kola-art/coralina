// src/components/MenuPage.js
import React, { useEffect, useState } from 'react';
import { clearAllAnswers, getAllCorrectInputs } from '../utils/storage';
import BackButton from './BackButton';
import ProgressBar from './ProgressBar';
import '../styles/menuPage.css';

function MenuPage({ allTasks, onSelectTask }) {
  const [correctInputsKeys, setCorrectInputsKeys] = useState([]);
  const [totalInputs, setTotalInputs] = useState(0);

  useEffect(() => {
    const keys = getAllCorrectInputs();
    setCorrectInputsKeys(keys);

    const total = allTasks.reduce((sum, task) => {
      const blanksCount = task.units
        .flatMap(unit => unit.parts)
        .filter(part => part.type === 'blank').length;
      return sum + blanksCount;
    }, 0);

    setTotalInputs(total);
  }, [allTasks]);

  const countCorrectInTask = (task) => {
    const prefix = `coralina_input_correct_${task.id}_`;
    return correctInputsKeys.filter((key) => key.startsWith(prefix)).length;
  };

  if (!allTasks || allTasks.length === 0) {
    return <div>Загрузка меню...</div>;
  }

  return (
    <div className="menu-container">
      <BackButton />

      <h1 className="menu-title">Коралина ПРАВКИ</h1>

      <ProgressBar correct={correctInputsKeys.length} total={totalInputs} />

      <p className="menu-progress-text">
        Правильных ответов {correctInputsKeys.length} из {totalInputs}
      </p>

      <div className="range-buttons-wrapper">
        {allTasks.map((task) => {
          const totalForTask = task.units
            .flatMap(unit => unit.parts)
            .filter(part => part.type === 'blank').length;

          const correctForTask = countCorrectInTask(task);

          let buttonClass = 'range-button';
          if (correctForTask === totalForTask && totalForTask > 0) {
            buttonClass += ' completed';
          } else if (correctForTask > 0) {
            buttonClass += ' partial';
          }

          return (
            <button
              key={task.id}
              className={buttonClass}
              onClick={() => onSelectTask(task.id)}
            >
              {task.id}
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
