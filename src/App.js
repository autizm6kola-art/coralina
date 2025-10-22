

// import React, { useEffect, useState } from 'react';
// import MenuPage from './components/MenuPage';
// import TasksPage from './components/TasksPage';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

// function App() {
//   const [allTasks, setAllTasks] = useState([]);
//   const [selectedTaskId, setSelectedTaskId] = useState(null);

//   useEffect(() => {
//   fetch(process.env.PUBLIC_URL + '/tasks_shrek.json')
//     .then((response) => response.json())
//     .then((data) => {
//       // проверка, если data.pages есть
//       if (Array.isArray(data.pages)) {
//         setAllTasks(data.pages);
//       } else {
//         console.error('Неверная структура JSON: не найдено "pages"');
//       }
//     })
//     .catch((error) => console.error('Ошибка загрузки заданий:', error));
// }, []);


//   const handleSelectTask = (taskId) => {
//     setSelectedTaskId(taskId);
//   };

//   const handleGoBack = () => {
//     setSelectedTaskId(null);
//   };

//   if (allTasks.length === 0) {
//     return <div>Загрузка заданий...</div>;
//   }

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div>
//         {selectedTaskId === null ? (
//           <MenuPage allTasks={allTasks} onSelectTask={handleSelectTask} />
//         ) : (
//           <TasksPage
//             tasks={allTasks.filter((task) => task.id === selectedTaskId)}
//             goBack={handleGoBack}
//           />
//         )}
//       </div>
//     </DndProvider>
//   );
// }

// export default App;


// src/App.js
import React, { useEffect, useState } from 'react';
import MenuPage from './components/MenuPage';
import TasksPage from './components/TasksPage';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/tasks_shrek.json')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.pages)) {
          setAllTasks(data.pages);
        } else {
          console.error('Неверная структура JSON: не найдено "pages"');
        }
      })
      .catch((error) => console.error('Ошибка загрузки заданий:', error));
  }, []);

  const handleSelectRange = (taskIds) => {
    setSelectedTaskIds(taskIds);
  };

  const handleGoBack = () => {
    setSelectedTaskIds(null);
  };

  if (allTasks.length === 0) {
    return <div>Загрузка заданий...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {selectedTaskIds === null ? (
          <MenuPage allTasks={allTasks} onSelectRange={handleSelectRange} />
        ) : (
          <TasksPage
            tasks={allTasks.filter((task) => selectedTaskIds.includes(task.id))}
            goBack={handleGoBack}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;
