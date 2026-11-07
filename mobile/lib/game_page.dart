import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'home_route.dart';

/// tools/build-mobile-asset.js ile üretilen tek dosyalık oyun.
const String gameAssetPath = 'assets/game.html';

/// Oyunu tam ekran bir WebView içinde gösterir.
class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  // Oyun file:///android_asset/... adresinden açılır. Adres her açılışta aynı olduğu için
  // localStorage (ilerleme kaydı) uygulama kapatılıp açılınca da korunur.
  late final WebViewController _controller = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    ..loadFlutterAsset(gameAssetPath);

  /// Android geri tuşu: oyunda bir önceki ekrana döner, ana ekranda uygulamadan çıkar.
  Future<void> _handleBack() async {
    final url = await _controller.currentUrl();
    if (!isHomeRoute(url) && await _controller.canGoBack()) {
      await _controller.goBack();
      return;
    }
    await SystemNavigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) {
          _handleBack();
        }
      },
      child: Scaffold(body: WebViewWidget(controller: _controller)),
    );
  }
}
