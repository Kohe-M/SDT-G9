import { useState } from "react";
import { searchClasses, getClassByCode, addClassToTimetable } from "../services/classService";

const DAYS = ["月", "火", "水", "木", "金"];
const PERIODS = [1, 2, 3, 4, 5];

export default function ClassSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [classCode, setClassCode] = useState("");
  const [found, setFound] = useState(null);
  const [selectedDay, setSelectedDay] = useState("月");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [message, setMessage] = useState("");

  function handleSearch(event) {
    event.preventDefault();
    setResults(searchClasses(keyword));
  }

  function handleCodeSubmit(event) {
    event.preventDefault();
    const classItem = getClassByCode(classCode.trim());
    if (!classItem) {
      setFound(null);
      setMessage("該当する授業が見つかりませんでした");
      return;
    }
    setFound(classItem);
    setMessage("");
  }

  function handleRegister() {
    if (!found) return;
    addClassToTimetable({
      code: found.code,
      name: found.name,
      room: found.room || "",
      day: selectedDay,
      period: selectedPeriod,
      syllabusUrl: found.syllabusUrl,
    });
    setMessage(`「${found.name}」を${selectedDay}曜${selectedPeriod}限に追加しました`);
    setFound(null);
    setClassCode("");
  }

  function handleQuickRegister(classItem) {
    setFound(classItem);
    setClassCode(classItem.code);
    setMessage("");
    window.scrollTo(0, 0);
  }

  return (
    <div>
      <h1>授業検索</h1>

      <section>
        <h2>授業コードで追加</h2>
        <form onSubmit={handleCodeSubmit}>
          <input
            type="text"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            placeholder="例: 53382"
          />
          <button type="submit">検索</button>
        </form>

        {found && (
          <div>
            <p>科目名: {found.name}</p>
            {found.room && <p>教室: {found.room}</p>}
            <p>
              <a href={found.syllabusUrl} target="_blank" rel="noreferrer">
                シラバスを見る
              </a>
            </p>
            <label>
              曜日:
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>
              時限:
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value))}>
                {PERIODS.map((p) => <option key={p} value={p}>{p}限</option>)}
              </select>
            </label>
            <button onClick={handleRegister}>時間割に追加</button>
          </div>
        )}

        {message && <p>{message}</p>}
      </section>

      <section>
        <h2>キーワードで検索</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="授業名・授業コード"
          />
          <button type="submit">検索</button>
        </form>

        <ul>
          {results.map((classItem) => (
            <li key={classItem.code}>
              {classItem.code} / {classItem.name}
              <a href={classItem.syllabusUrl} target="_blank" rel="noreferrer">
                　シラバス
              </a>
              <button onClick={() => handleQuickRegister(classItem)}>
                登録
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
