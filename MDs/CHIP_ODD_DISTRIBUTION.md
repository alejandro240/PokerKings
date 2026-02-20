# 🪙 Sistema de Distribución del Chip Impar (Odd Chip)

## Resumen

Cuando un bote se divide entre múltiples ganadores (split pot), si el bote tiene una cantidad impar de fichas (ej: 1001 fichas), una ficha no se puede dividir. El sistema ahora distribuye ese chip impar al jugador **más cercano al dealer en sentido horario**.

## Cambios Realizados

### 1. **sidepots.service.js** - Función `distributeSidePots()`
```javascript
export const distributeSidePots = (pots, winners, players, dealerIndex = 0)
```

**Cambios:**
- ✅ Agregado parámetro `dealerIndex` 
- ✅ Distribuye equitativamente share a todos los ganadores
- ✅ Calcula el jugador más cercano al dealer para el chip impar

### 2. **game.service.js** - Función `finishShowdown()`
```javascript
const dealerIndex = game.players.findIndex(p => p.userId === game.dealerId);
```

**Cambios:**
- ✅ Obtiene el índice del dealer
- ✅ Aplica la misma lógica del chip impar
- ✅ Loguea asignación del chip impar para debugging

---

## 🎯 Cómo Funciona

### Escenario Ejemplo: 3 Jugadores, Bote de 1001 chips, 2 Ganadores

```
Mesa:
- Dealer: Player 0 (index 0)
- SB: Player 1 (index 1)  
- BB: Player 2 (index 2)

Ambos ganadores tienen la misma mano (empate):
- Player 1 (SB): mano igual
- Player 2 (BB): mano igual

Distribución:
- Share equitativo: 1001 / 2 = 500 fichas cada uno
- Remainder (chip impar): 1001 - (500 * 2) = 1 ficha

¿A quién va el chip impar?

Cálculo de distancia en sentido horario desde dealer (índice 0):

Player 1 (SB):
  distance = (1 - 0 + 3) % 3 = 4 % 3 = 1 posición desde dealer

Player 2 (BB):
  distance = (2 - 0 + 3) % 3 = 5 % 3 = 2 posiciones desde dealer

👉 Player 1 está a 1 posición del dealer (SB)
   Player 2 está a 2 posiciones del dealer (BB)

RESULTADO: ✅ Player 1 recibe el chip impar porque está más cercano al dealer
```

### Fórmula de Distancia

```javascript
distance = (playerIndex - dealerIndex + numPlayers) % numPlayers

// Ejemplo con 6 jugadores:
// Dealer en index 3:

Index 0: (0 - 3 + 6) % 6 = 3
Index 1: (1 - 3 + 6) % 6 = 4
Index 2: (2 - 3 + 6) % 6 = 5
Index 3: (3 - 3 + 6) % 6 = 0 (es el dealer, se le asigna numPlayers si hay otros)
Index 4: (4 - 3 + 6) % 6 = 1 ✅ MÁS CERCANO DESPUÉS DEL DEALER
Index 5: (5 - 3 + 6) % 6 = 2
```

---

## 📊 Casos de Uso

### Caso 1: Empate con 3 Ganadores

```
Bote: 1000 chips
Ganadores: 3 (todos con igual mano)

Share: 1000 / 3 = 333 fichas
Remainder: 1000 - (333 * 3) = 1 ficha

Si Dealer = Player 0:
- Player 0: 333 fichas
- Player 1: 333 fichas  
- Player 2: 333 + 1 ✅ (más cercano al dealer)
```

### Caso 2: Side Pots Múltiples

```
Main Pot: 600 chips (3 ganadores, empate)
  → 200 cada uno → 0 remainder

Side Pot 1: 401 chips (2 ganadores, empate)
  → 200 cada uno → 1 chip impar
  → Va al más cercano al dealer

Side Pot 2: 200 chips (1 solo ganador)
  → 200 completos (sin división)
```

### Caso 3: Dealer vs Otros Ganadores

```
Bote: 1001 chips
Ganadores: Dealer + Player 1 (empate)

Distance de Dealer: 0 → ajustado a numPlayers (porque no puede ganar a sí mismo)
Distance de Player 1: 1

✅ Player 1 recibe el chip impar (1 < numPlayers)
```

---

## 🧪 Testing

Ejecutar el test:
```powershell
.\test-chip-odd.ps1
```

El test valida:
- ✅ Pot correctamente distribuido
- ✅ Chips totales conservados (sin pérdida)
- ✅ Chip impar asignado al jugador correcto

---

## 🔍 Debug Logs

El sistema logguea asignaciones del chip impar:

```
[DEBUG][CHIP_ODD] Chip impar (1) asignado a player 1 (distancia: 1 desde dealer 0)
```

---

## 💡 Diferencia con Sistema Anterior

### Antes ❌
```javascript
// Siempre el primer ganador del array
eligibleWinners[0].chips += remainder;
```

**Problema:** Arbitrario, no sigue reglas reales de poker

### Ahora ✅
```javascript
// Más cercano al dealer en sentido horario
closestToDealer.chips += remainder;
```

**Ventaja:** Sigue estándar de casinos de poker reales

---

## 📋 Integración

Para usar en nuevos spots:

```javascript
// En finishShowdown()
const dealerIndex = game.players.findIndex(p => p.userId === game.dealerId);

// O en cualquier distribución
distributeSidePots(pots, winners, players, dealerIndex);
```

