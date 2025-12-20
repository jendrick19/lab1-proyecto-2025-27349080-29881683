'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const services = [
      {
        code: 'CONS001',
        name: 'Consulta Médica General',
        group: 'Consultas',
        requirements: 'Documento de identidad',
        estimatedTime: '30 minutos',
        requiresAuthorization: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CONS002',
        name: 'Consulta de Especialidad',
        group: 'Consultas',
        requirements: 'Documento de identidad, orden médica',
        estimatedTime: '45 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LAB001',
        name: 'Hemograma Completo',
        group: 'Laboratorio',
        requirements: 'Ayuno de 8 horas',
        estimatedTime: '10 minutos',
        requiresAuthorization: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LAB002',
        name: 'Glicemia en Ayunas',
        group: 'Laboratorio',
        requirements: 'Ayuno mínimo de 8 horas',
        estimatedTime: '10 minutos',
        requiresAuthorization: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LAB003',
        name: 'Perfil Lipídico',
        group: 'Laboratorio',
        requirements: 'Ayuno de 12 horas',
        estimatedTime: '10 minutos',
        requiresAuthorization: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IMG001',
        name: 'Radiografía de Tórax',
        group: 'Imágenes',
        requirements: 'Sin preparación especial',
        estimatedTime: '15 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IMG002',
        name: 'Ecografía Abdominal',
        group: 'Imágenes',
        requirements: 'Ayuno de 6 horas',
        estimatedTime: '30 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IMG003',
        name: 'Tomografía de Cráneo',
        group: 'Imágenes',
        requirements: 'Sin preparación especial',
        estimatedTime: '45 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PROC001',
        name: 'Electrocardiograma',
        group: 'Procedimientos',
        requirements: 'Ropa cómoda',
        estimatedTime: '15 minutos',
        requiresAuthorization: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PROC002',
        name: 'Espirometría',
        group: 'Procedimientos',
        requirements: 'No fumar 4 horas antes',
        estimatedTime: '30 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PROC003',
        name: 'Endoscopia Digestiva Alta',
        group: 'Procedimientos',
        requirements: 'Ayuno de 8 horas',
        estimatedTime: '45 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PROC004',
        name: 'Colonoscopia',
        group: 'Procedimientos',
        requirements: 'Preparación intestinal completa',
        estimatedTime: '60 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'URG001',
        name: 'Atención de Urgencias',
        group: 'Urgencias',
        requirements: 'Documento de identidad',
        estimatedTime: 'Variable',
        requiresAuthorization: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TER001',
        name: 'Fisioterapia',
        group: 'Terapias',
        requirements: 'Orden médica',
        estimatedTime: '45 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TER002',
        name: 'Terapia Respiratoria',
        group: 'Terapias',
        requirements: 'Orden médica',
        estimatedTime: '30 minutos',
        requiresAuthorization: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    if (services.length > 0) {
      await queryInterface.bulkInsert('Services', services);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Services', null, {});
  }
};

