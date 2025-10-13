// lib/providers/auth_provider.dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider with ChangeNotifier {
  int? _currentStudentId;
  int? get currentStudentId => _currentStudentId;

  AuthProvider() {
    _loadStudentId(); // Cargar el ID al iniciar
  }

  Future<void> _loadStudentId() async {
    final prefs = await SharedPreferences.getInstance();
    // Verificamos si la clave existe antes de leerla
    if (prefs.containsKey('currentStudentId')) {
      _currentStudentId = prefs.getInt('currentStudentId');
    } else {
      _currentStudentId = 3; // Valor por defecto si no hay nada guardado
    }
    notifyListeners();
  }

  Future<void> _saveStudentId(int id) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('currentStudentId', id);
  }

  void login(int studentId) {
    if (studentId > 0) {
      _currentStudentId = studentId;
      _saveStudentId(studentId);
      notifyListeners();
    }
  }

   Future<void> hardReset() async {
    final prefs = await SharedPreferences.getInstance();
    // Borra TODOS los datos guardados por la app en el dispositivo
    await prefs.clear();
    print("SharedPreferences ha sido limpiado.");
    
    // Forzamos la recarga del estado, lo que hará que vuelva al ID por defecto (3)
    await _loadStudentId(); 
  }
  
}