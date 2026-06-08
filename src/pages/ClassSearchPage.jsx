import { syllabusData } from "../data/syllabus";

export default function ClassSearchPage() {
  return (
    <div>
      <h1>授業検索画面</h1>
      <p>C担当がここに授業検索・授業登録機能を実装します。</p>
      <ul>
        {syllabusData.map((course) => (
          <li key={course.code}>
            {course.code}: {course.name} ({course.day}{course.period}限)
          </li>
        ))}
      </ul>
    </div>
  );
}
