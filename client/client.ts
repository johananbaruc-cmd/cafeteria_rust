import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { CafeteriaLocal } from "../target/types/cafeteria_local";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.CafeteriaLocal as anchor.Program<CafeteriaLocal>;

// Client - Versión completa y funcional
console.log("=== DATOS ===");
console.log("My address:", program.provider.publicKey.toString());
const balance = await program.provider.connection.getBalance(program.provider.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

const PROGRAM_ID = new web3.PublicKey("H7VF6KMhcHHcm8W72KWaEZAYTG7mixYVNpHPQc8Jq2iK");
const wallet = pg.wallet;

const [cafeteriaPDA] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("cafeteria"), wallet.publicKey.toBuffer()],
  PROGRAM_ID
);

console.log("Program ID:", PROGRAM_ID.toString());
console.log("Cafeteria PDA:", cafeteriaPDA.toString());

// Obtener estado actual
let cafeteria = await program.account.cafeteria.fetch(cafeteriaPDA);
console.log(`\n📊 Pedidos existentes: ${cafeteria.pedidos.length}`);

// 1. Crear nuevo pedido
console.log("\n=== 1. CREAR NUEVO PEDIDO ===");
try {
  const tx = await program.methods
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

// 2. Obtener el ID del último pedido
cafeteria = await program.account.cafeteria.fetch(cafeteriaPDA);
const ultimoPedido = cafeteria.pedidos[cafeteria.pedidos.length - 1];
const ultimoId = ultimoPedido.id;
console.log(`\n📊 Último pedido ID: ${ultimoId} - ${ultimoPedido.cliente} - ${ultimoPedido.bebida}`);

// 3. Actualizar estado a "EnPreparacion"
console.log("\n=== 2. ACTUALIZAR A EN PREPARACION ===");
try {
  const tx = await program.methods
    .actualizarEstado(ultimoId, 1)
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
    })
    .rpc();
  console.log(`✅ Pedido ${ultimoId} → En Preparación`);
} catch (e) {
  console.log("❌ Error:", e.message);
}

// 4. Actualizar estado a "Listo"
console.log("\n=== 3. ACTUALIZAR A LISTO ===");
try {
  const tx = await program.methods
    .actualizarEstado(ultimoId, 2)
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
    })
    .rpc();
  console.log(`✅ Pedido ${ultimoId} → Listo`);
} catch (e) {
  console.log("❌ Error:", e.message);
}

// 5. Actualizar estado a "Entregado"
console.log("\n=== 4. ACTUALIZAR A ENTREGADO ===");
try {
  const tx = await program.methods
    .actualizarEstado(ultimoId, 3)
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
    })
    .rpc();
  console.log(`✅ Pedido ${ultimoId} → Entregado`);
} catch (e) {
  console.log("❌ Error:", e.message);
}

// 6. Ver pedidos pendientes
console.log("\n=== 5. VER PEDIDOS PENDIENTES ===");
try {
  await program.methods
    .verPedidosPorEstado(0)
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
    })
    .rpc();
  console.log("✅ Pedidos pendientes mostrados");
} catch (e) {
  console.log("❌ Error:", e.message);
}

// 7. Ver todos los pedidos
console.log("\n=== 6. VER TODOS LOS PEDIDOS ===");
try {
  await program.methods
    .verPedidos()
    .accounts({
      owner: wallet.publicKey,
      cafeteria: cafeteriaPDA,
    })
    .rpc();
  console.log("✅ Todos los pedidos mostrados");
} catch (e) {
  console.log("❌ Error:", e.message);
}

// 8. Eliminar el pedido más antiguo (si hay al menos 2)
cafeteria = await program.account.cafeteria.fetch(cafeteriaPDA);
if (cafeteria.pedidos.length >= 2) {
  const pedidoEliminar = cafeteria.pedidos[0];
  console.log(`\n=== 7. ELIMINAR PEDIDO ID: ${pedidoEliminar.id} ===`);
  try {
    await program.methods
      .eliminarPedido(pedidoEliminar.id)
      .accounts({
        owner: wallet.publicKey,
        cafeteria: cafeteriaPDA,
      })
      .rpc();
    console.log(`✅ Pedido ${pedidoEliminar.id} eliminado`);
  } catch (e) {
    console.log("❌ Error:", e.message);
  }
}

// 9. Resumen final
cafeteria = await program.account.cafeteria.fetch(cafeteriaPDA);
console.log("\n=== 📊 RESUMEN FINAL ===");
console.log(`Total de pedidos: ${cafeteria.pedidos.length}`);
for (let i = 0; i < cafeteria.pedidos.length; i++) {
  const p = cafeteria.pedidos[i];
  const estado = Object.keys(p.estado)[0];
  console.log(`  ${i+1}. ID:${p.id} | ${p.cliente} | ${p.bebida} | ${p.total} SOL | ${estado}`);
}

console.log("\n✅ PROGRAMA COMPLETADO");