# ReadIT — Book Tracker

A lightweight, modern, and intuitive book list tracking application built using vanilla HTML, CSS, and JavaScript. Designed following **Google Material Design 3 (Material You)** specifications.

## ✨ Features

- **Add & Edit Books**: Track book title, author, and reading status (*Read* or *Not Read*).
- **Material Design 3**:
  - Dynamic Google Ocean Blue color tokens & tonal container elevation.
  - M3 Outlined text fields with animated floating labels.
  - Tactile Segmented Button for status selection.
  - Filter chips for one-tap status filtering (*All Books*, *Read*, *Not Read*).
  - Material Confirmation Dialog with backdrop scrim for deletions.
  - Floating M3 Snackbar toast notifications.
  - Responsive Grid / List view toggle in the top app bar.
- **Instant Search**: Real-time search filtering across titles and authors with a quick-clear action.
- **Statistics Overview**: Live counts for total, completed, and in-progress books.
- **Client-Side Persistence**: Saves data automatically to browser `localStorage` without requiring external servers or accounts.
- **Mobile-First**: Touch targets and layouts crafted specifically for desktop, tablet, and mobile browsers.

## 🚀 Getting Started

No build step or dependencies required. Simply open `index.html` in any modern web browser:

```bash
# Open in default browser
start index.html
```

## 📁 Project Structure

```text
├── index.html       # Semantic M3 structure and component layout
├── style.css        # Material Design 3 tokens, elevations, and responsive styling
├── script.js        # Data management, search, metrics, and localStorage syncing
└── README.md        # Documentation
```

## 📄 License

MIT
