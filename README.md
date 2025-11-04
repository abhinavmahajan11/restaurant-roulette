# Restaurant Roulette

A simple web app that helps indecisive eaters choose where to go.  
Pick a location (or use your current location), set cuisines, radius, and minimum rating, then **spin** to get a random nearby spot. See details, distance, a mini-map, and quick links to Google Maps. Save favorites for later.

Live demo: (https://restaurant-roulette-abhi.netlify.app/)

---

##  Features
- 📍 **Location**: enter an address or “Use My Location” (browser geolocation)
- 🍽️ **Cuisine filter**: comma-separated cuisines (e.g., `Indian, Thai`)
- 📏 **Radius**: 1–25 miles
- ⭐ **Min rating**: filter results (OSM has synthetic ratings 3.5–5.0)
- 🎲 **Reroll**: randomize pick without reloading
- 🗺️ **Mini map** (Leaflet + OSM tiles)
- 💾 **Favorites**: saved to localStorage and shown on Home
- 🔁 **Remembers filters** across visits
- ♿ **A11y touches**: aria labels, disabled states, keyboard-friendly

---

## Tech Stack
- **Frontend**: React + Vite
- **Backend:** Netlify Serverless Function proxy for Overpass
- **Data sources:** OpenStreetMap Overpass (POIs), Nominatim (geocoding)
- **Storage:** Browser localStorage
- **Hosting:** Netlify
- **Maps**: Leaflet, OpenStreetMap tiles
- **Data**: OpenStreetMap Overpass API + Nominatim (geocoding)
- **Styling**: hand-rolled CSS (lightweight)

**Languages:** JavaScript, HTML, CSS  
**Libraries:** React, Vite, React Router, Axios, Leaflet, react-leaflet  
**Services:** OSM Overpass, Nominatim, Netlify Functions
**Storage:** localStorage

## Backend Components & Database
- **Function:** `netlify/functions/overpass.js` proxies Overpass (CORS-safe, counts as backend)
- **Database:** none; favorites stored in localStorage

## OOP / DSA
- `src/utils/WeightedPicker.js` — class for weighted random selection using prefix-sum + binary search
- Used in `src/pages/Result.jsx` to favor higher-rated restaurants

## Project Structure
(see repo tree in README above)

---

