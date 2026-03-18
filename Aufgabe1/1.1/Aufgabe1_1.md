# Hybrid App – Steckbrief

## Kurzbeschreibung

Eine Hybrid App ist eine Anwendung, die mit Web-Technologien (HTML, CSS, JavaScript) entwickelt wird und anschliessend in einer nativen **WebView-Hülle** für verschiedene Plattformen verpackt wird. Sie kombiniert die Flexibilität von Web-Entwicklung mit der Verteilung über App-Stores.

---

## Typische Technologien

| Kategorie     | Beispiele                                      |
|---------------|------------------------------------------------|
| Frameworks    | Ionic, Apache Cordova, Capacitor, PhoneGap     |
| Sprachen      | HTML5, CSS3, JavaScript / TypeScript           |
| UI-Frameworks | Angular, React, Vue.js                         |
| IDEs          | VS Code, WebStorm                              |

---

## Bekannte Beispiele

- Tumblr
- Twitter (frühere Versionen)
- Microsoft Teams (mobil)
- Reddit
- Evernote

---

## Typische Anwendungsfälle

Besonders geeignet für:
- Content-Apps und Unternehmens-Apps
- Prototypen und MVPs
- Projekte mit begrenztem Budget
- Anwendungen, die iOS und Android mit einem einzigen Codebase abdecken sollen
- Teams mit Web-Entwicklungs-Kenntnissen (kein Swift/Kotlin nötig)

---

## Eigenschaftsbewertung

| Eigenschaft                          | Bewertung     | Kommentar                                                                                          |
|--------------------------------------|---------------|----------------------------------------------------------------------------------------------------|
| Platform APIs (Kamera, GPS, Sensoren) | ★★★☆☆        | Über Plugins (Cordova/Capacitor) möglich, aber nicht so direkt wie nativ. Einige APIs fehlen.      |
| Performance                           | ★★☆☆☆        | WebView ist langsamer als native Rendering-Engine. Animationen und komplexe UIs können ruckeln.    |
| Kosten / Zeit                         | ★★★★☆        | Ein Codebase für alle Plattformen spart viel Zeit. Web-Entwickler können direkt starten.           |
| UX                                    | ★★★☆☆        | Kann nativ aussehen (z.B. Ionic-Komponenten), fühlt sich aber oft nicht ganz «richtig» an.         |
| Offline                               | ★★★☆☆        | Möglich mit Local Storage, SQLite-Plugins oder Service Workers – aber aufwendiger als nativ.       |
| Distribution                          | ★★★★☆        | Verteilung über App Store und Play Store wie eine native App. Kein Browser nötig.                  |
| Updates                               | ★★★☆☆        | Web-Teil kann «live» aktualisiert werden (z.B. Ionic Appflow), native Hülle braucht Store-Update.  |
| Plattformsupport                      | ★★★★★        | iOS, Android, Desktop (Electron), Web – mit einem einzigen Codebase. Maximale Reichweite.         |

---