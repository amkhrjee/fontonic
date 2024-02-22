<div align="center"><img style="height: 10rem" src="./res/logo_transparent.png"></div>
<p align="center">Effortlessly change the web's typography!</p>

<div style="display:flex; justify-content:center;gap:1rem;" align="center"><a href="https://chromewebstore.google.com/detail/fontonic/hnjlnpipbcbgllcjgbcjfgepmeomdcog"><img style="height: 4rem; cursor: pointer;" src="./res/webstore.png"></a>
<a href="https://addons.mozilla.org/en-US/firefox/addon/fontonic-customize-fonts/"><img style="height: 4rem; cursor: pointer;" src="./res/firefoxaddon.png"></a>
</div>

# Setup

Run the TypeScript comiler to generate the JavaScript files required in the `manifest.json`:

```sh
tsc --watch -p tsconfig.json
```

Fontonic uses Prettier for code formatting. Thus, it is recommended to have the Prettier VS Code extension installed. Maintain the `tabWidth: 4` as configured in `.pretttierc`.

## Source code for the Firefox Add-On

The source is hosted at: https://github.com/amkhrjee/fontonic-firefox
