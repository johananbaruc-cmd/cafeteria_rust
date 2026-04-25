# ☕ Cafetería Local - Programa en Solana

## 📋 Descripción del Proyecto

**Cafetería Local** es un programa descentralizado construido en **Solana** con **Anchor Framework** que permite gestionar pedidos de una cafetería mediante una **Cuenta PDA (Program Derived Address)**. Implementa un **CRUD completo** (Crear, Leer, Actualizar, Eliminar) sobre pedidos.

## 🎯 ¿Qué hace este proyecto?

- **Crear** una cafetería (única por propietario usando PDA)
- **Crear pedidos** con diferentes bebidas y precios predefinidos
- **Leer/Ver** todos los pedidos o filtrarlos por estado
- **Actualizar** el estado de un pedido (Pendiente → EnPreparación → Listo → Entregado)
- **Eliminar** pedidos existentes

## 📡Instrucciones del Programa
Instrucción	Parámetros	Descripción
crearCafeteria	nombre: String	Inicializa una nueva cafetería
crearPedido	cliente, bebida, cantidad	Agrega un nuevo pedido
actualizarEstado	id, nuevo_estado	Cambia el estado de un pedido
eliminarPedido	id	Elimina un pedido existente
verPedidos	-	Muestra todos los pedidos
verPedidosPorEstado	estado: u8	Filtra pedidos por estado

Estados disponibles:

0 - Pendiente

1 - En Preparación

2 - Listo

3 - Entregado

## 🚀 Cómo usar
En Solana Playground:

Crear el programa:

Copia el código de lib.rs en el editor

Haz clic en Build y luego en Deploy

## 🛠️ Tecnologías
Tecnología	Versión	Uso
Solana	1.16+	Blockchain
Anchor	0.29+	Framework
Rust	1.70+	Smart Contract
TypeScript	4.9+	Tests y cliente

## 🔒 Seguridad

 Validación de bebidas: Solo las del menú son aceptadas

 has_one constraint: Verifica que el owner sea correcto

  PDA verification: Las seeds deben coincidir exactamente

## 🍹 Menú de bebidas y precios (en SOL)

| Bebida | Precio |
|--------|--------|
| Café Americano | 2 SOL |
| Capuchino | 3 SOL |
| Latte | 3 SOL |
| Espresso | 2 SOL |
| Mocha | 4 SOL |
| Té | 2 SOL |
| Chocolate Caliente | 3 SOL |

## 🏗️ Estructura de datos (PDA)

El programa usa una **PDA (Program Derived Address)** para almacenar la cafetería:

```rust
// La PDA se deriva con: seeds = [b"cafeteria", owner.key()]
pub struct Cafeteria {
    pub owner: Pubkey,           // Propietario de la cafetería
    pub nombre: String,          // Nombre del local
    pub contador_pedidos: u32,   // Contador autoincremental
    pub pedidos: Vec<Pedido>,    // Vector con todos los pedidos
}

pub struct Pedido {
    pub id: u32,
    pub cliente: String,
    pub bebida: String,
    pub cantidad: u32,
    pub total: u64,
    pub estado: EstadoPedido,    // Pendiente, EnPreparacion, Listo, Entregado
    pub fecha: i64,
}



Ejecutar tests:

test

Ejecutar el cliente interactivo:

run




    Error handling: Mensajes descriptivos para cada error
