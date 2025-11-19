# AI Showcase

Eine moderne Web-Anwendung für die Integration mehrerer AI-Provider (Google Gemini, OpenAI GPT-4, DeepSeek) mit Text-, Bild- und PDF-Analyse-Funktionen.

## 🚀 Features

- **Multi-AI-Provider-Unterstützung**: Wähle zwischen Google Gemini 2.0, OpenAI GPT-4o und DeepSeek Chat
- **Text-Analyse**: Analysiere beliebigen Text mit verschiedenen AI-Modellen
- **Bild-Analyse**: Lade Bilder hoch und stelle spezifische Fragen dazu (Google Gemini 2.0, OpenAI GPT-4o)
- **PDF-Analyse**: Analysiere PDF-Dokumente mit KI-gestützter Auswertung (nur Google Gemini)
- **Intelligenter JSON/Plain Text Toggle**: Automatische Erkennung und Formatierung verschiedener Antwortformate
- **Robuste Fehlerbehandlung**: Graceful Fallbacks bei API-Fehlern oder malformed Responses
- **Sichere Konfiguration**: API-Schlüssel über Umgebungsvariablen mit .gitignore-Schutz
- **Moderne UI**: Apple-inspiriertes Design mit Glassmorphism-Effekten
- **API-Dokumentation**: Vollständige Swagger/OpenAPI-Dokumentation
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **HTTPS-Support**: Optional SSL/TLS-Verschlüsselung für sichere Verbindungen

## 📋 Voraussetzungen

- Node.js (Version 18 oder höher)
- Mindestens ein API Key von den unterstützten Providern:
  - Google Gemini API Key
  - OpenAI API Key (optional)
  - DeepSeek API Key (optional)
- npm oder yarn
- SSL-Zertifikate für HTTPS (optional)

## 🛠️ Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd ki.ai-showcase
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen einrichten**
   
   Kopiere die `.env.example` Datei zu `.env` und trage deine API Keys ein:
   ```bash
   cp .env.example .env
   ```
   
   Bearbeite die `.env` Datei:
   ```env
   # Google Gemini API Key (empfohlen - unterstützt alle Features)
   GEMINI_API_KEY=dein_gemini_api_key_hier
   
   # OpenAI API Key (optional - unterstützt Text und Bilder)
   OPENAI_API_KEY=dein_openai_api_key_hier
   
   # DeepSeek API Key (optional - nur Text)
   DEEPSEEK_API_KEY=dein_deepseek_api_key_hier
   
   PORT=3000
   
   # HTTPS-Konfiguration (optional)
   HTTPS_KEY_PATH=Pfad_zum_Private_Key
   HTTPS_CERT_PATH=Pfad_zum_SSL_Zertifikat
   ```

   > **Wichtig**: 
   > - **Google Gemini**: Kostenloser API Key über [Google AI Studio](https://makersuite.google.com/app/apikey) - unterstützt alle Features
   > - **OpenAI GPT-4o**: API Key über [OpenAI Platform](https://platform.openai.com/api-keys) - unterstützt Text und Bilder
   > - **DeepSeek Chat**: API Key über [DeepSeek Platform](https://platform.deepseek.com/api_keys) - nur Textanalyse
   > - Du benötigst mindestens einen API Key für die Anwendung
   > - Für HTTPS-Support musst du ein SSL-Zertifikat und den zugehörigen Private Key im Root-Verzeichnis des Projekts ablegen

## 🚀 Projekt starten

### Option 1: Build und Start in einem Befehl
```bash
npm run build:start
```

### Option 2: Schritt für Schritt
```bash
# TypeScript kompilieren
npm run build

# Server starten
npm start
```

### Option 3: Development-Modus (mit Hot-Reload)
```bash
npm run dev
```

## 📖 Verwendung

Nach dem Start ist die Anwendung unter folgenden URLs verfügbar:

- **Hauptanwendung**: 
  - HTTP: http://localhost:3000
  - HTTPS: https://localhost:3000 (wenn SSL-Zertifikate konfiguriert sind)
- **API-Dokumentation**: 
  - HTTP: http://localhost:3000/api-docs
  - HTTPS: https://localhost:3000/api-docs (wenn SSL-Zertifikate konfiguriert sind)

### Web-Interface

1. **Text-Analyse**: Gib beliebigen Text ein und lass ihn von der KI analysieren
2. **Bild-Analyse**: Lade ein Bild hoch und stelle optional eine spezifische Frage
3. **PDF-Analyse**: Lade ein PDF-Dokument hoch und lass es von der KI auswerten

### API-Endpunkte

- `POST /api/text` - Text-Analyse
- `POST /api/image` - Bild-Analyse (Multipart/Form-Data)
- `POST /api/pdf` - PDF-Analyse (Multipart/Form-Data)

Vollständige API-Dokumentation mit interaktiven Tests unter `/api-docs`.

## 🏗️ Projektstruktur

```
ai-showcase/
├── src/
│   └── server.ts          # Haupt-Server-Datei
├── public/
│   └── index.html         # Frontend-Interface
├── dist/                  # Kompilierte JavaScript-Dateien
├── .env                   # Umgebungsvariablen (nicht versioniert)
├── .env.example           # Beispiel-Umgebungsvariablen
├── .gitignore             # Git-Ignore-Datei
├── package.json           # Projekt-Konfiguration
├── tsconfig.json          # TypeScript-Konfiguration
└── README.md              # Projektdokumentation
```

## 🔧 Verfügbare Scripts

- `npm run build` - TypeScript zu JavaScript kompilieren
- `npm start` - Server starten (benötigt kompilierte Dateien)
- `npm run dev` - Development-Server mit Hot-Reload starten
- `npm run type-check` - TypeScript-Typen prüfen ohne Kompilierung
- `npm run build:start` - Build und Start in einem Befehl

## 🛡️ Umgebungsvariablen

| Variable | Beschreibung | Standard | Features |
|----------|--------------|----------|----------|
| `GEMINI_API_KEY` | Google Gemini API Key | - | Text, Bilder, PDF |
| `OPENAI_API_KEY` | OpenAI API Key | - | Text, Bilder |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - | Text |
| `PORT` | Server-Port | 3000 | - |
| `HTTPS_KEY_PATH` | Pfad zum SSL Private Key | - | - |
| `HTTPS_CERT_PATH` | Pfad zum SSL Zertifikat | - | - |

## 📚 Technologien

- **Backend**: Node.js, Express.js, TypeScript
- **AI Integration**: 
  - Google Gemini API (@google/genai)
  - OpenAI API (openai)
  - DeepSeek API (über OpenAI-kompatible Schnittstelle)
- **File Upload**: Multer
- **API-Dokumentation**: Swagger/OpenAPI
- **Frontend**: Vanilla HTML/CSS/JavaScript mit Lucide Icons
- **Styling**: CSS mit Apple-inspiriertem Design

## 🔒 Sicherheit

### API-Schlüssel-Schutz
- **Niemals API-Schlüssel committen**: Die `.env` Datei ist in `.gitignore` enthalten
- **Umgebungsvariablen verwenden**: Alle sensiblen Daten in `.env` speichern
- **Schlüssel regelmäßig rotieren**: API-Schlüssel regelmäßig erneuern
- **Berechtigungen minimieren**: Nur benötigte API-Berechtigungen verwenden

### Produktionshinweise
- **HTTPS verwenden**: SSL-Zertifikate für Produktionsumgebung konfigurieren
- **Firewalls konfigurieren**: Nur benötigte Ports öffnen
- **Logging aktivieren**: Für Monitoring und Debugging
- **Rate Limiting**: API-Anfragen begrenzen

## 🔍 Troubleshooting

### Häufige Probleme

1. **"Cannot find module" Fehler**
   ```bash
   npm run build
   ```

2. **API Key Fehler (403 Forbidden)**
   - Überprüfe deine `.env` Datei
   - Stelle sicher, dass die API Keys gültig sind
   - Kontrolliere die API-Quotas und Limits

3. **Port bereits in Verwendung**
   - Ändere den PORT in der `.env` Datei
   - Oder beende andere Prozesse: `lsof -ti:3000 | xargs kill`

4. **HTTPS-Konfigurationsfehler**
   - Stelle sicher, dass die Zertifikats- und Key-Dateien existieren
   - Überprüfe die Pfade in der `.env` Datei
   - Stelle sicher, dass die Zertifikate gültig sind

5. **JSON/Plain Text Toggle funktioniert nicht**
   - Aktualisiere den Browser (Strg+F5)
   - Überprüfe die Browser-Konsole auf JavaScript-Fehler

## 🤝 Beitragen

Contributions sind herzlich willkommen! Hier sind einige Wege, wie du helfen kannst:

### 🐛 Issues melden
- Fehler oder Probleme über GitHub Issues melden
- Detaillierte Beschreibung und Schritte zur Reproduktion angeben
- Screenshots oder Logs beilegen, wenn hilfreich

### 💡 Features vorschlagen
- Neue Ideen als Feature Request einreichen
- Use Cases und Nutzen beschreiben
- Mögliche Implementierungsansätze diskutieren

### 🔧 Code beitragen
1. **Fork** das Repository
2. **Branch** erstellen: `git checkout -b feature/neue-funktion`
3. **Änderungen** committen: `git commit -m 'feat: Add neue Funktion'`
4. **Push** zum Branch: `git push origin feature/neue-funktion`
5. **Pull Request** erstellen

### 📝 Entwicklungsrichtlinien
- **TypeScript** für typsichere Entwicklung verwenden
- **Kommentare** in englischer Sprache für Code
- **Commit-Messages** sollten aussagekräftig sein
- **Tests** für neue Funktionen hinzufügen (wenn vorhanden)

## 📊 Roadmap

### Geplante Features
- [ ] Weitere AI-Provider hinzufügen (Anthropic Claude, etc.)
- [ ] Batch-Verarbeitung für mehrere Dateien
- [ ] Benutzerauthentifizierung und -verwaltung
- [ ] API-Nutzungsstatistiken und -überwachung
- [ ] Docker-Containerisierung
- [ ] Mehrsprachige UI-Unterstützung

### Verbesserungen
- [ ] Performance-Optimierungen
- [ ] Erweiterte Fehlerbehandlung
- [ ] Unit Tests und Integration Tests
- [ ] CI/CD Pipeline
- [ ] Dokumentation erweitern

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 📞 Support

- **GitHub Issues**: Für Bugs und Feature Requests
- **Diskussionen**: Für allgemeine Fragen und Ideen
- **Wiki**: Für erweiterte Dokumentation (falls verfügbar)

---

⭐ **Gefällt dir das Projekt?** Gib ihm einen Stern auf GitHub!
