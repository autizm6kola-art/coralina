// src/components/TasksPage.js
import React, { useEffect, useState } from 'react';
import BackButton from './BackButton';
import ProgressBar from './ProgressBar';
import Task from './Task';
import {
  clearAnswersByIds,
  getAllCorrectInputs,
} from '../utils/storage';
import '../styles/tasksPage.css';

function TasksPage({ tasks, goBack }) {
  const [correctInputs, setCorrectInputs] = useState([]);
  const [totalInputs, setTotalInputs] = useState(0);

  const updateCorrectInputs = () => {
    const allCorrect = getAllCorrectInputs();
    setCorrectInputs(allCorrect);
  };

  useEffect(() => {
    updateCorrectInputs();

    const total = tasks.reduce((acc, task) => {
      const blanksCount = task.units
        .flatMap(unit => unit.parts)
        .filter(part => part.type === 'blank').length;
      return acc + blanksCount;
    }, 0);

    setTotalInputs(total);
  }, [tasks]);

  const handleReset = () => {
    tasks.forEach((task) => {
      clearAnswersByIds([task.id]);

      const blanksCount = task.units
        .flatMap(unit => unit.parts)
        .filter(part => part.type === 'blank').length;

      for (let i = 0; i < blanksCount; i++) {
        localStorage.removeItem(`coralina_input_correct_${task.id}_${i}`);
      }
    });

    setCorrectInputs([]);
    window.location.reload();
  };

  if (!tasks || tasks.length === 0) {
    return <div>Нет вопросов</div>;
  }

  const taskIds = tasks.map((t) => t.id);
  const start = Math.min(...taskIds);

  return (
    <div className="task-container">
      <BackButton />

      <button onClick={goBack} className="back-link task-back-button">
        ← Назад к выбору
      </button>

      {/* <h1 className="task-heading">Страница {start}</h1> */}


      <div className="task-grid">
        {tasks.map((task) => (
          <div className="task-item" key={task.id}>
            <Task task={task} onCheck={updateCorrectInputs} />
          </div>
        ))}
      </div>

      <div className="reset-button-contaner">
        <button onClick={handleReset} className="reset-button">
          Сбросить ответы на этой странице
        </button>
      </div>
    </div>
  );
}

export default TasksPage;
