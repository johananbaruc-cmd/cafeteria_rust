import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import type { CafeteriaLocal } from "../target/types/cafeteria_local";
// Tests para la Cafetería Local
describe("Cafetería Local", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CafeteriaLocal as anchor.Program<CafeteriaLocal>;
  
  const program = program;
  const wallet = pg.wallet;
  const PROGRAM_ID = new web3.PublicKey("H7VF6KMhcHHcm8W72KWaEZAYTG7mixYVNpHPQc8Jq2iK");
  
  const [cafeteriaPDA] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("cafeteria"), wallet.publicKey.toBuffer()],
    PROGRAM_ID
  );

  before(async () => {
    console.log("📋 Configuración de pruebas:");
    console.log("  Wallet:", wallet.publicKey.toString());
    console.log("  Program ID:", PROGRAM_ID.toString());
    console.log("  Cafeteria PDA:", cafeteriaPDA.toString());
  });

  it("1️⃣ Crear Cafetería (si no existe)", async () => {
    const accountInfo = await program.provider.connection.getAccountInfo(cafeteriaPDA);
    
    if (accountInfo === null) {
      const tx = await program.methods
        .crearCafeteria("Cafetería Test")
        .accounts({
          owner: wallet.publicKey,
          cafeteria: cafeteriaPDA,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      console.log("  ✅ Cafetería creada! Tx:", tx);
    } else {
      console.log("  ⚠️ La cafetería ya existe");
    }
  });

  it("2️⃣ Crear Pedido", async () => {
    const tx = await program.methods
      .crearPedido("Juan Pérez", "Capuchino", 2)
      .accounts({
        owner: wallet.publicKey,
        cafeteria: cafeteriaPDA,
      })
      .rpc();
    
    console.log("  ✅ Pedido creado! Tx:", tx);
    
    // Esperar confirmación de la transacción
    await program.provider.connection.confirmTransaction(tx);
    
    const cafeteria = await program.account.cafeteria.fetch(cafeteriaPDA);
    console.log("  📊 Total pedidos en cuenta:", cafeteria.contadorPedidos);
    console.log("  📊 Longitud del vector:", cafeteria.pedidos.length);
    
    // Mostrar todos los pedidos actuales
    for (let i = 0; i < cafeteria.pedidos.length; i++) {
      console.log(`  📋 Pedido ${i+1}: ID=${cafeteria.pedidos[i].id}, Cliente=${cafeteria.pedidos[i].cliente}`);
    }
  });

  it("3️⃣ Crear otro pedido", async () => {
    const before = await program.account.cafeteria.fetch(cafeteriaPDA);
    console.log("  📊 Pedidos antes:", before.pedidos.length);
    
    const tx = await program.methods
      .crearPedido("María López", "Latte", 1)
      .accounts({
        owner: wallet.publicKey,
        cafeteria: cafeteriaPDA,
      })
      .rpc();
    
    console.log("  ✅ Segundo pedido creado! Tx:", tx);
    
    await program.provider.connection.confirmTransaction(tx);
    
    const after = await program.account.cafeteria.fetch(cafeteriaPDA);
    console.log("  📊 Pedidos después:", after.pedidos.length);
  });

  it("4️⃣ Actualizar estado del pedido", async () => {
    const cafeteria = await program.account.cafeteria.fetch(cafeteriaPDA);
    
    if (cafeteria.pedidos.length > 0) {
      const pedidoId = cafeteria.pedidos[0].id;
      console.log("  📊 Actualizando pedido ID:", pedidoId);
      
      const tx = await program.methods
        .actualizarEstado(pedidoId, 1) // 1 = EnPreparacion
        .accounts({
          owner: wallet.publicKey,
          cafeteria: cafeteriaPDA,
        })
        .rpc();
      
      console.log("  ✅ Estado actualizado! Tx:", tx);
      await program.provider.connection.confirmTransaction(tx);
    } else {
      console.log("  ⚠️ No hay pedidos para actualizar");
    }
  });

  it("5️⃣ Ver todos los pedidos", async () => {
    const tx = await program.methods
      .verPedidos()
      .accounts({
        owner: wallet.publicKey,
        cafeteria: cafeteriaPDA,
      })
      .rpc();
    
    console.log("  ✅ Pedidos listados! Tx:", tx);
    await program.provider.connection.confirmTransaction(tx);
    
    const cafeteria = await program.account.cafeteria.fetch(cafeteriaPDA);
    console.log("  📊 Total en blockchain:", cafeteria.pedidos.length, "pedidos");
  });

  it("6️⃣ Ver pedidos por estado (Pendiente)", async () => {
    const tx = await program.methods
      .verPedidosPorEstado(0) // 0 = Pendiente
      .accounts({
        owner: wallet.publicKey,
        cafeteria: cafeteriaPDA,
      })
      .rpc();
    
    console.log("  ✅ Pedidos filtrados! Tx:", tx);
    await program.provider.connection.confirmTransaction(tx);
  });

  it("7️⃣ Eliminar pedido", async () => {
    const before = await program.account.cafeteria.fetch(cafeteriaPDA);
    const beforeCount = before.pedidos.length;
    
    if (beforeCount > 0) {
      const pedidoId = before.pedidos[0].id;
      console.log("  📊 Eliminando pedido ID:", pedidoId);
      
      const tx = await program.methods
        .eliminarPedido(pedidoId)
        .accounts({
          owner: wallet.publicKey,
          cafeteria: cafeteriaPDA,
        })
        .rpc();
      
      console.log("  ✅ Pedido eliminado! Tx:", tx);
      await program.provider.connection.confirmTransaction(tx);
      
      const after = await program.account.cafeteria.fetch(cafeteriaPDA);
      console.log("  📊 Pedidos antes:", beforeCount);
      console.log("  📊 Pedidos después:", after.pedidos.length);
    } else {
      console.log("  ⚠️ No hay pedidos para eliminar");
    }
  });
});