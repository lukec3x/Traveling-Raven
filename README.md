# Traveling Raven

A static site inspired by messenger ravens: you write a note, get a 4-digit code, and someone else uses that code to read the scroll. After it is read, the message disappears.

Pages are titled **Raven Traveler**.

- GitHub Pages: https://lukec3x.github.io/Traveling-Raven/
- Site: http://travelingraven.com.br

## What it does

The home screen has two actions:

- **Send** — write on the scroll. The raven refuses an empty scroll. If there is text, the note is stored and the site shows a 4-digit code.
- **Receive** — enter that code. If the note exists, the scroll opens; if not, you get a not-found warning. The note is deleted after it is read.

Portrait screens use the `*-mobile.html` pages; landscape uses the desktop pages.

## Run locally

It is only HTML, CSS, and JS. Open `index.html` in a browser (or serve the folder with any static server). Send and receive need Firebase, configured in `js/script.js`.

## Layout

```
index.html, enviar.html, receber.html          # desktop
index-mobile.html, enviar-mobile.html, …
css/                                          # styles
js/script.js                                  # send, code, Firebase
img/                                          # ravens, scroll, icons
```
