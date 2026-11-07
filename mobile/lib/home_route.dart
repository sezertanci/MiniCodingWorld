/// Verilen WebView adresinin oyunun ana ekranı olup olmadığını söyler.
///
/// Oyun ekranları adresin `#/...` kısmında tutulur (js/core/router.js):
/// ana ekran `#/` ya da boş, diğer ekranlar `#/game/<oyun>` gibidir.
/// Adres bilinmiyorsa ana ekran kabul edilir; böylece geri tuşu uygulamadan çıkar.
bool isHomeRoute(String? url) {
  if (url == null) {
    return true;
  }
  final path = Uri.parse(url).fragment.replaceAll(RegExp(r'^/|/$'), '');
  return path.isEmpty;
}
