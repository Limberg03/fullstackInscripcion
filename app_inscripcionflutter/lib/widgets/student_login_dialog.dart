// lib/widgets/student_login_dialog.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

void showStudentLoginDialog(BuildContext context) {
  final TextEditingController controller = TextEditingController();
  final authProvider = Provider.of<AuthProvider>(context, listen: false);

  final scaffoldMessenger = ScaffoldMessenger.of(context);

  showDialog(
    context: context,
    builder: (ctx) {
      return AlertDialog(
        title: const Text('Cambiar Estudiante'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'ID del Estudiante',
            hintText: 'Ej: 1, 2, 3...',
          ),
        ),
        actions: [
          TextButton(
            child: const Text('Cancelar'),
            onPressed: () => Navigator.of(ctx).pop(),
          ),
          ElevatedButton(
            child: const Text('Cambiar'),
            onPressed: () {
              final id = int.tryParse(controller.text);
              if (id != null && id > 0) {
                Navigator.of(ctx).pop();
                authProvider.login(id);
                
                // ✅ REEMPLAZO DE FLUTTERTOAST
                scaffoldMessenger.showSnackBar(
                  SnackBar(
                    content: Text("Cargando datos del Estudiante ID: $id"),
                    duration: const Duration(seconds: 2),
                  ),
                );

              } else {
                // ✅ REEMPLAZO DE FLUTTERTOAST
                 scaffoldMessenger.showSnackBar(
                  const SnackBar(
                    content: Text("Por favor, ingrese un ID válido."),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
          ),
        ],
      );
    },
  );
}