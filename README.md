# AuraWeather

AuraWeather is a modern, responsive weather dashboard built with HTML, Tailwind CSS, and vanilla JavaScript.

## Overview

This project displays weather information for cities using the Weather API from RapidAPI, with a polished glassmorphism UI, animated background effects, and unit toggling between Celsius and Fahrenheit.

## Features

- Search for city weather data
- Switch between Celsius and Fahrenheit
- Animated weather canvas backgrounds
- Recent searches saved in localStorage
- Support for fallback simulated weather when API requests fail
- Responsive layout with Tailwind CSS

## Project Structure

- `index.html` - main application markup
- `style.css` - custom styling and visual transitions
- `app.js` - weather data logic, UI updates, localStorage, and canvas animation

## Setup

1. Open `Beginner/Weather App/index.html` in a browser.
2. The app loads the required fonts and Tailwind library from CDN.
3. Enter a city name and press `Explore` to fetch weather info.

## Notes

- The project currently uses a RapidAPI key located in `app.js`.
- If the API request fails, the app falls back to a local simulated weather dataset for a seamless experience.

## Recommended Usage

- Best for showcasing a polished weather UI
- Ideal for GitHub Pages or local browser demos

## License

This project is open for personal learning and portfolio use.