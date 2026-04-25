
console.log("=== DATOS ===");
console.log("My address:", pg.wallet.publicKey.toString());
const balance = await pg.connection.getBalance(pg.wallet.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

const PROGRAM_ID = new web3.PublicKey("GUsWSVcmHnag3hQ2sqWDai2FFsX4H8XZv4gxFBYTWefh");
const wallet = pg.wallet;

const [cafeteriaPDA] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("cafeteria"), wallet.publicKey.toBuffer()],
  PROGRAM_ID
);

console.log("Program ID:", PROGRAM_ID.toString());
console.log("Cafeteria PDA:", cafeteriaPDA.toString());

// 1. Verificar si la cafetería existe
let cafeteria = null;
try {
  cafeteria = await pg.program.account.cafeteria.fetch(cafeteriaPDA);
  console.log("✅ Cafetería ya existe!");
} catch (e) {
  console.log("📝 Cafetería no existe. Creando una nueva...");
  
  const tx = await pg.program.methods
    .crearCafeteria("Mi Cafetería")
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  
  console.log("✅ Cafetería creada! Tx:", tx);
  cafeteria = await pg.program.account.cafeteria.fetch(cafeteriaPDA);
}

console.log(`\n📊 Pedidos existentes: ${cafeteria.pedidos.length}`);

// 2. Crear un pedido
console.log("\n=== CREAR NUEVO PEDIDO ===");
try {
  const tx = await pg.program.methods
    .crearPedido("Carlos Ruiz", "Mocha", 2)
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
    })
    .rpc();
  console.log("✅ Pedido creado! Tx:", tx);
} catch (e) {
  console.log("❌ Error:", e.message);
}

// 3. Ver todos los pedidos
console.log("\n=== VER TODOS LOS PEDIDOS ===");
try {
  await pg.program.methods
    .verPedidos()
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
    })
    .rpc();
  console.log("✅ Pedidos mostrados");
} catch (e) {
  console.log("❌ Error:", e.message);
}

// 4. Resumen final
const finalCafeteria = await pg.program.account.cafeteria.fetch(cafeteriaPDA);
console.log("\n=== 📊 RESUMEN FINAL ===");
console.log(`Total de pedidos: ${finalCafeteria.pedidos.length}`);
for (let i = 0; i < finalCafeteria.pedidos.length; i++) {
  const p = finalCafeteria.pedidos[i];
  const estado = Object.keys(p.estado)[0];
  console.log(`  ${i+1}. ID:${p.id} | ${p.cliente} | ${p.bebida} | ${p.total} SOL | ${estado}`);
}

console.log("\n✅ PROGRAMA COMPLETADO");
