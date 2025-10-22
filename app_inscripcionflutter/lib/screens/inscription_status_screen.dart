import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../api_service.dart';

class InscriptionStatusScreen extends StatefulWidget {
  final String taskId;
  final String queueName;

  final String? grupoNombre;
  final String? materiaNombre;

  const InscriptionStatusScreen({
    super.key,
    required this.taskId,
    required this.queueName,
    this.grupoNombre,
    this.materiaNombre,
  });

  @override
  State<InscriptionStatusScreen> createState() => _InscriptionStatusScreenState();
}

class _InscriptionStatusScreenState extends State<InscriptionStatusScreen> {
  Timer? _pollingTimer;
  Map<String, dynamic>? _taskData;
  bool _isLoading = false;
  bool _hasStartedChecking = false;

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _checkStatus() async {
    setState(() {
      _isLoading = true;
      _hasStartedChecking = true;
    });

    try {
      final task = await ApiService.getTaskStatus(widget.queueName, widget.taskId);
      
      if (task['status'] == 'completed' || task['status'] == 'failed' || task['status'] == 'error') {
        _updateTaskData(task);
      } else {
        _updateTaskData(task);
        _startPolling();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _taskData = {'status': 'error', 'error': 'No se pudo encontrar la tarea en la cola.'};
        });
      }
    }
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    
    int pollingCount = 0;
    const int maxPolling = 20; // Límite: 20 intentos * 3 segundos = 60 segundos de timeout

    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      
      if (pollingCount >= maxPolling) {
        timer.cancel(); // Detener el polling
        if (mounted) {
          setState(() {
            _isLoading = false;
            _taskData = {
              'status': 'error', 
              'error': 'La operación está tardando más de lo esperado. Por favor, intenta de nuevo más tarde.'
            };
          });
        }
        return; 
      }
      
      pollingCount++; 

      try {
        final task = await ApiService.getTaskStatus(widget.queueName, widget.taskId);
        _updateTaskData(task);

        if (task['status'] == 'completed' || task['status'] == 'failed' || task['status'] == 'error') {
          timer.cancel(); // Detener el polling si se obtiene un estado final
        }
      } catch (e) {
        timer.cancel();
        if (mounted) {
          setState(() {
            _isLoading = false;
            _taskData = {'status': 'error', 'error': 'Se perdió la conexión al verificar el estado.'};
          });
        }
      }
    });
  }

  void _updateTaskData(Map<String, dynamic> task) {
    if (mounted) {
      setState(() {
        _isLoading = false;
        _taskData = task;
      });
    }
  }

  String _extractErrorMessage(Map<String, dynamic> task) {
    
    String defaultMessage = 'No se pudo completar la inscripción: '
                            'el grupo "${widget.grupoNombre ?? 'seleccionado'}" no tiene cupos disponibles.';
    // Verificamos si existe el campo 'error'
    if (task['error'] == null) {
      return defaultMessage;
    }

    final errorData = task['error'];
    
    // Caso 1: Si 'error' ya es un String simple
    if (errorData is String) {
      if (errorData.isEmpty) return defaultMessage;
      
      // Intentamos decodificar como JSON
      try {
        final errorJson = json.decode(errorData);
        
        // Si tiene el campo 'message', lo usamos
        if (errorJson is Map && errorJson['message'] != null) {
          return errorJson['message'].toString();
        }
        
        // Si es un objeto con otros campos, intentamos mostrar algo útil
        if (errorJson is Map && errorJson.isNotEmpty) {
          return errorJson.values.first.toString();
        }
        
        return errorData; // Si no pudimos extraer nada mejor, retornamos el string original
      } catch (_) {
        // No es JSON, retornamos el string directamente
        return errorData;
      }
    }
    
    // Caso 2: Si 'error' ya es un Map
    if (errorData is Map) {
      if (errorData['message'] != null) {
        return errorData['message'].toString();
      }
      if (errorData.isNotEmpty) {
        return errorData.values.first.toString();
      }
    }
    
    return defaultMessage;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Proceso de Inscripción'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: _buildContent(),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (!_hasStartedChecking) {
      return _buildInitialView();
    }
    if (_isLoading) {
      return const SpinKitPouringHourGlass(color: Colors.indigo, size: 60.0);
    }
    if (_taskData != null) {
      return _buildStatusView(_taskData!);
    }
    return _buildInitialView();
  }

  Widget _buildInitialView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.touch_app_outlined, size: 48, color: Colors.grey),
        const SizedBox(height: 16),
        const Text('Inscripción Iniciada', style: TextStyle(fontSize: 18)),
        const SizedBox(height: 32),
        ElevatedButton.icon(
          icon: const Icon(Icons.search),
          label: const Text('Consulta tu estado de inscripción'),
          onPressed: _checkStatus,
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          ),
        )
      ],
    );
  }

  Widget _buildStatusView(Map<String, dynamic> task) {
    switch (task['status']) {
      case 'pending':
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SpinKitFadingCircle(color: Colors.orange.shade700, size: 60.0),
            const SizedBox(height: 24),
            Text(
              'Pendiente...',
              style: TextStyle(fontSize: 22, color: Colors.orange.shade700),
            ),
            const SizedBox(height: 16),
            const Text(
              'Tu solicitud está en la cola y será procesada en breve.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ],
        );

      case 'completed':
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, size: 72, color: Colors.green),
            const SizedBox(height: 16),
            const Text(
              'Inscrito Exitosamente',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
            const SizedBox(height: 32),
            OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Volver a las Materias'),
            ),
          ],
        );

      case 'failed':
      case 'error':
        final errorMessage = _extractErrorMessage(task);
        
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cancel, size: 72, color: Colors.red),
            const SizedBox(height: 16),
            const Text(
              'Inscripción Rechazada',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.info_outline, color: Colors.red.shade700, size: 20),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      errorMessage,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.red.shade900,
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            OutlinedButton.icon(
              icon: const Icon(Icons.arrow_back),
              label: const Text('Volver e Intentar de Nuevo'),
              onPressed: () => Navigator.of(context).pop(),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        );

      default:
        return Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.help_outline, size: 72, color: Colors.grey),
            const SizedBox(height: 16),
            Text(
              'Estado desconocido: ${task['status']}',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        );
    }
  }
}