const { Inscripcion, Estudiante, GrupoMateria, Materia, Docente, PlanEstudio, Nivel, Prerequisito } = require('../models');
const { validationResult } = require('express-validator');
const QueueService = require("../services/QueueService");
const {
  ValidationError,
  ConflictError,
  UnprocessableEntityError,
  NotFoundError
} = require('../errors/ApiError');

let queueServiceInstance = null;

const getQueueService = () => {
  if (!queueServiceInstance) {
    queueServiceInstance = new QueueService();
  }
  return queueServiceInstance;
};

const inscripcionController = {


requestSeat: async (req, res, next) => {
  try {
    const { estudianteId, grupoMateriaId, gestion } = req.body;

    const [estudiante, grupo] = await Promise.all([
      Estudiante.findByPk(estudianteId),
      GrupoMateria.findByPk(grupoMateriaId, {
        include: [{ model: Materia, as: 'materia' }] 
      })
    ]);
    
    // Validaciones tempranas
    if (!estudiante) {
      throw new NotFoundError(`El estudiante con ID ${estudianteId} no fue encontrado.`);
    }
    if (!grupo) {
      throw new UnprocessableEntityError(`El grupo de materia con ID ${grupoMateriaId} no existe.`);
    }
    
    const estudianteNombre = estudiante.nombre;
    const materiaNombre = grupo.materia.nombre;
    const materiaId = grupo.materia.id; // ✅ NUEVO
    const grupoNombre = grupo.grupo;

    console.log('--- INSCRIPCIÓN INICIADA ---');
    console.log(`[INFO] Estudiante: ${estudianteNombre} (ID: ${estudianteId})`);
    console.log(`[INFO] Materia: ${materiaNombre} (Grupo: ${grupoNombre})`);
    
    if (grupo.cupo <= 0) {
      throw new UnprocessableEntityError(`No hay cupos disponibles.`);
    }

    const existingInscription = await Inscripcion.findOne({ 
      where: { estudianteId, grupoMateriaId } 
    });
    if (existingInscription) {
      throw new ConflictError(`El estudiante ya está inscrito en este grupo.`);
    }

    // ==========================================
    // ✅ VALIDACIÓN 1: Ya aprobó la materia?
    // ==========================================
    const { HistoricoAcademico } = require('../models');
    const yaAprobo = await HistoricoAcademico.findOne({
      where: {
        estudianteId,
        materiaId: materiaId, // ✅ Usar materiaId, no grupoMateriaId
        estado: 'APROBADO'
      }
    });

    if (yaAprobo) {
      throw new ConflictError(
        `Ya aprobaste "${materiaNombre}" en el periodo ${yaAprobo.periodo} con nota ${yaAprobo.nota}`
      );
    }

    // ==========================================
    // ✅ VALIDACIÓN 2: Cumple prerequisitos?
    // ==========================================
    const { Prerequisito } = require('../models');
    const prerequisitos = await Prerequisito.findAll({
      where: { materiaId: materiaId },
      include: [
        {
          model: Materia,
          as: 'materiaRequerida',
          attributes: ['id', 'nombre', 'sigla']
        }
      ]
    });

    if (prerequisitos.length > 0) {
      const prerequisitosNoAprobados = [];
      
      for (const prereq of prerequisitos) {
        const registroAprobado = await HistoricoAcademico.findOne({
          where: {
            estudianteId,
            materiaId: prereq.requiereId,
            estado: 'APROBADO',
            nota: { [require('sequelize').Op.gte]: prereq.notaMinima || 51 }
          }
        });

        if (!registroAprobado) {
          prerequisitosNoAprobados.push({
            materia: prereq.materiaRequerida.nombre,
            sigla: prereq.materiaRequerida.sigla,
            notaMinima: prereq.notaMinima || 51
          });
        }
      }

      if (prerequisitosNoAprobados.length > 0) {
        const mensaje = prerequisitosNoAprobados
          .map(p => `${p.sigla} - ${p.materia} (nota mín: ${p.notaMinima})`)
          .join(', ');
        
        throw new UnprocessableEntityError(
          `No cumples con los prerequisitos: ${mensaje}`
        );
      }
    }

    // ==========================================
    // ✅ Si pasa todas las validaciones, encolar
    // ==========================================
    const service = getQueueService();
    await service.initialize();
    
    const result = await service.enqueueTaskAutoBalance({
      type: 'inscription',
      model: 'Inscripcion',
      operation: 'requestSeat',
      data: {
        estudianteId,
        grupoMateriaId,
        materiaId, // ✅ NUEVO: Para validaciones en worker
        gestion: gestion || new Date().getFullYear(),
        estudianteNombre,
        materiaNombre,
        grupoNombre
      }
    });

    console.log('--- INSCRIPCIÓN PENDIENTE ---');
    console.log(`[INFO] La solicitud fue encolada en '${result.queueName}'`);
    console.log(`[INFO] Tarea ID: ${result.taskId}`);
    
    res.status(202).json({
      ...result,
      message: 'Solicitud de inscripción encolada exitosamente.',
    });

  } catch (error) {
    next(error);
  }
},

  // Obtener todas las inscripciones
  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const { gestion } = req.query;

      const where = {};
      if (gestion) {
        where.gestion = gestion;
      }

      const inscripciones = await Inscripcion.findAndCountAll({
        where,
        
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
            attributes: ['id', 'registro', 'nombre', 'telefono']
          },
          {
            model: GrupoMateria,
            as: 'grupoMateria',
            attributes: ['id', 'grupo', 'estado'],
            include: [
              {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'sigla', 'creditos'],
                include: [
                  {
                    model: PlanEstudio,
                    as: 'planEstudio',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Nivel,
                    as: 'nivel',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Prerequisito,
                    as: 'prerequisitos',
                    attributes: ['id', 'materia_id', 'requiere_id']
                  }
                ]
              },
              {
                model: Docente,
                as: 'docente',
                attributes: ['id', 'nombre', 'telefono']
              }
            ]
          }
        ],
        order: [['fecha', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: inscripciones.rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(inscripciones.count / limit),
          totalItems: inscripciones.count,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener inscripciones',
        error: error.message
      });
    }
  },

  getByGrupoMateria: async (req, res) => {
    try {
      const { grupoMateriaId } = req.params;

      const inscripciones = await Inscripcion.findAll({
        where: { grupoMateriaId },
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'registro'] // Datos del estudiante
          },
          {
            model: GrupoMateria,
            as: 'grupoMateria',
            attributes: ['id', 'grupo'],
            include: [{ model: Materia, as: 'materia', attributes: ['nombre'] }]
          },
          {
            model: Nota, // Incluimos la nota
            as: 'nota',  // Usando el 'as' que DEBERÍAS tener en tus relaciones
            required: false // IMPORTANTE: Traer al estudiante AUNQUE NO TENGA NOTA
          }
        ],
        order: [
          [{ model: Estudiante, as: 'estudiante' }, 'nombre', 'ASC']
        ]
      });

      if (!inscripciones || inscripciones.length === 0) {
        // No es un error, simplemente no hay inscritos
        return res.status(200).json({ success: true, data: [] });
      }

      res.status(200).json({ success: true, data: inscripciones });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener inscripciones del grupo',
        error: error.message
      });
    }
  },

  // Obtener inscripción por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const inscripcion = await Inscripcion.findByPk(id, {
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
            attributes: ['id', 'registro', 'nombre', 'telefono', 'fechaNac']
          },
          {
            model: GrupoMateria,
            as: 'grupoMateria',
            attributes: ['id', 'grupo', 'estado', 'materiaId', 'docenteId'],
            include: [
              {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'sigla', 'creditos', 'nivelId', 'planEstudioId'],
                include: [
                  {
                    model: PlanEstudio,
                    as: 'planEstudio',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Nivel,
                    as: 'nivel',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Prerequisito,
                    as: 'prerequisitos',
                    attributes: ['id', 'materia_id', 'requiere_id']
                  }
                ]
              },
              {
                model: Docente,
                as: 'docente',
                attributes: ['id', 'nombre', 'telefono']
              }
            ]
          }
        ]
      });

      if (!inscripcion) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: inscripcion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener inscripción',
        error: error.message
      });
    }
  },

  // Crear nueva inscripción
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { fecha, gestion, estudianteId, grupoMateriaId } = req.body;

      // Verificar que el estudiante existe
      const estudiante = await Estudiante.findByPk(estudianteId);
      if (!estudiante) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado'
        });
      }

      // Verificar que el grupo de materia existe
      const grupoMateria = await GrupoMateria.findByPk(grupoMateriaId);
      if (!grupoMateria) {
        return res.status(404).json({
          success: false,
          message: 'Grupo de materia no encontrado'
        });
      }

      const inscripcion = await Inscripcion.create({
        fecha: fecha || new Date(),
        gestion,
        estudianteId,
        grupoMateriaId
      });

      // Obtener la inscripción con todas las relaciones incluidas
      const inscripcionCompleta = await Inscripcion.findByPk(inscripcion.id, {
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
            attributes: ['id', 'registro', 'nombre', 'telefono']
          },
          {
            model: GrupoMateria,
            as: 'grupoMateria',
            attributes: ['id', 'grupo', 'estado', 'materiaId', 'docenteId'],
            include: [
              {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'sigla', 'creditos', 'nivelId', 'planEstudioId'],
                include: [
                  {
                    model: PlanEstudio,
                    as: 'planEstudio',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Nivel,
                    as: 'nivel',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Prerequisito,
                    as: 'prerequisitos',
                    attributes: ['id', 'materia_id', 'requiere_id']
                  }
                ]
              },
              {
                model: Docente,
                as: 'docente',
                attributes: ['id', 'nombre', 'telefono']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Inscripción creada exitosamente',
        data: inscripcionCompleta
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear inscripción',
        error: error.message
      });
    }
  },

  // Actualizar inscripción
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { fecha, gestion, estudianteId, grupoMateriaId } = req.body;

      const inscripcion = await Inscripcion.findByPk(id);
      if (!inscripcion) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      // Verificar que el estudiante existe si se está actualizando
      if (estudianteId) {
        const estudiante = await Estudiante.findByPk(estudianteId);
        if (!estudiante) {
          return res.status(404).json({
            success: false,
            message: 'Estudiante no encontrado'
          });
        }
      }

      // Verificar que el grupo de materia existe si se está actualizando
      if (grupoMateriaId) {
        const grupoMateria = await GrupoMateria.findByPk(grupoMateriaId);
        if (!grupoMateria) {
          return res.status(404).json({
            success: false,
            message: 'Grupo de materia no encontrado'
          });
        }
      }

      await inscripcion.update({
        fecha,
        gestion,
        estudianteId,
        grupoMateriaId
      });

      // Obtener la inscripción actualizada con todas las relaciones incluidas
      const inscripcionActualizada = await Inscripcion.findByPk(id, {
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
            attributes: ['id', 'registro', 'nombre', 'telefono']
          },
          {
            model: GrupoMateria,
            as: 'grupoMateria',
            attributes: ['id', 'grupo', 'estado', 'materiaId', 'docenteId'],
            include: [
              {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'sigla', 'creditos', 'nivelId', 'planEstudioId'],
                include: [
                  {
                    model: PlanEstudio,
                    as: 'planEstudio',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Nivel,
                    as: 'nivel',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Prerequisito,
                    as: 'prerequisitos',
                    attributes: ['id', 'materia_id', 'requiere_id']
                  }
                ]
              },
              {
                model: Docente,
                as: 'docente',
                attributes: ['id', 'nombre', 'telefono']
              }
            ]
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Inscripción actualizada exitosamente',
        data: inscripcionActualizada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar inscripción',
        error: error.message
      });
    }
  },

  // Eliminar inscripción
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const inscripcion = await Inscripcion.findByPk(id);
      if (!inscripcion) {
        return res.status(404).json({
          success: false,
          message: 'Inscripción no encontrada'
        });
      }

      await inscripcion.destroy();

      res.status(200).json({
        success: true,
        message: 'Inscripción eliminada exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar inscripción',
        error: error.message
      });
    }
  },

  // Obtener inscripciones por estudiante
  getByEstudiante: async (req, res) => {
    try {
      const { estudianteId } = req.params;
      
      const estudiante = await Estudiante.findByPk(estudianteId);
      if (!estudiante) {
        return res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado'
        });
      }

      const inscripciones = await Inscripcion.findAll({
        where: { estudianteId },
        include: [
          {
            model: Estudiante,
            as: 'estudiante',
            attributes: ['id', 'registro', 'nombre', 'telefono']
          },
          {
            model: GrupoMateria,
            as: 'grupoMateria',
            attributes: ['id', 'grupo', 'estado', 'materiaId', 'docenteId'],
            include: [
              {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'sigla', 'creditos', 'nivelId', 'planEstudioId'],
                include: [
                  {
                    model: PlanEstudio,
                    as: 'planEstudio',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Nivel,
                    as: 'nivel',
                    attributes: ['id', 'nombre']
                  },
                  {
                    model: Prerequisito,
                    as: 'prerequisitos',
                    attributes: ['id', 'materia_id', 'requiere_id']
                  }
                ]
              },
              {
                model: Docente,
                as: 'docente',
                attributes: ['id', 'nombre', 'telefono']
              }
            ]
          }
        ],
        order: [['gestion', 'DESC'], ['fecha', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: inscripciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener inscripciones del estudiante',
        error: error.message
      });
    }
  }
};

module.exports = inscripcionController;