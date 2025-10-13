// lib/screens/inscription_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/inscription_provider.dart';
import '../widgets/grupo_materia_card.dart';
import '../widgets/student_login_dialog.dart';

class InscriptionScreen extends StatefulWidget {
  const InscriptionScreen({super.key});

  @override
  State<InscriptionScreen> createState() => _InscriptionScreenState();
}

class _InscriptionScreenState extends State<InscriptionScreen> {
  int? _lastFetchedStudentId;

  // Este método se llama cuando el widget se inserta en el árbol por primera vez
  // y cada vez que sus dependencias (como los Providers) cambian.
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final authProvider = Provider.of<AuthProvider>(context);
    final inscriptionProvider = Provider.of<InscriptionProvider>(context, listen: false);

    // Verificamos si el ID del estudiante ha cambiado para volver a cargar los datos.
    if (authProvider.currentStudentId != null &&
        authProvider.currentStudentId != _lastFetchedStudentId) {
      _lastFetchedStudentId = authProvider.currentStudentId;
      // Usamos un post-frame callback para asegurar que el build inicial haya terminado.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        inscriptionProvider.fetchData(authProvider.currentStudentId!);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Escuchamos los cambios en ambos providers
    final authProvider = context.watch<AuthProvider>();
    final inscriptionProvider = context.watch<InscriptionProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sistema de Inscripción'),
        actions: [

 IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refrescar Datos',
            onPressed: () {
              if (authProvider.currentStudentId != null) {
                // Obtenemos el provider sin escuchar para poder llamar a su método
                final inscriptions = Provider.of<InscriptionProvider>(context, listen: false);
                // Llamamos a la función que recarga TODOS los datos del servidor
                inscriptions.fetchData(authProvider.currentStudentId!);
                
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Actualizando datos..."), duration: Duration(seconds: 1)),
                );
              }
            },
          ),

IconButton(
            icon: const Icon(Icons.delete_forever),
            tooltip: 'Resetear Estado del Frontend',
            onPressed: () {
              // Es una buena práctica pedir confirmación antes de una acción destructiva
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Confirmar Reseteo'),
                  content: const Text(
                      'Esto limpiará todos los datos locales de la app (sesión y tareas pendientes). ¿Continuar?'),
                  actions: [
                    TextButton(
                      child: const Text('Cancelar'),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                    FilledButton(
                      child: const Text('Resetear'),
                      onPressed: () {
                        // Llama al método del provider y cierra el diálogo
                        Provider.of<AuthProvider>(context, listen: false).hardReset();
                        Navigator.of(ctx).pop();
                      },
                    ),
                  ],
                ),
              );
            },
          ),


          if (authProvider.currentStudentId != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Center(child: Text('Estudiante ID: ${authProvider.currentStudentId}')),
            ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () {
              showStudentLoginDialog(context); // Muestra el modal para cambiar de estudiante
            },
          ),
        ],
      ),
      body: inscriptionProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => inscriptionProvider.fetchData(authProvider.currentStudentId!),
              child: GridView.builder(
                padding: const EdgeInsets.all(10.0),
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 400,
                  childAspectRatio: 3 / 2.2,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                itemCount: inscriptionProvider.grupos.length,
                itemBuilder: (ctx, i) => GrupoMateriaCard(
                  // Pasamos el objeto completo a la tarjeta
                  grupo: inscriptionProvider.grupos[i],
                ),
              ),
            ),
    );
  }
}