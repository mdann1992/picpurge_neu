import { Platform } from "react-native";
import mobileAds, {
  BannerAd,
  BannerAdSize,
  MaxAdContentRating,
  TestIds,
  AppOpenAd,
  InterstitialAd,
  AdEventType,
} from "react-native-google-mobile-ads";

class AdService {
  static getBannerAd(): import("react").ReactNode {
    return (
      <BannerAd
        unitId={this.getBannerAdUnitId()}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    );
  }

  static appOpenAd: AppOpenAd | null = null;
  static interstitialAd: InterstitialAd | null = null;

  static startAppOpenAd(): void {
    const adUnitId = this.getBannerAppStartAdUnitId();

    // Erstellen der AppOpenAd
    this.appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Laden der AppOpenAd
    this.appOpenAd.load();

    // Warte auf das Event, dass die Anzeige geladen ist und zeige sie dann an
    const checkAdLoaded = setInterval(() => {
      if (this.appOpenAd && this.appOpenAd.loaded) {
        this.appOpenAd.show();
        clearInterval(checkAdLoaded); // Stoppe den Check, nachdem die Anzeige gezeigt wurde
      }
    }, 500); // Überprüfe alle 500ms, ob die Anzeige geladen ist
  }

  static startInterstitial(onClosed?: () => void): void {
    const adUnitId = this.getBannerInterstitialAdUnitId();

    // Erstellen der InterstitialAd
    this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let hasFinished = false;
    const finish = () => {
      if (hasFinished) {
        return;
      }
      hasFinished = true;
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      onClosed?.();
    };

    const unsubscribeLoaded = this.interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        this.interstitialAd?.show();
      },
    );
    const unsubscribeClosed = this.interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        finish();
      },
    );
    const unsubscribeError = this.interstitialAd.addAdEventListener(
      AdEventType.ERROR,
      () => {
        finish();
      },
    );

    // Laden der InterstitialAd
    this.interstitialAd.load();

    // Fallback, falls keine Events kommen
    setTimeout(() => {
      finish();
    }, 6000);
  }

  static getBannerInterstitialAdUnitId(): string {
    if (Platform.OS === "android") {
      return "ca-app-pub-5609900560713643/2051540810"; // Ersetzen Sie dies durch Ihre eigene Android-Anzeigen-ID
    } else if (Platform.OS === "ios") {
      return "ca-app-pub-5609900560713643/5060847536"; // Ersetzen Sie dies durch Ihre eigene iOS-Anzeigen-ID
    } else {
      return TestIds.BANNER; // Test-ID für andere Plattformen oder während der Entwicklung
    }
  }

  static getBannerAdUnitId(): string {
    if (Platform.OS === "android") {
      return "ca-app-pub-5609900560713643/2036680361"; // Ersetzen Sie dies durch Ihre eigene Android-Anzeigen-ID
    } else if (Platform.OS === "ios") {
      return "ca-app-pub-5609900560713643/1940515432"; // Ersetzen Sie dies durch Ihre eigene iOS-Anzeigen-ID
    } else {
      return TestIds.BANNER; // Test-ID für andere Plattformen oder während der Entwicklung
    }
  }

  static getBannerAppStartAdUnitId(): string {
    if (Platform.OS === "android") {
      return "ca-app-pub-5609900560713643/8163895312"; // Ersetzen Sie dies durch Ihre eigene Android-Anzeigen-ID
    } else if (Platform.OS === "ios") {
      return "ca-app-pub-5609900560713643/9476976982"; // Ersetzen Sie dies durch Ihre eigene iOS-Anzeigen-ID
    } else {
      return TestIds.BANNER; // Test-ID für andere Plattformen oder während der Entwicklung
    }
  }
  static initializeAds() {
    mobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
      })
      .then(() => {
        // Request config successfully set!
      });

    mobileAds()
      .initialize()
      .then((adapterStatuses) => {
        // AdMob init
        console.log("AdMob initialized", adapterStatuses);
      });
  }
}

export default AdService;
