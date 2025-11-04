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
- **Maps**: Leaflet, OpenStreetMap tiles
- **Data**: OpenStreetMap Overpass API + Nominatim (geocoding)
- **Styling**: hand-rolled CSS (lightweight)


---

