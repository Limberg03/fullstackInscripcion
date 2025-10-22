// TaskProcessor.js - VERSIÓN GLOBALIZADA PARA TODOS LOS MODELOS
const { sequelize } = require('../models');
const { UnprocessableEntityError, ConflictError, NotFoundError } = require('../errors/ApiError'); // ¡Asegúrate de que la ruta a tu archivo ApiError.js sea correcta!

class TaskProcessor {
  constructor() {
    this.models = null;
  }

  async initialize() {
    this.models = sequelize.models;
  }

  async processTask(task) {
    console.log('🔧 Procesando tarea:', task.id);
    console.log('   Modelo:', task.model);
    console.log('   Operación:', task.operation);

    if (!task || !task.model || !task.operation) {
      console.error('❌ Tarea incompleta recibida:', task);
      throw new Error(`Tarea incompleta: model=${task?.model}, operation=${task?.operation}`);
    }

    const { model, operation, data, id } = task;

    if (operation.toLowerCase() === 'requestseat') {
      try {
        return await this.handleRequestSeat(data);
      } catch (error) {
        // ✅ IDENTIFICAR ERRORES QUE NO DEBEN REINTENTAR
        const noRetryErrors = [
          'choque de horario',
          'no tiene cupos disponibles',
          'ya está inscrito',
          'grupo está inactivo'
        ];
        
        const shouldNotRetry = noRetryErrors.some(pattern => 
          error.message.toLowerCase().includes(pattern)
        );
        
        console.error(`❌ Error procesando tarea ${task.id}:`, error);
        
        throw {
          message: error.message,
          retry: !shouldNotRetry  // ✅ false si no debe reintentar
        };
      }
    }

    // BÚSQUEDA DINÁMICA DEL MODELO
    const Model = this.findModel(model);
    if (!Model) {
      const availableModels = Object.keys(this.models);
      throw new Error(`Modelo '${model}' no encontrado. Modelos disponibles: ${availableModels.join(', ')}`);
    }

    console.log(`✅ Modelo '${model}' encontrado`);

    let result;

    try {
      switch (operation.toLowerCase()) {
        case 'create':
          result = await this.handleCreate(Model, data);
          break;

        case 'update':
          result = await this.handleUpdate(Model, data.id, data.updateData || data);
          break;

        case 'delete':
          result = await this.handleDelete(Model, data.id || id);
          break;

        case 'bulkcreate':
          result = await this.handleBulkCreate(Model, data.records || data);
          break;

        case 'bulkupdate':
          result = await this.handleBulkUpdate(Model, data);
          break;

        case 'bulkdelete':
          result = await this.handleBulkDelete(Model, data);
          break;

        default:
          throw new Error(`Operación '${operation}' no soportada`);
      }

      console.log(`✅ Tarea ${task.id} completada exitosamente`);
      console.log(`   Resultado:`, JSON.stringify(result, null, 2));
      
      return {
        success: true,
        operation,
        model,
        result
      };

    } catch (error) {
      console.error(`❌ Error procesando tarea ${task.id}:`, error);
      throw {
        message: error.message,
        retry: this.shouldRetry(error)
      };
    }
  }

  // BÚSQUEDA INTELIGENTE DE MODELOS
  findModel(modelName) {
    // 1. Búsqueda exacta
    if (this.models[modelName]) {
      return this.models[modelName];
    }

    // 2. Búsqueda case-insensitive
    const modelKeys = Object.keys(this.models);
    const exactMatch = modelKeys.find(key => 
      key.toLowerCase() === modelName.toLowerCase()
    );
    
    if (exactMatch) {
      return this.models[exactMatch];
    }

    // 3. Búsqueda por nombre de tabla (plurales)
    const tableNameMatch = modelKeys.find(key => {
      const model = this.models[key];
      if (model.tableName) {
        return model.tableName.toLowerCase() === modelName.toLowerCase();
      }
      return false;
    });

    if (tableNameMatch) {
      return this.models[tableNameMatch];
    }

    // 4. Búsqueda flexible (singulares/plurales)
    const flexibleMatch = modelKeys.find(key => {
      const keyLower = key.toLowerCase();
      const modelLower = modelName.toLowerCase();
      
      // Comparar singular/plural
      return keyLower === modelLower + 's' || 
             keyLower === modelLower.replace(/s$/, '') ||
             keyLower + 's' === modelLower ||
             keyLower.replace(/s$/, '') === modelLower;
    });

    if (flexibleMatch) {
      return this.models[flexibleMatch];
    }

    return null;
  }

  async handleCreate(Model, data) {
    console.log(`📝 Creando registro en modelo ${Model.name}`);
    console.log(`   Datos:`, JSON.stringify(data, null, 2));
    
    // VALIDACIÓN DE DATOS
    if (!data || typeof data !== 'object') {
      throw new Error('Datos de creación inválidos');
    }

    const record = await Model.create(data);
    
    const result = {
      id: record.id,
      created: true,
      data: record.toJSON(),
      model: Model.name,
      tableName: Model.tableName
    };

    console.log(`✅ Registro creado con ID: ${record.id}`);
    return result;
  }

  async handleUpdate(Model, id, data) {
    console.log(`📝 Actualizando registro ${id} en modelo ${Model.name}`);
    
    if (!id) {
      throw new Error('ID es requerido para actualizar');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Datos de actualización inválidos');
    }

    const [updated, records] = await Model.update(data, {
      where: { id },
      returning: true
    });

    if (updated === 0) {
      throw new Error(`Registro con id ${id} no encontrado`);
    }

    const result = {
      id,
      updated: true,
      updatedCount: updated,
      data: records[0]?.toJSON(),
      model: Model.name
    };

    console.log(`✅ Registro ${id} actualizado`);
    return result;
  }

  async handleDelete(Model, id) {
    console.log(`🗑️ Eliminando registro ${id} en modelo ${Model.name}`);
    
    if (!id) {
      throw new Error('ID es requerido para eliminar');
    }

    const deleted = await Model.destroy({
      where: { id }
    });

    if (deleted === 0) {
      throw new Error(`Registro con id ${id} no encontrado`);
    }

    const result = {
      id,
      deleted: true,
      deletedCount: deleted,
      model: Model.name
    };

    console.log(`✅ Registro ${id} eliminado`);
    return result;
  }

  async handleBulkCreate(Model, records) {
    console.log(`📝 Creación masiva en modelo ${Model.name}`);
    console.log(`   Cantidad de registros: ${records.length}`);
    
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Array de registros válido es requerido');
    }

    const created = await Model.bulkCreate(records, {
      validate: true,
      returning: true
    });

    const result = {
      created: created.length,
      records: created.map(r => r.toJSON()),
      model: Model.name
    };

    console.log(`✅ ${created.length} registros creados masivamente`);
    return result;
  }

  async handleBulkUpdate(Model, { where, data }) {
    console.log(`📝 Actualización masiva en modelo ${Model.name}`);
    
    if (!where || !data) {
      throw new Error('where y data son requeridos para actualización masiva');
    }

    const [updated] = await Model.update(data, {
      where,
      returning: false
    });

    const result = {
      updated,
      where,
      data,
      model: Model.name
    };

    console.log(`✅ ${updated} registros actualizados masivamente`);
    return result;
  }

  async handleBulkDelete(Model, { where }) {
    console.log(`🗑️ Eliminación masiva en modelo ${Model.name}`);
    
    if (!where) {
      throw new Error('where es requerido para eliminación masiva');
    }

    const deleted = await Model.destroy({
      where
    });

    const result = {
      deleted,
      where,
      model: Model.name
    };

    console.log(`✅ ${deleted} registros eliminados masivamente`);
    return result;
  }


   async handleRequestSeat(data) {
    const { estudianteId, grupoMateriaId, gestion, estudianteNombre, materiaNombre, grupoNombre } = data;

    console.log('--- PROCESANDO INSCRIPCIÓN ---');
    console.log(`[WORKER] Tarea para el estudiante: '${estudianteNombre}' (ID: ${estudianteId})`);
    console.log(`[WORKER] En la materia: '${materiaNombre}' (Grupo: ${grupoNombre})`);

    const GrupoMateria = this.models.GrupoMateria;
    const Inscripcion = this.models.Inscripcion;
    const Horario = this.models.Horario;
    const Materia = this.models.Materia;

    if (!GrupoMateria || !Inscripcion || !Horario || !Materia) {
        throw new Error('Uno o más modelos requeridos no fueron encontrados');
    }

    const transaction = await sequelize.transaction();

    try {
        // ==========================================================
        // ✅ VALIDACIÓN DE CHOQUE DE HORARIO
        // ==========================================================
        
        // 1. Obtenemos el horario del grupo al que se intenta inscribir
        const grupoParaInscribir = await GrupoMateria.findByPk(grupoMateriaId, {
            include: [{ model: Horario, as: 'horario' }],
            transaction
        });

        if (!grupoParaInscribir || !grupoParaInscribir.horario) {
            throw new UnprocessableEntityError(`El grupo ${grupoMateriaId} o su horario no fueron encontrados.`);
        }

        // 2. Obtenemos TODAS las inscripciones actuales del estudiante en la misma gestión
        const inscripcionesActuales = await Inscripcion.findAll({
            where: { estudianteId, gestion },
            include: [{
                model: GrupoMateria,
                as: 'grupoMateria',
                include: [
                    { model: Horario, as: 'horario' },
                    { model: Materia, as: 'materia', attributes: ['nombre'] }
                ]
            }],
            transaction
        });

        // 3. Iteramos y comparamos cada horario inscrito con el nuevo
        for (const inscripcion of inscripcionesActuales) {
            const horarioInscrito = inscripcion.grupoMateria.horario;
            if (!horarioInscrito) continue;

            // Comparamos los días (ej: "lun-mie-vie" vs "mar-jue") " [], "
            const diasNuevo = grupoParaInscribir.horario.dia.toLowerCase().split('-');
            const diasInscrito = horarioInscrito.dia.toLowerCase().split('-');
            const diasEnComun = diasNuevo.some(dia => diasInscrito.includes(dia));

            if (diasEnComun) {
                // Si comparten al menos un día, comparamos las horas
                const inicioNuevo = new Date(`1970-01-01T${grupoParaInscribir.horario.horaInicio}Z`);
                const finNuevo = new Date(`1970-01-01T${grupoParaInscribir.horario.horaFin}Z`);
                const inicioInscrito = new Date(`1970-01-01T${horarioInscrito.horaInicio}Z`);
                const finInscrito = new Date(`1970-01-01T${horarioInscrito.horaFin}Z`);

                // Condición de choque: (InicioA < FinB) y (FinA > InicioB)
                if (inicioNuevo < finInscrito && finNuevo > inicioInscrito) {
                    // ✅ MENSAJE DE ERROR MEJORADO
                    const materiaConflicto = inscripcion.grupoMateria.materia.nombre;
                    const horariosConflicto = `${horarioInscrito.dia} ${horarioInscrito.horaInicio}-${horarioInscrito.horaFin}`;
                    
                    throw new ConflictError(
                        `Choque de horario detectado: ya estás inscrito en "${materiaConflicto}" (${horariosConflicto})`
                    );
                }
            }
        }
        
        // ==========================================================
        // ✅ FIN: VALIDACIÓN DE CHOQUE DE HORARIO
        // ==========================================================

        // 4. Continuamos con las validaciones existentes
        const grupo = grupoParaInscribir;

        if (!grupo.estado) {
            throw new UnprocessableEntityError(`El grupo ${grupo.grupo} está inactivo.`);
        }

       if (grupo.cupo <= 0) {
    throw new UnprocessableEntityError(
        `No se pudo completar la inscripción: el grupo "${grupoNombre}" no tiene cupos disponibles.`
    );
}

        const existingInscription = await Inscripcion.findOne({
            where: { estudianteId, grupoMateriaId },
            transaction
        });

        if (existingInscription) {
            throw new ConflictError(`El estudiante ya está inscrito en este grupo.`);
        }

        // 5. Si todas las validaciones pasan, creamos la inscripción
        const inscripcion = await Inscripcion.create({
            estudianteId,
            grupoMateriaId,
            gestion,
            fecha: new Date()
            
        }, { transaction });


        const cuposRestantes = grupo.cupo - 1;

        await grupo.decrement('cupo', { by: 1, transaction });

        await transaction.commit();

        

        console.log('--- INSCRIPCIÓN FINALIZADA (ÉXITO) ---');
        console.log(`[SUCCESS] Estudiante '${estudianteNombre}' inscrito correctamente.`);
        console.log(`[SUCCESS] Cupos restantes: ${cuposRestantes}`);

        return {
            success: true,
            status: 'confirmed',
            inscripcionId: inscripcion.id,
            cuposRestantes,
        };

    } catch (error) {
        await transaction.rollback();

        console.log('--- INSCRIPCIÓN FINALIZADA (FALLIDA) ---');
        console.log(`[FAILURE] No se pudo inscribir a '${estudianteNombre}'.`);
        console.log(`[FAILURE] Razón: ${error.message}`);

        throw error;
    }
}
  shouldRetry(error) {
    // Determinar si el error es recuperable
    const retryableErrors = [
      'SequelizeConnectionError',
      'SequelizeConnectionTimedOutError',
      'SequelizeHostNotReachableError',
      'SequelizeConnectionRefusedError',
      'SequelizeTimeoutError'
    ];

    const isRetryableError = retryableErrors.includes(error.name) || 
                           error.message.includes('connection') ||
                           error.message.includes('timeout') ||
                           error.message.includes('ECONNRESET');

    console.log(`🔄 ¿Error recuperable? ${isRetryableError} (${error.name})`);
    return isRetryableError;
  }
}

module.exports = TaskProcessor;