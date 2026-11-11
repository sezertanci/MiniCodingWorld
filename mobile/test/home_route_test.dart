import 'package:flutter_test/flutter_test.dart';
import 'package:minicodingworld/home_route.dart';

const String pageUrl = 'file:///android_asset/flutter_assets/assets/game.html';

void main() {
  group('isHomeRoute', () {
    test('isHomeRoute_NullUrl_ReturnsTrue', () {
      expect(isHomeRoute(null), isTrue);
    });

    test('isHomeRoute_NoHash_ReturnsTrue', () {
      expect(isHomeRoute(pageUrl), isTrue);
    });

    test('isHomeRoute_HomeHash_ReturnsTrue', () {
      expect(isHomeRoute('$pageUrl#/'), isTrue);
    });

    test('isHomeRoute_LevelSelectHash_ReturnsFalse', () {
      expect(isHomeRoute('$pageUrl#/game/path-finder'), isFalse);
    });

    test('isHomeRoute_PlayHashWithTrailingSlash_ReturnsFalse', () {
      expect(isHomeRoute('$pageUrl#/game/repeat/level/3/'), isFalse);
    });
  });
}
