<p align="center">
  <img src="imgs/logo.svg" alt="Jitai Logo"><br>
  <span style="font-size:4vmin; font-weight: 700;">The font randomizer that fits</span>
</p>

**Jitai** (字体) is a userscript for [WaniKani](https://wanikani.com).  
It sets the font of the radical/kanji/vocabulary automatically  to a random Japanese font.
> [@obskyr](https://community.wanikani.com/t/jitai-字体-the-font-randomizer-that-fits/12617#jitai-logouploadskfps3jv5ojuckdedpacfc4qn4ppng-what-is-jitai-1): One thing that can become a bit of a problem when using WaniKani is that you are only ever exposed to one font. What this means is that if you ever run into a kanji in the wild, even if you know it, you might not recognize it. Especially with handwriting and calligraphy and all that jazz being around, it helps a lot to get in a bit of training on fonts that aren’t Meiryo.

![how-to](imgs/howto.gif)

## Features

- Supports fonts installed on your machine[^1]
- **(NEW)** Supports webfonts
- **(NEW)** New settings pannel to disable/enable fonts during review
- Hover over a font to change it back to normal font (useful if you cannot read it sometimes)

## Installation

First make sure you have a userscript manager like **Tampermonkey** installed.  
Then click on the link below, and your userscript manager should directly recognize it as a userscript to install:  
<a href="https://raw.githubusercontent.com/marciska/Jitai/main/Jitai.user.js" style="font-size: 30px;"><img src="imgs/logo_small.png" alt="Jitai Logo" height=22px> Download</a>

Questions? Visit the [forum][forum].

## Note

Jitai has been originally created by [@obskyr][obskyr], but hasn't been maintained since 2018 and already broke functionality.
This here is a complete rewrite of the original script, taking into account that some browsers do not support using local fonts in an attempt to prevent [Font Fingerprinting](https://browserleaks.com/fonts).

We greatly accept font contributions and other improvements / bug fixes.  
If you like this project, you can visit the [forum][forum].

<!-- Footnotes -->
[^1]: Browsers that support this feature are running out. [See more](https://community.wanikani.com/t/jitai-%E5%AD%97%E4%BD%93-the-font-randomizer-that-fits/12617/644).

<!-- Links -->
[obskyr]:https://github.com/obskyr
[forum]:https://community.wanikani.com/t/jitai-字体-the-font-randomizer-that-fits/12617
