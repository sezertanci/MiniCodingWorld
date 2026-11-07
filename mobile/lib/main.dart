import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'game_page.dart';

const String appTitle = 'Mini Kodlama Dünyası';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Tam ekran: durum ve gezinme çubukları gizlenir, kenardan kaydırınca geçici olarak görünür.
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  runApp(const MiniKodlamaApp());
}

class MiniKodlamaApp extends StatelessWidget {
  const MiniKodlamaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: appTitle,
      debugShowCheckedModeBanner: false,
      home: GamePage(),
    );
  }
}
