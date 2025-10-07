

// export default Task;
import React, { useState, useEffect } from 'react';
import DropBlank from './DropBlank';
import DraggableWord from './DraggableWord';
import '../styles/taskItem.css';
import { clearAnswersByIds, saveUserInputs, getUserInputs, saveCorrectInput } from '../utils/storage';

function Task({ task, onCheck }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [completed, setCompleted] = useState(false); // новый флаг

  const taskKey = `drag-task-${task?.id}`;
  const completedKey = `task_completed_${task?.id}`;

  useEffect(() => {
    if (!task || !task.id || !Array.isArray(task.wordBank)) return;

    // Проверяем, завершено ли задание
    const isCompleted = localStorage.getItem(completedKey) === 'true';
    setCompleted(isCompleted);

    if (isCompleted) {
      // Если выполнено — можно не грузить ответы (или грузим для истории)
      const restoredInputs = getUserInputs(task.id);
      if (restoredInputs) setAnswers(restoredInputs);

      // Можно не трогать банк слов — т.к. он не нужен
      setShuffledWords(shuffleArray(task.wordBank));
      setChecked(true);
      return;
    }

    // Если не выполнено — грузим ответы и слова как обычно
    const saved = loadFromStorage(task.id);
    const restoredInputs = getUserInputs(task.id);

    if (saved && saved.answers) setAnswers(saved.answers);
    else if (restoredInputs) setAnswers(restoredInputs);

    if (saved && Array.isArray(saved.shuffledWords) && saved.shuffledWords.length > 0) {
      setShuffledWords(saved.shuffledWords);
    } else {
      setShuffledWords(shuffleArray(task.wordBank));
    }

    setChecked(false);
  }, [task]);

  useEffect(() => {
    if (!task || !task.id) return;

    // При изменениях в ответах или словах — сохраняем в localStorage
    saveToStorage(task.id, { answers, shuffledWords });
    saveUserInputs(task.id, answers);
  }, [answers, shuffledWords, task]);

  const handleDrop = (blankId, word) => {
    if (completed) return; // блокируем изменения если завершено

    const newAnswers = { ...answers, [blankId]: word };
    setAnswers(newAnswers);
    saveUserInputs(task.id, newAnswers);
    setChecked(false);
    if (typeof onCheck === 'function') onCheck();
  };

  const handleCheck = () => {
    // Проверяем все blank-ы
    const blanks = task.units.flatMap(unit => unit.parts).filter(part => part.type === 'blank');

    let allCorrect = true;
    blanks.forEach((part, index) => {
      const userAnswer = answers[part.id];
      if (userAnswer === part.correct) {
        saveCorrectInput(task.id, index);
      } else {
        allCorrect = false;
      }
    });

    setChecked(true);

    if (allCorrect) {
      setCompleted(true);
      localStorage.setItem(completedKey, 'true');
    }

    if (typeof onCheck === 'function') onCheck();
  };

  const handleReset = () => {
    setAnswers({});
    setChecked(false);
    setCompleted(false);
    if (typeof onCheck === 'function') onCheck();
    localStorage.removeItem(taskKey);
    clearAnswersByIds([task.id]);
    localStorage.removeItem(completedKey);

    setShuffledWords(shuffleArray(task.wordBank));
  };

  const isBlankCorrect = (blankId) => {
    const userWord = answers[blankId];
    const blankPart = task.units.flatMap(unit => unit.parts).find(p => p.id === blankId);
    if (!blankPart) return false;
    return userWord === blankPart.correct;
  };

  const isWordUsed = (word) => {
    return Object.entries(answers).some(([blankId, ansWord]) => {
      if (ansWord !== word) return false;
      const blankPart = task.units.flatMap(unit => unit.parts).find(p => p.id === blankId);
      return blankPart && blankPart.correct === word;
    });
  };

  // --- Если задание пройдено, показываем просто текст ---
  if (completed) {
    // Собираем текст из units (текст + вставленные правильные слова)
    const fullText = task.units.map(unit => 
      unit.parts.map(part => {
        if (part.type === 'text') return part.content;
        if (part.type === 'blank') return part.correct;
        return '';
      }).join('')
    ).join(' ');

    return (
      <div className="task-item">
        <div className="completed-text" style={{ fontSize: '1.2em', lineHeight: '1.5em', fontFamily: 'arial' }}>
          {fullText}
        </div>
        <div className="button-group">
          <button onClick={handleReset}>Сбросить</button>
        </div>
      </div>
    );
  }

  // --- Иначе показываем обычный интерактив ---
  return (
    <div className="task-item">
      <div className="word-bank">
        <div className="word-list">
          {shuffledWords.map((word, i) => {
            const used = isWordUsed(word);
            return (
              <DraggableWord
                key={i}
                word={word}
                style={{
                  visibility: used ? 'hidden' : 'visible',
                  pointerEvents: used ? 'none' : 'auto',
                  opacity: used ? 0.3 : 1,
                }}
              />
            );
          })}
        </div>
      </div>

      <hr />

      <div className="text-block">
        {task.units.map((unit) => (
          <div className="sentence" key={unit.id}>
            {unit.parts.map((part, idx) => {
              if (part.type === 'text') {
                return <span key={idx}>{part.content}</span>;
              } else if (part.type === 'blank') {
                const currentWord = answers[part.id];
                const correct = isBlankCorrect(part.id);
                return (
                  <DropBlank
                    key={part.id}
                    id={part.id}
                    currentWord={currentWord}
                    onDrop={handleDrop}
                    checked={checked}
                    correct={correct}
                    correctWord={part.correct}
                  />
                );
              } else {
                return null;
              }
            })}
          </div>
        ))}
      </div>
      <hr />

      <div className="word-bank">
        <div className="word-list">
          {shuffledWords.map((word, i) => {
            const used = isWordUsed(word);
            return (
              <DraggableWord
                key={i}
                word={word}
                style={{
                  visibility: used ? 'hidden' : 'visible',
                  pointerEvents: used ? 'none' : 'auto',
                  opacity: used ? 0.3 : 1,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleCheck}>Проверить</button>
        <button onClick={handleReset}>Сбросить</button>
      </div>
    </div>
  );
}

// --- Остальные функции (shuffleArray, loadFromStorage, saveToStorage) оставляем без изменений ---

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function loadFromStorage(taskId) {
  try {
    const raw = localStorage.getItem(`drag-task-${taskId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Ошибка при чтении из localStorage:', err);
    return null;
  }
}

function saveToStorage(taskId, data) {
  try {
    localStorage.setItem(`drag-task-${taskId}`, JSON.stringify(data));
  } catch (err) {
    console.error('Ошибка при сохранении в localStorage:', err);
  }
}

export default Task;

