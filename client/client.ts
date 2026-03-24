import { PublicKey } from "@solana/web3.js";

////////////////// Constantes ////////////////////
const NOMBRE_SISTEMA = "SmartHomeSystem";
const owner = pg.wallet.publicKey;

//////////////////// Logs base ////////////////////
console.log("Mi dirección:", owner.toBase58());
const balance = await pg.connection.getBalance(owner);
console.log(`Mi balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

//////////////////// PDA Sistema ////////////////////
// En Rust: seeds = [b"sistema", owner.key().as_ref()]
function pdaSistema(ownerPk: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("sistema"), ownerPk.toBuffer()],
    pg.PROGRAM_ID
  );
}

//////////////////// Helpers ////////////////////
async function fetchSistema(pda_sistema: PublicKey) {
  return await pg.program.account.sistema.fetch(pda_sistema);
}

function printLecturas(sistemaAccount: any) {
  const lecturas = sistemaAccount.readings as any[];

  if (!lecturas || lecturas.length === 0) {
    console.log("No hay lecturas registradas");
    return;
  }

  console.log(`Lecturas (${lecturas.length}):`);
  for (let i = 0; i < lecturas.length; i++) {
    const l = lecturas[i];
    console.log(
      `#${i + 1} -> Temp=${l.temperature}°C, Hum=${l.humidity}%, Nivel=${l.waterLevel}%, Flujo=${l.waterFlow} L/min, Nota="${l.note}", Timestamp=${new Date(l.timestamp * 1000).toLocaleString()}`
    );
  }
}

//////////////////// Instrucciones ////////////////////

async function crearSistema(nombreSistema: string) {
  const [pda_sistema] = pdaSistema(owner);

  try {
    const existing = await fetchSistema(pda_sistema);
    console.log("Sistema ya existe en:", pda_sistema.toBase58());
    console.log("Owner guardado:", existing.owner.toBase58());
    console.log("Nombre guardado:", existing.nombre);
    return;
  } catch (_) {}

  const txHash = await pg.program.methods
    .crearSistema(nombreSistema)
    .accounts({
      owner: owner,
      sistema: pda_sistema,
    })
    .rpc();

  console.log("crearSistema tx:", txHash);
  console.log("Sistema PDA:", pda_sistema.toBase58());

  const sistemaAccount = await fetchSistema(pda_sistema);
  console.log("Estado inicial:");
  console.log("Owner:", sistemaAccount.owner.toBase58());
  console.log("Nombre guardado:", sistemaAccount.nombre);
  printLecturas(sistemaAccount);
}

async function agregarLectura(temp: number, hum: number, nivel: number, flujo: number, nota: string) {
  const [pda_sistema] = pdaSistema(owner);

  const txHash = await pg.program.methods
    .agregarLectura(temp, hum, nivel, flujo, nota)
    .accounts({
      sistema: pda_sistema,
    })
    .rpc();

  console.log("agregarLectura tx:", txHash);

  const sistemaAccount = await fetchSistema(pda_sistema);
  printLecturas(sistemaAccount);
}

async function actualizarConfig(humUmbral: number, tempMax: number, luzAuto: boolean) {
  const [pda_sistema] = pdaSistema(owner);

  const txHash = await pg.program.methods
    .actualizarConfig(humUmbral, tempMax, luzAuto)
    .accounts({
      sistema: pda_sistema,
    })
    .rpc();

  console.log("actualizarConfig tx:", txHash);

  const sistemaAccount = await fetchSistema(pda_sistema);
  console.log("Nueva configuración:", sistemaAccount.config);
}

async function controlManual(irrigation: boolean, ventilation: boolean, lights: boolean) {
  const [pda_sistema] = pdaSistema(owner);

  const txHash = await pg.program.methods
    .controlManual(irrigation, ventilation, lights)
    .accounts({
      sistema: pda_sistema,
    })
    .rpc();

  console.log("controlManual tx:", txHash);

  const sistemaAccount = await fetchSistema(pda_sistema);
  console.log("Estados actuales:");
  console.log("Riego activo:", sistemaAccount.irrigationActive);
  console.log("Ventilación activa:", sistemaAccount.ventilationActive);
  console.log("Luces encendidas:", sistemaAccount.lightsOn);
}

//////////////////// Demo runner ////////////////////

await crearSistema(NOMBRE_SISTEMA);

// Ejemplo de uso:
// await agregarLectura(25.5, 40.0, 70.0, 10.2, "Lectura manual");
// await actualizarConfig(45.0, 28.0, true);
// await controlManual(true, false, true);
