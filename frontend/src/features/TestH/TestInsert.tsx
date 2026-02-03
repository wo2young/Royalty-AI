import { useState } from "react"
import api from "./axios"

export default function TestInsert() {
  const [file, setFile] = useState<File | null>(null)
  const [logoName, setLogoName] = useState("")
  const [applicant, setApplicant] = useState("")
  const [applicationDate, setApplicationDate] = useState("")
  const [category, setCategory] = useState("")

  const generateApplicationNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const timePart =
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0") +
      now.getMilliseconds().toString().padStart(3, "0")

    return `40-${year}-${timePart}`
  }

  const handleSubmit = async () => {
    if (!file) return alert("이미지 선택해")
    if (!logoName.trim()) return alert("로고명 입력해")
    if (!applicant.trim()) return alert("출원인 입력해")
    if (!applicationDate) return alert("출원일 선택해")
    if (!category) return alert("카테고리 선택해")

    const formData = new FormData()
    formData.append("trademark_name", logoName)
    formData.append("applicant", applicant)

    // ✅ 날짜/시간 기반 유니크 출원번호
    formData.append(
      "application_number",
      generateApplicationNumber()
    )

    formData.append("category", category)
    formData.append("application_date", applicationDate)
    formData.append("file", file)

    try {
      const res = await api.post(
        "/api/v1/test/insert/image",
        formData
      )
      console.log("SUCCESS", res.data)
      alert("등록 성공")
    } catch (e) {
      console.error(e)
      alert("등록 실패")
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          width: 420,
          padding: 24,
          borderRadius: 12,
          background: "#020617",
          color: "#e5e7eb",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          상표 등록 (텍스트 + 이미지)
        </h2>

        <input
          type="text"
          placeholder="로고명 (상표명)"
          value={logoName}
          onChange={(e) => setLogoName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="출원인"
          value={applicant}
          onChange={(e) => setApplicant(e.target.value)}
          style={inputStyle}
        />

     {/* 출원일 */}
<input
  type="date"
  value={applicationDate}
  onChange={(e) => setApplicationDate(e.target.value)}
  style={{
    ...inputStyle,
    color: "#ffffff",
    backgroundColor: "#020617",
  }}
/>

<style>
{`
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
  }
`}
</style>


        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle}
        >
          <option value="">카테고리 선택</option>
          <option value="09">09</option>
          <option value="35">35</option>
          <option value="42">42</option>
        </select>

        <label
          style={{
            display: "block",
            padding: "14px",
            border: "1px dashed #334155",
            borderRadius: 8,
            textAlign: "center",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? `선택됨: ${file.name}` : "로고 이미지 선택"}
        </label>

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #38bdf8, #6366f1)",
            color: "#020617",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          등록
        </button>

        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          출원번호는 날짜/시간 기준으로 자동 생성됩니다
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e5e7eb",
  
}
