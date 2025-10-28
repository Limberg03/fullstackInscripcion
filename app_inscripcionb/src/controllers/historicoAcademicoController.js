const {
  HistoricoAcademico,
  Estudiante,
  Materia,
  Carrera,
  Nivel,
} = require("../models");
const { Op } = require("sequelize");

class HistoricoAcademicoController {
  // Obtener histórico completo de un estudiante
  async getByEstudiante(req, res) {
    try {
      const { estudianteId } = req.params;
      const { periodo, estado } = req.query;

      const where = { estudianteId };
      if (periodo) where.periodo = periodo;
      if (estado) where.estado = estado;

      const historico = await HistoricoAcademico.findAll({
        where,
        include: [
          {
            model: Materia,
            as: "materia",
            attributes: ["id", "nombre", "sigla", "creditos"],
            include: [
              {
                model: Nivel,
                as: "nivel",
                attributes: ["id", "nombre"],
              },
            ],
          },
          {
            model: Carrera,
            as: "carrera",
            attributes: ["id", "nombre", "codigo"],
          },
        ],
        order: [
          ["gestion", "DESC"],
          ["periodo", "DESC"],
          ["nivel", "DESC"],
        ],
      });

      // Calcular estadísticas
      const aprobadas = historico.filter((h) => h.estado === "APROBADO").length;
      const reprobadas = historico.filter(
        (h) => h.estado === "REPROBADO"
      ).length;
      const creditosAprobados = historico
        .filter((h) => h.estado === "APROBADO")
        .reduce((sum, h) => sum + h.creditos, 0);

      // ✅ CORREGIDO - Cuenta TODAS las notas (aprobadas y reprobadas)
      const totalNotas = historico
        .filter((h) => h.nota !== null && h.nota !== undefined) // Solo las que tienen nota
        .reduce((sum, h) => sum + parseFloat(h.nota), 0);

      const materiasConNota = historico.filter(
        (h) => h.nota !== null && h.nota !== undefined
      ).length;
      const ppac =
        materiasConNota > 0 ? (totalNotas / materiasConNota).toFixed(2) : 0;

      res.json({
        success: true,
        data: {
          historico,
          estadisticas: {
            totalMaterias: historico.length,
            aprobadas,
            reprobadas,
            creditosAprobados,
            ppac: parseFloat(ppac),
            porcentajeAprobacion:
              historico.length > 0
                ? ((aprobadas / historico.length) * 100).toFixed(2)
                : 0,
          },
        },
      });
    } catch (error) {
      console.error("Error al obtener histórico:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener histórico académico",
        error: error.message,
      });
    }
  }

  // Obtener histórico agrupado por periodo
  async getByEstudiantePorPeriodo(req, res) {
    try {
      const { estudianteId } = req.params;

      const historico = await HistoricoAcademico.findAll({
        where: { estudianteId },
        include: [
          {
            model: Materia,
            as: "materia",
            attributes: ["id", "nombre", "sigla", "creditos"],
            include: [
              {
                model: Nivel,
                as: "nivel",
                attributes: ["id", "nombre"],
              },
            ],
          },
          {
            model: Carrera,
            as: "carrera",
            attributes: ["id", "nombre", "codigo"],
          },
        ],
        order: [
          ["gestion", "ASC"],
          ["periodo", "ASC"],
        ],
      });

      // Agrupar por periodo
      const porPeriodo = historico.reduce((acc, item) => {
        const periodo = item.periodo;
        if (!acc[periodo]) {
          acc[periodo] = {
            periodo,
            gestion: item.gestion,
            materias: [],
            estadisticas: {
              totalMaterias: 0,
              aprobadas: 0,
              reprobadas: 0,
              creditosInscritos: 0,
              creditosAprobados: 0,
              promedio: 0,
            },
          };
        }

        acc[periodo].materias.push(item);
        acc[periodo].estadisticas.totalMaterias++;
        acc[periodo].estadisticas.creditosInscritos += item.creditos;

        if (item.estado === "APROBADO") {
          acc[periodo].estadisticas.aprobadas++;
          acc[periodo].estadisticas.creditosAprobados += item.creditos;
        } else if (item.estado === "REPROBADO") {
          acc[periodo].estadisticas.reprobadas++;
        }

        return acc;
      }, {});

      // Calcular promedios por periodo
      Object.values(porPeriodo).forEach((periodo) => {
        const materiasAprobadas = periodo.materias.filter(
          (m) => m.estado === "APROBADO"
        );
        if (materiasAprobadas.length > 0) {
          const sumaNotas = materiasAprobadas.reduce(
            (sum, m) => sum + parseFloat(m.nota),
            0
          );
          periodo.estadisticas.promedio = (
            sumaNotas / materiasAprobadas.length
          ).toFixed(2);
        }
      });

      res.json({
        success: true,
        data: Object.values(porPeriodo),
      });
    } catch (error) {
      console.error("Error al obtener histórico por periodo:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener histórico por periodo",
        error: error.message,
      });
    }
  }

  // Verificar si un estudiante cumple prerequisitos para una materia
  async verificarPrerequisitos(req, res) {
    try {
      const { estudianteId, materiaId } = req.params;

      // Obtener prerequisitos de la materia
      const { Prerequisito } = require("../models");
      const prerequisitos = await Prerequisito.findAll({
        where: { materiaId },
        include: [
          {
            model: Materia,
            as: "materiaRequerida",
            attributes: ["id", "nombre", "sigla"],
          },
        ],
      });

      if (prerequisitos.length === 0) {
        return res.json({
          success: true,
          cumple: true,
          message: "Esta materia no tiene prerequisitos",
          prerequisitos: [],
        });
      }

      // Verificar cada prerequisito
      const verificacion = await Promise.all(
        prerequisitos.map(async (prereq) => {
          const registro = await HistoricoAcademico.findOne({
            where: {
              estudianteId,
              materiaId: prereq.requiereId,
              estado: "APROBADO",
              nota: { [Op.gte]: prereq.notaMinima },
            },
            include: [
              {
                model: Materia,
                as: "materia",
                attributes: ["id", "nombre", "sigla"],
              },
            ],
          });

          return {
            materiaRequerida: prereq.materiaRequerida,
            notaMinima: prereq.notaMinima,
            cumple: registro !== null,
            notaObtenida: registro ? parseFloat(registro.nota) : null,
            periodo: registro ? registro.periodo : null,
          };
        })
      );

      const cumpleTodos = verificacion.every((v) => v.cumple);

      res.json({
        success: true,
        cumple: cumpleTodos,
        prerequisitos: verificacion,
        message: cumpleTodos
          ? "Cumple con todos los prerequisitos"
          : "No cumple con algunos prerequisitos",
      });
    } catch (error) {
      console.error("Error al verificar prerequisitos:", error);
      res.status(500).json({
        success: false,
        message: "Error al verificar prerequisitos",
        error: error.message,
      });
    }
  }

  // Crear registro en histórico
  async create(req, res) {
    try {
      const historico = await HistoricoAcademico.create(req.body);

      const historicoCompleto = await HistoricoAcademico.findByPk(
        historico.id,
        {
          include: [
            {
              model: Estudiante,
              as: "estudiante",
              attributes: ["id", "registro", "nombre"],
            },
            {
              model: Materia,
              as: "materia",
              attributes: ["id", "nombre", "sigla", "creditos"],
            },
            {
              model: Carrera,
              as: "carrera",
              attributes: ["id", "nombre", "codigo"],
            },
          ],
        }
      );

      res.status(201).json({
        success: true,
        message: "Registro académico creado exitosamente",
        data: historicoCompleto,
      });
    } catch (error) {
      console.error("Error al crear registro:", error);
      res.status(500).json({
        success: false,
        message: "Error al crear registro académico",
        error: error.message,
      });
    }
  }

  // Actualizar registro
  async update(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await HistoricoAcademico.update(req.body, {
        where: { id },
      });

      if (updated === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      const historicoActualizado = await HistoricoAcademico.findByPk(id, {
        include: [
          { model: Estudiante, as: "estudiante" },
          { model: Materia, as: "materia" },
          { model: Carrera, as: "carrera" },
        ],
      });

      res.json({
        success: true,
        message: "Registro actualizado exitosamente",
        data: historicoActualizado,
      });
    } catch (error) {
      console.error("Error al actualizar registro:", error);
      res.status(500).json({
        success: false,
        message: "Error al actualizar registro",
        error: error.message,
      });
    }
  }

  // Eliminar registro
  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await HistoricoAcademico.destroy({
        where: { id },
      });

      if (deleted === 0) {
        return res.status(404).json({
          success: false,
          message: "Registro no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Registro eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      res.status(500).json({
        success: false,
        message: "Error al eliminar registro",
        error: error.message,
      });
    }
  }
}

module.exports = new HistoricoAcademicoController();
