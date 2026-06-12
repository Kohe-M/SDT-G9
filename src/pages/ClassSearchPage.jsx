import { useState } from "react";
import {
  searchClasses,
  getClassByCode,
  addClassToTimetable,
} from "../services/classService";

export default function ClassSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [classCode, setClassCode] = useState("");
  const [codeMessage, setCodeMessage] = useState("");

  function handleSearch(event) {
    event.preventDefault();
    setResults(searchClasses(keyword));
  }

  function handleRegister(code) {
    addClassToTimetable(code);
  }

  function handleCodeSubmit(event) {
    event.preventDefault();

    const classItem = getClassByCode(classCode.trim());
    if (!classItem) {
      setCodeMessage("該当する授業が見つかりませんでした");
      return;
    }

    addClassToTimetable(classItem.code);
    setCodeMessage(`「${classItem.name}」を時間割に追加しました`);
    setClassCode("");
  }

  return (
    <div>
      <h1>授業検索</h1>

      <section>
        <h2>キーワードで検索</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="授業名・教員名・授業コード"
          />
          <button type="submit">検索</button>
        </form>

        <ul>
          {results.map((classItem) => (
            <li key={classItem.code}>
              {classItem.code} / {classItem.name} / {classItem.day}
              {classItem.period}限 / {classItem.teacher}
              <button onClick={() => handleRegister(classItem.code)}>
                時間割に追加
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>授業コードで追加</h2>
        <form onSubmit={handleCodeSubmit}>
          <input
            type="text"
            value={classCode}
            onChange={(event) => setClassCode(event.target.value)}
            placeholder="例: IS101"
          />
          <button type="submit">追加</button>
        </form>
        {codeMessage && <p>{codeMessage}</p>}
      </section>
    </div>
  );
}
