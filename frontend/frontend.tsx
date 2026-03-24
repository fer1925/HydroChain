import { useState } from "react";

export default function Home() {
  const [lecturas, setLecturas] = useState<any[]>([]);
  const [estado, setEstado] = useState({
    irrigationActive: false,
    ventilationActive: false,
    lightsOn: false,
  });

  // Crear sistema (simulado)
  function crearSistema() {
    setEstado({
      irrigationActive: false,
      ventilationActive: false,
      lightsOn: false,
    });
    alert("Sistema creado en la blockchain (simulado)");
  }

  // Agregar lectura (simulado)
  function agregarLectura() {
    const nuevaLectura = {
      temperature: 25.5,
      humidity: 40,
      note: "Lectura desde frontend",
    };
    setLecturas([...lecturas, nuevaLectura]);

    // lógica automática simulada
    setEstado({
      irrigationActive: nuevaLectura.humidity < 45,
      ventilationActive: nuevaLectura.temperature > 28,
      lightsOn: true,
    });
  }

  // Control manual (simulado)
  function controlManual() {
    setEstado({
      irrigationActive: true,
      ventilationActive: false,
      lightsOn: true,
    });
  }

  // 🎨 Estilos básicos
  const buttonStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    margin: "5px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const panelStyle = {
    backgroundColor: "#f4f4f4",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#333" }}>🌱 Smart Home System</h1>
      <div>
        <button style={buttonStyle} onClick={crearSistema}>Crear Sistema</button>
        <button style={{ ...buttonStyle, backgroundColor: "#2196F3" }} onClick={agregarLectura}>Agregar Lectura</button>
        <button style={{ ...buttonStyle, backgroundColor: "#FF9800" }} onClick={controlManual}>Control Manual</button>
      </div>

      <div style={panelStyle}>
        <h2>Estado actual</h2>
        <p>Riego activo: {estado.irrigationActive ? "✅ Sí" : "❌ No"}</p>
        <p>Ventilación activa: {estado.ventilationActive ? "✅ Sí" : "❌ No"}</p>
        <p>Luces encendidas: {estado.lightsOn ? "💡 Sí" : "❌ No"}</p>
      </div>

      {lecturas.length > 0 && (
        <div style={panelStyle}>
          <h2>Lecturas</h2>
          {lecturas.map((l, i) => (
            <p key={i}>
              #{i + 1} 🌡️ Temp={l.temperature}°C, 💧 Hum={l.humidity}%, Nota={l.note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
