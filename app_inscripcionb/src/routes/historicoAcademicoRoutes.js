const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoAcademicoController');

// Obtener histórico completo de un estudiante
router.get('/estudiante/:estudianteId', historicoController.getByEstudiante);

// Obtener histórico agrupado por periodo
router.get('/estudiante/:estudianteId/por-periodo', historicoController.getByEstudiantePorPeriodo);

// Verificar prerequisitos para una materia específica
router.get('/estudiante/:estudianteId/prerequisitos/:materiaId',historicoController.verificarPrerequisitos);

// ================ CRUD BÁSICO ================

// Crear nuevo registro en histórico
router.post('/', historicoController.create);

// Actualizar registro existente
router.put('/:id', historicoController.update);

// Eliminar registro
router.delete('/:id', historicoController.delete);


module.exports = router;