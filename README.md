# Agri Compass v2 - 🌾 Intelligent Farming Solutions

Agri Compass v2 is a modern, full-stack agricultural decision-support system designed for farmers in India, specifically tailored for Karnataka. It leverages Spring Boot for the backend and Vite/React for a high-performance, interactive frontend.

## 🏗️ Architecture

- **Frontend**: Vite + React + TypeScript + Tailwind CSS + Framer Motion.
- **Backend**: Spring Boot 3.2+ (Java 17).
- **Database**: SQLite (Local file `agricompass.db` in the backend directory).
- **AI/External APIs**:
  - **Gemini AI**: Powering the "Air Agent" assistant.
  - **OpenWeatherMap**: Live weather forecasts and advisories.
  - **Data.gov.in**: Real-time mandi price tracking.

---

## 🚀 Getting Started

### 1. Backend Setup (Spring Boot)

The backend is located in the `agri-compass-api` directory.

1.  **JDK**: Ensure you have **Java 17** installed.
2.  **Maven**: You can use your global Maven or the one provided in the `apache-maven-3.9.6` folder.
3.  **Configure API Keys**:
    - Open `agri-compass-api/src/main/resources/application.properties`.
    - Provide your keys for:
      - `gemini.api.keys` (Get from [Google AI Studio](https://aistudio.google.com/))
      - `datagov.api.key` (Get from [Data.gov.in](https://www.data.gov.in/))
      - `openweather.api.key` (Get from [OpenWeatherMap](https://openweathermap.org/api))
4.  **Run**:
    ```bash
    mvn spring-boot:run
    ```
    *The database will auto-seed with crop economics data on first run.*

### 2. Frontend Setup (Vite)

1.  **Install**:
    ```bash
    npm install
    ```
2.  **Environment**:
    - Create a `.env` file in the root directory.
    - Add: `VITE_API_URL=http://localhost:8080`
3.  **Run**:
    ```bash
    npm run dev
    ```

---

## 📖 Handover Notes

- **Database**: The current state of the database is tracked in `agri-compass-api/agricompass.db`.
- **Authentication**: Currently uses a mock/developer user flow in `AuthContext.tsx` while transitioning away from Supabase/Clerk.
- **Features**: All features (AI Agent, Weather, Market Prices, Community) are connected to the Spring Boot API.

## ✨ Key Features

- **Air Agent**: Voice-enabled AI assistant for agricultural queries.
- **Disease Detection**: AI-powered analysis of crop health.
- **Live Market Prices**: Real-time tracking of commodity rates across mandis.
- **Hyper-Local Weather**: Targeted forecasts for Karnataka districts with actionable advisories.
