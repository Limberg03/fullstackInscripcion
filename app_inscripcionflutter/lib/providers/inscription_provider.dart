// lib/providers/inscription_provider.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../api_service.dart';
import '../models/grupo_materia.dart';

class InscriptionProvider with ChangeNotifier {
  List<GrupoMateria> _grupos = [];
  List<GrupoMateria> get grupos => _grupos;

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  Future<void> fetchData(int studentId, int materiaId) async {
    _isLoading = true;
     _grupos = []; 
    notifyListeners();

    try {
      // Leer tareas pendientes de SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      final pendingTasksJson = prefs.getString('pendingInscriptions') ?? '{}';
      final Map<String, dynamic> pendingTasks = json.decode(pendingTasksJson);

      // Cargar datos de la API en paralelo
      final [gruposData as List<GrupoMateria>, inscripcionesData as List<dynamic>] = await Future.wait([
  ApiService.getGruposMateria(materiaId),
  ApiService.getInscripcionesByEstudiante(studentId),
]);
      final enrolledGroupIds = inscripcionesData.map((insc) => insc['grupoMateria']['id']).toSet();

      // Mapear y asignar estados
      _grupos = gruposData.map((grupo) {
        if (enrolledGroupIds.contains(grupo.id)) {
          grupo.status = InscriptionStatus.confirmed;
        } else if (pendingTasks.containsKey(grupo.id.toString())) {
          grupo.status = InscriptionStatus.pending;
          grupo.pendingTaskInfo = pendingTasks[grupo.id.toString()];
        } else if (grupo.cupo <= 0) {
          grupo.status = InscriptionStatus.full;
        } else {
          grupo.status = InscriptionStatus.idle;
        }
        return grupo;
      }).toList();

    } catch (e) {
      print(e); // Manejo de errores
    }

    _isLoading = false;
    notifyListeners();
  }
  
void updateStateAfterRequest(int grupoMateriaId, Map<String, dynamic> result) async {
  final grupo = _grupos.firstWhere((g) => g.id == grupoMateriaId);
  
  print('[Provider] Actualizando estado a PENDIENTE.');
  
  final prefs = await SharedPreferences.getInstance();
  final pendingTasksJson = prefs.getString('pendingInscriptions') ?? '{}';
  final Map<String, dynamic> pendingTasks = json.decode(pendingTasksJson);
  
  pendingTasks[grupoMateriaId.toString()] = {
    'taskId': result['taskId'],
    'queueName': result['queueName'],
  };
  
  await prefs.setString('pendingInscriptions', json.encode(pendingTasks));
  
  grupo.pendingTaskInfo = pendingTasks[grupoMateriaId.toString()];
  grupo.status = InscriptionStatus.pending;
  notifyListeners();
}

void updateStateToRejected(int grupoMateriaId) {
  final grupo = _grupos.firstWhere((g) => g.id == grupoMateriaId);
  
  print('[Provider] Actualizando estado a RECHAZADO.');
  
  grupo.status = InscriptionStatus.rejected;
  notifyListeners();
}

void updateStateToLoading(int grupoMateriaId) {
  final grupo = _grupos.firstWhere((g) => g.id == grupoMateriaId);
  grupo.status = InscriptionStatus.loading;
  notifyListeners();
}

  // Método para actualizar el estado final de una tarjeta (lo llamará el widget)
  void setFinalState(int grupoMateriaId, InscriptionStatus finalStatus) {
    final grupo = _grupos.firstWhere((g) => g.id == grupoMateriaId);
    grupo.status = finalStatus;
    notifyListeners();
  }
}