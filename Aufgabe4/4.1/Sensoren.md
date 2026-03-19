# Smartphone-Sensoren – Übersicht

## 1. Accelerometer (Beschleunigungssensor)

**Verwendung:** Erkennung von Gerätebewegungen (Schütteln, Neigung), Schrittzähler, Screen-Rotation.  
**Daten:** Beschleunigungswerte auf drei Achsen (x, y, z) in m/s².  
**Einschränkungen:**
- Rauschen bei ruhigem Gerät kann zu Fehlerkennung führen
- Dauerhaftes Polling erhöht den Akkuverbrauch merklich
- Auf sehr günstigen Geräten reduzierte Abtastrate verfügbar

---

## 2. Gyroscope (Gyroskop)

**Verwendung:** Präzise Rotationsmessung für AR-Apps, Gaming-Steuerung, 360°-Videos.  
**Daten:** Winkelgeschwindigkeit um x-, y-, z-Achse in rad/s.  
**Einschränkungen:**
- Nicht auf allen Low-End-Geräten vorhanden
- Akkuintensiver als der Accelerometer
- Drift bei längerem Einsatz ohne Kalibrierung

---

## 3. Magnetometer / Kompass

**Verwendung:** Digitaler Kompass in Karten-Apps, Indoor-Navigation, Augmented Reality.  
**Daten:** Magnetfeldstärke auf drei Achsen in µT, daraus abgeleitete Himmelsrichtung (0–360°).  
**Einschränkungen:**
- Stark störanfällig durch metallische Gegenstände und andere Elektronik
- Erfordert regelmässige Kalibrierung durch den Nutzer
- Genauigkeit in Gebäuden deutlich eingeschränkt

---

## 4. GPS / Location

**Verwendung:** Navigation, standortbasierte Dienste (z. B. Wetter, lokale Suche), Fitness-Tracking (Route).  
**Daten:** Geografische Koordinaten (Breitengrad, Längengrad), Höhe, Genauigkeit in Metern, Geschwindigkeit.  
**Einschränkungen:**
- Hoher Akkuverbrauch – einer der grössten Verbraucher überhaupt
- Benötigt explizite Nutzerberechtigung (`ACCESS_FINE_LOCATION` / `NSLocationWhenInUseUsageDescription`)
- Indoor-Ortung unzuverlässig; GPS-Fix dauert beim Kaltstart Sekunden bis Minuten
- Ab iOS/Android neuere Versionen: Hintergrund-Zugriff erfordert separate Berechtigung und Begründung

---

## 5. Proximity (Näherungssensor)

**Verwendung:** Display-Abschaltung beim Telefonieren (Ohr am Gerät), Gesten-Erkennung ohne Berührung.  
**Daten:** Binärer Wert (nah / fern) oder Distanzangabe in cm (geräteabhängig).  
**Einschränkungen:**
- Die meisten Implementierungen liefern nur einen Binärwert, keine präzise Distanz
- In React Native / Expo nur eingeschränkt zugänglich; kein offizielles Expo SDK-Modul (Stand 2025)
- Sensor sitzt hardwareseitig fest; Abdeckungen oder Schutzhüllen können ihn beeinflussen

---

## 6. Barometer (Luftdrucksensor)

**Verwendung:** Höhenbestimmung (z. B. Stockwerkserkennung in Indoor-Navigation), Wettervorhersage, Fitness-Apps (Treppenstufen).  
**Daten:** Luftdruck in hPa (Hektopascal).  
**Einschränkungen:**
- Nicht in allen Geräten verbaut (häufig nur in Mittel- und Oberklasse)
- Wetterbedingte Druckschwankungen können Höhenmessung verfälschen
- Für präzise Höhenmessung muss ein lokaler Referenzwert (QNH) bekannt sein

---

## 7. Kamera

**Verwendung:** Fotografie/Video, QR-/Barcode-Scanning, Augmented Reality, Dokumentenscanning.  
**Daten:** Bild-/Videoframes (RGB), optional Tiefendaten (TrueDepth / ToF-Sensor).  
**Einschränkungen:**
- Explizite Nutzerberechtigung erforderlich (`CAMERA` / `NSCameraUsageDescription`)
- Hoher Akkuverbrauch bei aktivem Stream
- Kein Zugriff im Hintergrund (iOS schränkt dies systemseitig ein)
- Hardwareunterschiede (Auflösung, Zoom, Autofokus) je nach Gerät erheblich

---

## 8. Mikrofon

**Verwendung:** Sprachsteuerung, Audio-Aufnahmen, Lärmpegelmessung, Spracherkennung.  
**Daten:** Audiodaten als PCM-Stream (Abtastrate typisch 44,1 kHz oder 48 kHz), Lautstärke in dB.  
**Einschränkungen:**
- Explizite Nutzerberechtigung erforderlich (`RECORD_AUDIO` / `NSMicrophoneUsageDescription`)
- Hintergrundaufnahme auf iOS stark eingeschränkt (nur mit spezifischen Audio-Session-Kategorien)
- Nutzer sind besonders sensibel gegenüber Mikrofon-Zugriff → Ablehnungsrate bei Permission-Dialogen hoch
- Umgebungslärm und Gerätehardware beeinflussen Qualität stark

---