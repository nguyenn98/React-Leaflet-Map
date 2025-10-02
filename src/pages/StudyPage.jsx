import React, { useState } from "react";
// import scores from "../data/scores.json";

const StudyPage = () => {
    const [selectedUni, setSelectedUni] = useState(null);

    return (
        <div style={{ padding: "20px" }}>
            {/* <h2>📘 Thông tin điểm chuẩn các trường đại học</h2>

            <ul style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "20px" }}>
                {scores.map((uni, idx) => (
                    <li
                        key={idx}
                        style={{
                            cursor: "pointer",
                            padding: "10px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            background: selectedUni?.name === uni.name ? "#f0f8ff" : "#fff"
                        }}
                        onClick={() => setSelectedUni(uni)}
                    >
                        {uni.name}
                    </li>
                ))}
            </ul>

            {selectedUni && (
                <div style={{ marginTop: "30px" }}>
                    <h3>{selectedUni.name}</h3>
                    <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
                        <thead>
                            <tr>
                                <th>Ngành</th>
                                <th>2022</th>
                                <th>2023</th>
                                <th>2024</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedUni.majors.map((m, i) => (
                                <tr key={i}>
                                    <td>{m.major}</td>
                                    <td>{m["2022"]}</td>
                                    <td>{m["2023"]}</td>
                                    <td>{m["2024"]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )} */}
        </div>
    );
};

export default StudyPage;
