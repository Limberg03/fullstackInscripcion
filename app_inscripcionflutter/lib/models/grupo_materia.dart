// lib/models/grupo_materia.dart
import 'package:flutter/material.dart';

// Un enum para todos los estados posibles de la inscripción
enum InscriptionStatus { idle, loading, pending, confirmed, rejected, full }


class Horario {
  final String dia;
  final String horaInicio;
  final String horaFin;

  Horario({required this.dia, required this.horaInicio, required this.horaFin});

  factory Horario.fromJson(Map<String, dynamic> json) {
    // Si el horario es nulo en el JSON, devolvemos valores por defecto.
    if (json == null) {
      return Horario(dia: 'No definido', horaInicio: '--:--', horaFin: '--:--');
    }
    return Horario(
      dia: json['dia'] ?? 'No definido',
      horaInicio: json['horaInicio'] ?? '--:--',
      horaFin: json['horaFin'] ?? '--:--',
    );
  }
}

class GrupoMateria {
  final int id;
  final String grupo;
  final int cupo;
  final Materia materia;
  final Docente docente;
   final Horario horario;

  // Estos campos no vienen de la API, los manejaremos en el frontend
  InscriptionStatus status;
  Map<String, dynamic>? pendingTaskInfo;

  GrupoMateria({
    required this.id,
    required this.grupo,
    required this.cupo,
    required this.materia,
    required this.docente,
    required this.horario,
    this.status = InscriptionStatus.idle, // Estado inicial por defecto
    
    this.pendingTaskInfo,
  });

  factory GrupoMateria.fromJson(Map<String, dynamic> json) {
    return GrupoMateria(
      id: json['id'],
      grupo: json['grupo'],
      cupo: json['cupo'],
      materia: Materia.fromJson(json['materia']),
      docente: Docente.fromJson(json['docente']),
      horario: Horario.fromJson(json['horario']),
    );
  }
}

class Materia {
  final int id;
  final String nombre;
  final String sigla;
 final int creditos;
  final String nivel;

  Materia({required this.id, required this.nombre, required this.sigla,required this.creditos,
    required this.nivel});
  factory Materia.fromJson(Map<String, dynamic> json) {
    return Materia(id: json['id'], 
    nombre: json['nombre'], 
    sigla: json['sigla'], 
    creditos: json['creditos'] ?? 0,
    nivel: json['nivel']?['nombre'] ?? 'Nivel no definido', 
    );
  }
}

class Docente {
  final int id;
  final String nombre;
  Docente({required this.id, required this.nombre});
  factory Docente.fromJson(Map<String, dynamic> json) {
    return Docente(id: json['id'], nombre: json['nombre']);
  }
}