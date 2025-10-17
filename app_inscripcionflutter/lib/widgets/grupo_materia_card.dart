import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

import '../models/grupo_materia.dart';
import '../providers/auth_provider.dart';
import '../providers/inscription_provider.dart';
import '../screens/inscription_status_screen.dart';

import '../api_service.dart';




class GrupoMateriaCard extends StatefulWidget {
  final GrupoMateria grupo;
  const GrupoMateriaCard({super.key, required this.grupo});

  @override
  State<GrupoMateriaCard> createState() => _GrupoMateriaCardState();
}

class _GrupoMateriaCardState extends State<GrupoMateriaCard> {
  late InscriptionStatus _currentStatus;
  Timer? _pollingTimer;
  Map<String, dynamic>? _pendingTaskInfo;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.grupo.status;
    _pendingTaskInfo = widget.grupo.pendingTaskInfo;
    
    if (_currentStatus == InscriptionStatus.pending) {
      _startPolling();
    }
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    print('INICIANDO POLLING para el grupo: ${widget.grupo.materia.nombre} - ${widget.grupo.grupo}');

    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      final taskInfo = _pendingTaskInfo;
      if (taskInfo == null) {
        print('ERROR DE POLLING: No hay info de la tarea. Cancelando timer.');
        timer.cancel();
        return;
      }

      try {
        final task = await ApiService.getTaskStatus(
          taskInfo['queueName'],
          taskInfo['taskId'],
        );

        if (task['status'] == 'completed' || task['status'] == 'failed' || task['status'] == 'error') {
          print('!!! ESTADO FINAL DETECTADO: "${task['status']}". Deteniendo sondeo y actualizando UI.');
          
          timer.cancel();
          
          final prefs = await SharedPreferences.getInstance();
          final pendingJson = prefs.getString('pendingInscriptions') ?? '{}';
          final Map<String, dynamic> pending = json.decode(pendingJson);
          pending.remove(widget.grupo.id.toString());
          await prefs.setString('pendingInscriptions', json.encode(pending));


          final finalStatus = task['status'] == 'completed' 
            ? InscriptionStatus.confirmed 
            : InscriptionStatus.rejected;
            
          if (mounted) {
            setState(() {
              _currentStatus = finalStatus;
            });
          }
        }
      } catch (e) {
        print('ERROR CRÍTICO DURANTE EL POLLING: ${e.toString()}');
      }
    });
  }

Future<void> _handleInscription() async {
  final authProvider = Provider.of<AuthProvider>(context, listen: false);
  final scaffoldMessenger = ScaffoldMessenger.of(context);
  final navigator = Navigator.of(context);
  final inscriptionProvider = Provider.of<InscriptionProvider>(context, listen: false);

  // ✅ Cambia el estado a loading a través del provider
  inscriptionProvider.updateStateToLoading(widget.grupo.id);
  setState(() { _currentStatus = InscriptionStatus.loading; });

  try {
    // ✅ UNA SOLA LLAMADA a la API
    final result = await ApiService.requestSeat(
      authProvider.currentStudentId!,
      widget.grupo.id,
    );
    
    // ✅ Actualiza el estado a PENDING con el resultado
    inscriptionProvider.updateStateAfterRequest(widget.grupo.id, result);

    // Navega a la pantalla de estado
    await navigator.push(
      MaterialPageRoute(
        builder: (context) => InscriptionStatusScreen(
          taskId: result['taskId'],
          queueName: result['queueName'],
          grupoNombre: widget.grupo.grupo,
          materiaNombre: widget.grupo.materia.nombre,
        ),
      ),
    );
    
    if(mounted){
      setState(() {
        _currentStatus = inscriptionProvider.grupos
          .firstWhere((g) => g.id == widget.grupo.id).status;
      });
    }
    
  } catch (e) {
    // ✅ Actualiza el estado a REJECTED en caso de error
    inscriptionProvider.updateStateToRejected(widget.grupo.id);
    
    if (mounted) { 
      setState(() { _currentStatus = InscriptionStatus.rejected; }); 
    }
    
    scaffoldMessenger.showSnackBar(SnackBar(
      content: Text(e.toString().replaceFirst('Exception: ', '')),
      backgroundColor: Colors.red,
    ));
  }
}

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: IntrinsicHeight(
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Colors.white, Colors.grey.shade50],
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header compacto
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.indigo.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.book_rounded,
                        color: Colors.indigo.shade700,
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            widget.grupo.materia.nombre,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey.shade900,
                              height: 1.2,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${widget.grupo.materia.sigla} • Grupo ${widget.grupo.grupo}',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey.shade600,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 8),
                
                // Info compacta
                _buildCompactInfo(
                  Icons.person_outline_rounded,
                  widget.grupo.docente.nombre,
                ),
                
                const SizedBox(height: 4),

                 _buildCompactInfo(
                  Icons.calendar_today_rounded,
                  'Día: ${widget.grupo.horario.dia}',
                ),
                
                const SizedBox(height: 4),
                
                _buildCompactInfo(
                  Icons.access_time_rounded,
                  'Hora: ${widget.grupo.horario.horaInicio.substring(0, 5)} - ${widget.grupo.horario.horaFin.substring(0, 5)}',
                ),
                
                
                _buildCompactInfo(
                  Icons.event_seat_rounded,
                  'Cupos: ${widget.grupo.cupo}',
                  color: widget.grupo.cupo > 0 
                    ? Colors.green.shade700 
                    : Colors.red.shade700,
                ),
                
                const SizedBox(height: 8),
                
                // Botón/Estado
                _buildButtonAndStatus(_currentStatus),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCompactInfo(IconData icon, String text, {Color? color}) {
    return Row(
      children: [
        Icon(icon, size: 14, color: Colors.grey.shade600),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color: color ?? Colors.grey.shade800,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildButtonAndStatus(InscriptionStatus status) {
    if (widget.grupo.cupo <= 0 && status == InscriptionStatus.idle) {
       return _buildInscriptionButton();
    }
    
    switch (status) {
      case InscriptionStatus.loading:
        return Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SpinKitThreeBounce(
              color: Colors.indigo.shade600,
              size: 20.0,
            ),
          ),
        );
      case InscriptionStatus.pending:
        return _buildCompactStatus(
          Colors.orange.shade700,
          Colors.orange.shade50,
          'Pendiente',
          Icons.hourglass_empty_rounded,
        );
      case InscriptionStatus.confirmed:
        return _buildCompactStatus(
          Colors.green.shade700,
          Colors.green.shade50,
          'Inscrito',
          Icons.check_circle_rounded,
        );
      case InscriptionStatus.rejected:
        return _buildCompactStatus(
          Colors.red.shade700,
          Colors.red.shade50,
          'Rechazado',
          Icons.cancel_rounded,
        );
      case InscriptionStatus.idle:
      default:
        return _buildInscriptionButton();
    }
  }

  Widget _buildInscriptionButton() {
    return SizedBox(
      width: double.infinity,
      height: 36,
      child: ElevatedButton(
        onPressed: _handleInscription,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.indigo.shade600,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          elevation: 0,
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.add_circle_outline, size: 16),
            SizedBox(width: 6),
            Text(
              'Inscribirse',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompactStatus(
    Color mainColor,
    Color backgroundColor,
    String label,
    IconData icon,
  ) {
    return Container(
      width: double.infinity,
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: mainColor.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: mainColor, size: 16),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: mainColor,
            ),
          ),
        ],
      ),
    );
  }
}