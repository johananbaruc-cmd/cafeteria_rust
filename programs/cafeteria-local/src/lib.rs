use anchor_lang::prelude::*;


declare_id!("H7VF6KMhcHHcm8W72KWaEZAYTG7mixYVNpHPQc8Jq2iK");

#[program]
pub mod cafeteria_local {
    use super::*;

    pub fn crear_cafeteria(ctx: Context<CrearCafeteria>, nombre: String) -> Result<()> {
        let cafeteria = &mut ctx.accounts.cafeteria;
        cafeteria.owner = ctx.accounts.owner.key();
        cafeteria.nombre = nombre.clone();
        cafeteria.contador_pedidos = 0;
        cafeteria.pedidos = Vec::new();
        
        msg!("¡Cafetería {} creada!", nombre);
        Ok(())
    }

    pub fn crear_pedido(ctx: Context<GestionPedido>, 
                        cliente: String, 
                        bebida: String, 
                        cantidad: u32) -> Result<()> {
        
        let cafeteria = &mut ctx.accounts.cafeteria;
        
        require!(es_bebida_valida(&bebida), ErrorCafeteria::BebidaNoExiste);
        
        let precio_unitario = get_precio_bebida(&bebida);
        let total = precio_unitario * cantidad as u64;
        
        cafeteria.contador_pedidos += 1;
        let pedido_id = cafeteria.contador_pedidos;
        let cliente_clone = cliente.clone();
        
        let nuevo_pedido = Pedido {
            id: pedido_id,
            cliente,
            bebida,
            cantidad,
            total,
            estado: EstadoPedido::Pendiente,
            fecha: Clock::get()?.unix_timestamp,
        };
        
        cafeteria.pedidos.push(nuevo_pedido);
        
        msg!("Pedido #{} creado para {} - Total: {} SOL", 
             pedido_id, cliente_clone, total);
        Ok(())
    }

    pub fn actualizar_estado(ctx: Context<GestionPedido>, 
                              id: u32, 
                              nuevo_estado: u8) -> Result<()> {
        
        let cafeteria = &mut ctx.accounts.cafeteria;
        
        for pedido in cafeteria.pedidos.iter_mut() {
            if pedido.id == id {
                let estado = match nuevo_estado {
                    0 => EstadoPedido::Pendiente,
                    1 => EstadoPedido::EnPreparacion,
                    2 => EstadoPedido::Listo,
                    3 => EstadoPedido::Entregado,
                    _ => return Err(ErrorCafeteria::EstadoInvalido.into()),
                };
                
                let estado_clone = estado.clone();
                pedido.estado = estado;
                msg!("Pedido #{} actualizado a estado: {:?}", id, estado_clone);
                return Ok(());
            }
        }
        
        Err(ErrorCafeteria::PedidoNoExiste.into())
    }

    pub fn eliminar_pedido(ctx: Context<GestionPedido>, id: u32) -> Result<()> {
        let cafeteria = &mut ctx.accounts.cafeteria;
        let initial_len = cafeteria.pedidos.len();
        
        cafeteria.pedidos.retain(|p| p.id != id);
        
        if cafeteria.pedidos.len() == initial_len {
            return Err(ErrorCafeteria::PedidoNoExiste.into());
        }
        
        msg!("Pedido #{} eliminado", id);
        Ok(())
    }

    pub fn ver_pedidos(ctx: Context<GestionPedido>) -> Result<()> {
        let cafeteria = &ctx.accounts.cafeteria;
        
        msg!("=== PEDIDOS DE {} ===", cafeteria.nombre);
        msg!("Total de pedidos: {}", cafeteria.pedidos.len());
        
        if cafeteria.pedidos.is_empty() {
            msg!("No hay pedidos registrados");
            return Ok(());
        }
        
        for pedido in &cafeteria.pedidos {
            msg!("─────────────────────");
            msg!("ID: {}", pedido.id);
            msg!("Cliente: {}", pedido.cliente);
            msg!("Bebida: {} (x{})", pedido.bebida, pedido.cantidad);
            msg!("Total: {} SOL", pedido.total);
            let estado_str = match pedido.estado {
                EstadoPedido::Pendiente => "Pendiente",
                EstadoPedido::EnPreparacion => "En preparación",
                EstadoPedido::Listo => "Listo",
                EstadoPedido::Entregado => "Entregado",
            };
            msg!("Estado: {}", estado_str);
            msg!("Fecha: {}", pedido.fecha);
        }
        
        Ok(())
    }

    pub fn ver_pedidos_por_estado(ctx: Context<GestionPedido>, estado: u8) -> Result<()> {
        let cafeteria = &ctx.accounts.cafeteria;
        
        let estado_buscar = match estado {
            0 => EstadoPedido::Pendiente,
            1 => EstadoPedido::EnPreparacion,
            2 => EstadoPedido::Listo,
            3 => EstadoPedido::Entregado,
            _ => return Err(ErrorCafeteria::EstadoInvalido.into()),
        };
        
        let estado_nombre = match estado_buscar {
            EstadoPedido::Pendiente => "PENDIENTE",
            EstadoPedido::EnPreparacion => "EN PREPARACIÓN",
            EstadoPedido::Listo => "LISTO",
            EstadoPedido::Entregado => "ENTREGADO",
        };
        
        msg!("=== PEDIDOS ESTADO: {} ===", estado_nombre);
        
        let mut encontrados = 0;
        for pedido in &cafeteria.pedidos {
            if pedido.estado == estado_buscar {
                msg!("ID: {} | Cliente: {} | {} x{} | {} SOL", 
                     pedido.id, pedido.cliente, pedido.bebida, pedido.cantidad, pedido.total);
                encontrados += 1;
            }
        }
        
        if encontrados == 0 {
            msg!("No hay pedidos en este estado");
        } else {
            msg!("Total: {} pedidos", encontrados);
        }
        
        Ok(())
    }
}

fn es_bebida_valida(bebida: &str) -> bool {
    matches!(bebida, "Café Americano" | "Capuchino" | "Latte" | "Espresso" | "Mocha" | "Té" | "Chocolate Caliente")
}

fn get_precio_bebida(bebida: &str) -> u64 {
    match bebida {
        "Café Americano" => 2,
        "Capuchino" => 3,
        "Latte" => 3,
        "Espresso" => 2,
        "Mocha" => 4,
        "Té" => 2,
        "Chocolate Caliente" => 3,
        _ => 0,
    }
}

#[error_code]
pub enum ErrorCafeteria {
    #[msg("La bebida no existe en el menú")]
    BebidaNoExiste,
    #[msg("El pedido no existe")]
    PedidoNoExiste,
    #[msg("Estado de pedido inválido")]
    EstadoInvalido,
}

#[account]
pub struct Cafeteria {
    pub owner: Pubkey,
    pub nombre: String,
    pub contador_pedidos: u32,
    pub pedidos: Vec<Pedido>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct Pedido {
    pub id: u32,
    pub cliente: String,
    pub bebida: String,
    pub cantidad: u32,
    pub total: u64,
    pub estado: EstadoPedido,
    pub fecha: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum EstadoPedido {
    Pendiente,
    EnPreparacion,
    Listo,
    Entregado,
}

#[derive(Accounts)]
pub struct CrearCafeteria<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 4 + 50 + 4 + 4 + 4 + 1000,
        seeds = [b"cafeteria", owner.key().as_ref()],
        bump
    )]
    pub cafeteria: Account<'info, Cafeteria>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GestionPedido<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(mut, has_one = owner)]
    pub cafeteria: Account<'info, Cafeteria>,
}