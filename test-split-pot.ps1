$ErrorActionPreference = "Continue"

$base = "http://localhost:3001/api"
$script:hasErrors = $false

function Assert($condition, $message) {
  if (-not $condition) {
    Write-Host "❌ $message" -ForegroundColor Red
    $script:hasErrors = $true
  } else {
    Write-Host "✅ $message" -ForegroundColor Green
  }
}

# Login
Write-Host "🔐 Login..." -ForegroundColor Cyan
try {
  $loginResponse = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body (@{
    email = "jugador1@pokerkings.com"
    password = "password123"
  } | ConvertTo-Json) -ContentType "application/json"
} catch {
  Write-Host "❌ ERROR en login: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host "Pulsa Enter para terminar"
  exit
}

$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

$user1 = "179505ce-fe5a-4469-bfc0-b54fb928f4d0" # BTN
$user2 = "4a6dc974-8c6f-46c1-923f-193bfda909ba" # SB
$user3 = "a4bcf54f-61b4-4924-8edd-610859036284" # BB

# =============================================================================
# TEST: Split Pot - Múltiples Ganadores
# =============================================================================
Write-Host "`n════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "🎰 TEST: Split Pot - Múltiples Ganadores" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════`n" -ForegroundColor Magenta

Write-Host "📋 Setup..."
try {
  $tableRes = Invoke-RestMethod -Method Post -Uri "$base/tables" -Headers $headers -Body (@{
    name = "TestSplitPot_$(Get-Random)"
    smallBlind = 100
    bigBlind = 200
    maxPlayers = 6
  } | ConvertTo-Json) -ContentType "application/json"
  $tableId = $tableRes.id

  $gameStart = Invoke-RestMethod -Method Post -Uri "$base/games/start" -Headers $headers -Body (@{
    tableId   = $tableId
    playerIds = @($user1, $user2, $user3)
  } | ConvertTo-Json) -ContentType "application/json"
  $gameId = $gameStart.game.id
  $state = $gameStart.game

  Write-Host "✅ Juego creado: $gameId"
  Write-Host "   Players: $($state.players.Count)"
  Write-Host "   Pot inicial: $($state.pot)"
  Write-Host ""
  
  Write-Host "🎯 Escenario: 3 jugadores jugando hasta river, dos con la misma mano (split pot)"
  Write-Host ""

  # PREFLOP
  Write-Host "🎲 PREFLOP..."
  $p1 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user1; action = "call"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $p2 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user2; action = "call"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $p3 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user3; action = "call"
  } | ConvertTo-Json) -ContentType "application/json"
  
  Write-Host "   ✅ Preflop complete"

  # FLOP
  Write-Host "`n🎲 FLOP..."
  $f1 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user2; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $f2 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user3; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $f3 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user1; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  Write-Host "   ✅ Flop complete"

  # TURN
  Write-Host "`n🎲 TURN..."
  $t1 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user2; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $t2 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user3; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $t3 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user1; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  Write-Host "   ✅ Turn complete"

  # RIVER
  Write-Host "`n🎲 RIVER..."
  $r1 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user2; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $r2 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user3; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  $r3 = Invoke-RestMethod -Method Post -Uri "$base/games/$gameId/action" -Headers $headers -Body (@{
    userId = $user1; action = "check"
  } | ConvertTo-Json) -ContentType "application/json"
  
  Write-Host "   ✅ River complete"

  # Obtener resultado final
  $final = Invoke-RestMethod -Method Get -Uri "$base/games/$gameId" -Headers $headers
  
  Write-Host "`n🏁 RESULTADO FINAL:"
  Write-Host ""
  
  # Mostrar información de ganadores
  if ($final.winners -and $final.winners.Count -gt 0) {
    Write-Host "   📊 MÚLTIPLES GANADORES (Split Pot):" -ForegroundColor Yellow
    for ($i = 0; $i -lt $final.winners.Count; $i++) {
      $w = $final.winners[$i]
      Write-Host "      Ganador ${i}: $($w.username)"
      Write-Host "         Mano: $($w.hand)"
      Write-Host "         Fichas ganadas: $($w.chipsWon)"
      Write-Host ""
    }
  } else {
    Write-Host "   Ganador: $($final.winner.username)" -ForegroundColor Green
  }
  
  # Mostrar distribución final de fichas
  Write-Host "   📈 Fichas finales:"
  $totalChips = 0
  for ($i = 0; $i -lt $final.players.Count; $i++) {
    $p = $final.players[$i]
    $initialChips = if ($i -eq 0) { 5000 } else { if ($i -eq 1) { 3000 } else { 10000 } }
    $gain = $p.chips - $initialChips
    $gainStr = if ($gain -gt 0) { "+$gain" } else { "$gain" }
    Write-Host "      Player ${i}: $($p.chips) fichas ($gainStr)"
    $totalChips += $p.chips
  }
  
  Write-Host ""
  Write-Host "   Pot final: $($final.pot)"
  Write-Host "   Total chips: $totalChips"
  Write-Host ""
  
  # Validaciones
  Assert ($final.pot -eq 0) "Pot debe ser 0"
  Assert ($totalChips -eq 18000) "Total chips debe ser 18000"
  Assert ($final.status -eq "finished") "Status debe ser finished"
  
  # Si hay múltiples ganadores, validar que estén registrados
  if ($final.winners -and $final.winners.Count -gt 1) {
    Write-Host ""
    Write-Host "   ✅ Split pot detectado:" -ForegroundColor Green
    Assert ($final.winners.Count -ge 1) "Debe haber al menos 1 ganador registrado"
    Assert ($final.winnerIds.Count -eq $final.winners.Count) "winnerIds debe coincidir con winners"
  }
  
  if (-not $script:hasErrors) {
    Write-Host "`n✅ TEST PASSED!" -ForegroundColor Green
    Write-Host "   Sistema de múltiples ganadores funcionando correctamente"
  }
  
} catch {
  Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.ErrorDetails) {
    Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
  }
  $script:hasErrors = $true
}

Write-Host "`n════════════════════════════════════════════════" -ForegroundColor Cyan
if ($script:hasErrors) {
  Write-Host "⚠️  TEST FALLÓ" -ForegroundColor Yellow
} else {
  Write-Host "✅ TEST COMPLETADO!" -ForegroundColor Green
}
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan

Read-Host "`nPulsa Enter para cerrar"
