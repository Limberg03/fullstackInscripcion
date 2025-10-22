// lib/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models/grupo_materia.dart';

class ApiService {
  // static const String _baseUrl = 'http://10.0.2.2:3000';
  // static const String _baseUrl = 'http://192.168.1.9:3000';
   static const String _baseUrl = 'http://localhost:3000';

  static Future<List<Materia>> getMaterias() async {
    final url = Uri.parse('$_baseUrl/materias'); 
    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        // Usamos el constructor actualizado de Materia
        return data.map((json) => Materia.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load materias');
      }
    } catch (e) {
      print('Error en getMaterias: ${e.toString()}');
      rethrow;
    }
  }

  static Future<List<GrupoMateria>> getGruposMateria(int materiaId) async {
    final url = Uri.parse('$_baseUrl/grupos-materia?materiaId=$materiaId');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body)['data'];
      return data.map((json) => GrupoMateria.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load grupos for materia $materiaId');
    }
  }

  static Future<List<dynamic>> getInscripcionesByEstudiante(
    int estudianteId,
  ) async {
    final url = Uri.parse('$_baseUrl/inscripciones/estudiante/$estudianteId');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return json.decode(response.body)['data'];
    } else {
      return []; 
    }
  }

   static Future<Map<String, dynamic>> requestSeat(int estudianteId, int grupoMateriaId) async {
    final url = Uri.parse('$_baseUrl/inscripciones/request');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'estudianteId': estudianteId, 'grupoMateriaId': grupoMateriaId}),
      );

      
      if (response.statusCode == 202) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Error desconocido del servidor');
      }
    } catch (e) {
      print('Error en ApiService.requestSeat: ${e.toString()}');
      rethrow; // Relanzamos el error para que el provider lo atrape
    }
  
  }

  static Future<Map<String, dynamic>> getTaskStatus(
    String queueName,
    String taskId,
  ) async {
    final url = Uri.parse('$_baseUrl/queue/$queueName/tasks/$taskId');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return json.decode(response.body)['task'];
    } else {
      throw Exception('Failed to get task status');
    }
  }
}
