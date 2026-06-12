import { useEffect, useState } from "react";
import { getMyClasses, removeClassFromTimetable } from "../services/classService";

const DAYS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5];

export default function TimetablePage() {
  const [myClasses, setMyClasses] = useState([]);

  useEffect(() => {
    setMyClasses(getMyClasses());
  }, []);

  function handleRemove(classCode) {
    removeClassFromTimetable(classCode);
    setMyClasses(getMyClasses());
  }

  function findClass(day, period) {
    return myClasses.find((c) => c.day === day && c.period === period) ?? null;
  }

  return (
    <div>
      <h1>時間割</h1>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th></th>
            {DAYS.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period}>
              <th>{period}限</th>
              {DAYS.map((day) => {
                const classItem = findClass(day, period);
                return (
                  <td key={day}>
                    {classItem ? (
                      <div>
                        <p>{classItem.name}</p>
                        <p>{classItem.teacher}</p>
                        <button onClick={() => handleRemove(classItem.code)}>
                          削除
                        </button>
                      </div>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
