import sequelize from '../config/db.js';
import {
  User,
  Table,
  Game,
  Hand,
  HandAction,
  Transaction,
  Mission,
  Achievement,
  Friend,
  FriendRequest
} from '../models/index.js';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  try {
    // Sincronizar base de datos
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada');

    // Verificar si ya hay usuarios
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('📊 Base de datos ya tiene datos, saltando seed');
      return;
    }

    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      username: 'jugador1',
      email: 'jugador1@pokerkings.com',
      password: hashedPassword,
      chips: 5000,
      level: 5,
      experience: 2500,
      avatar: 'avatar1.png',
      highestWinning: 1000,
      totalWinnings: 5000,
      gamesPlayed: 25,
      gamesWon: 8
    });

    const user2 = await User.create({
      username: 'jugador2',
      email: 'jugador2@pokerkings.com',
      password: hashedPassword,
      chips: 3000,
      level: 3,
      experience: 1200,
      avatar: 'avatar2.png',
      highestWinning: 500,
      totalWinnings: 2000,
      gamesPlayed: 15,
      gamesWon: 4
    });

    const user3 = await User.create({
      username: 'jugador3',
      email: 'jugador3@pokerkings.com',
      password: hashedPassword,
      chips: 10000,
      level: 10,
      experience: 5000,
      avatar: 'avatar3.png',
      highestWinning: 3000,
      totalWinnings: 15000,
      gamesPlayed: 60,
      gamesWon: 25
    });

    console.log('✅ Usuarios creados');

    // Crear amistad entre usuarios
    await Friend.create({
      userId: user1.id,
      friendId: user2.id
    });

    await Friend.create({
      userId: user2.id,
      friendId: user1.id
    });

    console.log('✅ Amistades creadas');

    // Crear mesas de prueba
    const table1 = await Table.create({
      name: 'Mesa Principiantes',
      smallBlind: 10,
      bigBlind: 20,
      maxPlayers: 6,
      isPrivate: false,
      tableColor: '#1a4d2e',
      status: 'waiting',
      currentPlayers: 2
    });

    const table2 = await Table.create({
      name: 'Mesa Intermedia',
      smallBlind: 50,
      bigBlind: 100,
      maxPlayers: 8,
      isPrivate: false,
      tableColor: '#2d5a3d',
      status: 'waiting',
      currentPlayers: 1
    });

    const table3 = await Table.create({
      name: 'Mesa Alta',
      smallBlind: 100,
      bigBlind: 200,
      maxPlayers: 6,
      isPrivate: true,
      tableColor: '#3d6a4d',
      status: 'playing',
      currentPlayers: 4
    });

    console.log('✅ Mesas creadas');

    // Crear partidas de prueba
    const game1 = await Game.create({
      tableId: table1.id,
      pot: 300,
      phase: 'flop',
      communityCards: ['A♠', 'K♥', 'Q♦'],
      status: 'active'
    });

    const game2 = await Game.create({
      tableId: table2.id,
      winnerId: user1.id,
      pot: 1500,
      phase: 'showdown',
      communityCards: ['2♠', '7♥', 'J♦', '9♣', 'K♠'],
      status: 'finished'
    });

    console.log('✅ Partidas creadas');

    // Crear historial de manos
    const hand1 = await Hand.create({
      gameId: game2.id,
      userId: user1.id,
      cards: ['A♠', 'K♠'],
      finalCards: ['A♠', 'K♠', '2♠', '7♥', 'J♦'],
      result: 'win',
      profit: 1000,
      position: 'BTN'
    });

    const hand2 = await Hand.create({
      gameId: game2.id,
      userId: user2.id,
      cards: ['Q♦', 'Q♣'],
      finalCards: ['Q♦', 'Q♣', '2♠', '7♥', 'J♦'],
      result: 'loss',
      profit: -500,
      position: 'SB'
    });

    console.log('✅ Historial de manos creado');

    // Crear acciones de mano
    await HandAction.create({
      handId: hand1.id,
      action: 'raise',
      amount: 100,
      phase: 'preflop',
      sequenceNumber: 1
    });

    await HandAction.create({
      handId: hand1.id,
      action: 'call',
      amount: 100,
      phase: 'flop',
      sequenceNumber: 2
    });

    console.log('✅ Acciones de mano creadas');

    // Crear transacciones
    await Transaction.create({
      userId: user1.id,
      type: 'purchase',
      amount: 5000,
      description: 'Compra de paquete medium',
      balanceBefore: 0,
      balanceAfter: 5000
    });

    await Transaction.create({
      userId: user1.id,
      type: 'win',
      amount: 1000,
      description: 'Victoria en partida',
      balanceBefore: 5000,
      balanceAfter: 6000
    });

    console.log('✅ Transacciones creadas');

    // Crear misiones
    const missions = [
      {
        userId: user1.id,
        title: 'Primera Victoria',
        description: 'Gana tu primera partida',
        requirement: { type: 'wins', count: 1 },
        progress: 1,
        reward: 500,
        completed: true,
        completedAt: new Date(),
        type: 'permanent'
      },
      {
        userId: user1.id,
        title: 'Coleccionista de Fichas',
        description: 'Acumula 10,000 fichas',
        requirement: { type: 'chips', count: 10000 },
        progress: 6000,
        reward: 1000,
        completed: false,
        type: 'permanent'
      },
      {
        userId: user1.id,
        title: 'Jugador Diario',
        description: 'Juega 5 partidas hoy',
        requirement: { type: 'games', count: 5 },
        progress: 3,
        reward: 250,
        completed: false,
        type: 'daily'
      }
    ];

    for (const mission of missions) {
      await Mission.create(mission);
    }

    console.log('✅ Misiones creadas');

    console.log('🎉 ¡Base de datos poblada exitosamente!');
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  }
};
