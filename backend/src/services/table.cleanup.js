/**
 * Servicio para limpiar mesas vacías automáticamente
 */
import { Table, Game } from '../models/index.js';
import { Op } from 'sequelize';

const EMPTY_TABLE_TIMEOUT = 40000; // 40 segundos en milisegundos

/**
 * Limpiar mesas vacías que han estado sin jugadores por más de 40 segundos
 */
export const cleanupEmptyTables = async () => {
  try {
    const now = new Date();
    const timeoutDate = new Date(now.getTime() - EMPTY_TABLE_TIMEOUT);

    // Buscar mesas con 0 jugadores que no tengan juego activo
    const emptyTables = await Table.findAll({
      where: {
        currentPlayers: 0,
        status: { [Op.ne]: 'playing' },
        updatedAt: { [Op.lt]: timeoutDate }
      }
    });

    if (emptyTables.length > 0) {
      console.log(`🧹 Limpiando ${emptyTables.length} mesa(s) vacía(s)...`);
      
      for (const table of emptyTables) {
        // Borrar juegos asociados que estén finalizados
        await Game.destroy({
          where: {
            tableId: table.id,
            status: 'finished'
          }
        });

        // Borrar la mesa
        await table.destroy();
        console.log(`   ✅ Mesa "${table.name}" (${table.id}) eliminada`);
      }
    }

    return emptyTables.length;
  } catch (error) {
    console.error('❌ Error en cleanup de mesas:', error.message);
    return 0;
  }
};

/**
 * Iniciar el servicio de limpieza automática
 * Se ejecuta cada 30 segundos
 */
export const startTableCleanupService = () => {
  console.log('🧹 Iniciando servicio de limpieza de mesas vacías (cada 30s)');
  
  // Ejecutar inmediatamente
  cleanupEmptyTables();
  
  // Ejecutar cada 30 segundos
  setInterval(() => {
    cleanupEmptyTables();
  }, 30000);
};

export default {
  cleanupEmptyTables,
  startTableCleanupService
};
