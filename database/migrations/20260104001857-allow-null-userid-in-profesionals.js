'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Primero intentamos eliminar la llave foránea existente.
      // NOTA: Los nombres de las constraints en MySQL a veces varían.
      // Sequelize suele usar 'Professionals_userId_foreign_idx' o nombres generados como 'professionals_ibfk_1'.
      // Vamos a intentar obtener las constraints de la tabla para borrar la correcta.
      
      const tableInfo = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME 
         FROM information_schema.KEY_COLUMN_USAGE 
         WHERE TABLE_NAME = 'Professionals' 
         AND COLUMN_NAME = 'userId' 
         AND REFERENCED_TABLE_NAME = 'Users';`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (tableInfo.length > 0) {
        const constraintName = tableInfo[0].CONSTRAINT_NAME;
        await queryInterface.removeConstraint('Professionals', constraintName, { transaction });
      }

      // 2. Ahora que no hay FK, cambiamos la columna para permitir NULL
      await queryInterface.changeColumn('Profesionals', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true, // <--- Aquí es donde permitimos el NULL
      }, { transaction });

      // 3. Volvemos a agregar la llave foránea, ahora con la regla SET NULL
      await queryInterface.addConstraint('profesionals', {
        fields: ['userId'],
        type: 'foreign key',
        name: 'custom_fkey_professional_user_set_null', // Le ponemos un nombre fijo para evitar líos futuros
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Para revertir:
      // 1. Borramos la FK permisiva
      await queryInterface.removeConstraint('profesionals', 'custom_fkey_professional_user_set_null', { transaction });

      // 2. Opcional: Limpiamos los NULLs que puedan haber quedado (asignando a un usuario por defecto o borrando)
      // Esto es arriesgado, así que solo cambiamos la columna si no hay datos nulos, de lo contrario fallará.
      // Por seguridad en desarrollo, simplemente intentamos volver a NOT NULL.
      
      await queryInterface.changeColumn('profesionals', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }, { transaction });

      // 3. Restauramos la FK original estricta
      await queryInterface.addConstraint('profesionals', {
        fields: ['userId'],
        type: 'foreign key',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'CASCADE', // O la regla que tenías originalmente (probablemente CASCADE o RESTRICT)
        onUpdate: 'CASCADE'
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error al revertir migración (posiblemente hay datos NULL que impiden volver a NOT NULL):', error.message);
      throw error;
    }
  }
};