// ==UserScript==
// @name        Jitai
// @author      @marciska
// @namespace   marciska
// @description Displays your WaniKani reviews with randomized fonts (based on original by @obskyr)
// @version     3.1.1
// @icon        https://raw.github.com/marciska/Jitai/master/imgs/jitai.ico
// @match       https://*.wanikani.com/subjects/review*
// @match       https://*.wanikani.com/subjects/extra_study*
// @license     MIT; http://opensource.org/licenses/MIT
// @run-at      document-end
// @grant       none
// ==/UserScript==

(function(global) {
	'use strict';

    /* eslint no-multi-spaces: off */
    /* global wkof */

    //===================================================================
    // Variables
    //-------------------------------------------------------------------
    const script_id = "jitai";
    const script_name = "Jitai";

    const item_element = document.getElementsByClassName("character-header__characters")[0];

    // ----- Fonts -----
    const example_sentence = '質問：私立探偵 (P.I.) はどんな靴を履いていますか?<br>答え：・・・スニーカー。（笑）';
    
    let font_default = getDefaultFont();
    let font_randomized = font_default;
    let hovering = false;

    // available fonts
    let font_pool = {
        // Default OSX fonts
        "Hiragino-Kaku-Gothic-Pro" : {full_font_name: "Hiragino Kaku Gothic Pro, ヒラギノ角ゴ Pro W3", display_name: "Hiragino Kaku Gothic Pro", url: 'local', recommended: false},
        "Hiragino-Maru-Gothic-Pro" : {full_font_name: "Hiragino Maru Gothic Pro, ヒラギノ丸ゴ Pro W3", display_name: "Hiragino Maru Gothic Pro", url: 'local', recommended: false},
        "Hiragino-Mincho-Pro" : {full_font_name: "Hiragino Mincho Pro, ヒラギノ明朝 Pro W3", display_name: "Hiragino Mincho Pro", url: 'local', recommended: false},
        // Default Windows fonts
        "Meiryo" : {full_font_name: "Meiryo, メイリオ", display_name: "Meiryo", url: 'local', recommended: false},
        "MS-PGothic" : {full_font_name: "MS PGothic, ＭＳ Ｐゴシック, MS Gothic, ＭＳ ゴック", display_name: "MS Gothic", url: 'local', recommended: false},
        "MS-PMincho" : {full_font_name: "MS PMincho, ＭＳ Ｐ明朝, MS Mincho, ＭＳ 明朝", display_name: "MS Mincho", url: 'local', recommended: false},
        "Yu-Gothic" : {full_font_name: "Yu Gothic, YuGothic", display_name: "Yu Gothic", url: 'local', recommended: false},
        "Yu-Mincho" : {full_font_name: "Yu Mincho, YuMincho", display_name: "Yu Mincho", url: 'local', recommended: false},
        // GoogleFonts
        "Zen-Kurenaido" : {full_font_name: "Zen Kurenaido", display_name: "Zen Kurenaido", url: 'https://fonts.googleapis.com/css?family=Zen+Kurenaido&subset=japanese', recommended: false},
        "Kaisei-Opti" : {full_font_name: "Kaisei Opti", display_name: "Kaisei Opti", url: 'https://fonts.googleapis.com/css?family=Kaisei+Opti&subset=japanese', recommended: false},
        "Reggae-One" : {full_font_name: "Reggae One", display_name: "Reggae One", url: 'https://fonts.googleapis.com/css?family=Reggae+One&subset=japanese', recommended: false},
        "New-Tegomin" : {full_font_name: "New Tegomin", display_name: "New Tegomin", url: 'https://fonts.googleapis.com/css?family=New+Tegomin&subset=japanese', recommended: false},
        "Yuji-Boku" : {full_font_name: "Yuji Boku", display_name: "Yuji Boku", url: 'https://fonts.googleapis.com/css?family=Yuji+Boku&subset=japanese', recommended: false},
        "Yuji-Mai" : {full_font_name: "Yuji Mai", display_name: "Yuji Mai", url: 'https://fonts.googleapis.com/css?family=Yuji+Mai&subset=japanese', recommended: false},
        "Yuji-Syuku" : {full_font_name: "Yuji Syuku", display_name: "Yuji Syuku", url: 'https://fonts.googleapis.com/css?family=Yuji+Syuku&subset=japanese', recommended: false},
        "DotGothic16" : {full_font_name: "DotGothic16", display_name: "DotGothic16", url: 'https://fonts.googleapis.com/css?family=DotGothic16&subset=japanese', recommended: true},
        "Hachi-Maru-Pop" : {full_font_name: "Hachi Maru Pop", display_name: "Hachi Maru Pop", url: 'https://fonts.googleapis.com/css?family=Hachi+Maru+Pop&subset=japanese', recommended: true},
        "Yomogi" : {full_font_name: "Yomogi", display_name: "Yomogi", url: 'https://fonts.googleapis.com/css?family=Yomogi&subset=japanese', recommended: false},
        "Potta-One" : {full_font_name: "Potta One", display_name: "Potta One", url: 'https://fonts.googleapis.com/css?family=Potta+One&subset=japanese', recommended: false},
        "Dela-Gothic-One" : {full_font_name: "Dela Gothic One", display_name: "Dela Gothic One", url: 'https://fonts.googleapis.com/css?family=Dela+Gothic+One&subset=japanese', recommended: true},
        "RocknRoll-One" : {full_font_name: "RocknRoll One", display_name: "RocknRoll One", url: 'https://fonts.googleapis.com/css?family=RocknRoll+One&subset=japanese', recommended: false},
        "Stick" : {full_font_name: "Stick", display_name: "Stick", url: 'https://fonts.googleapis.com/css?family=Stick&subset=japanese', recommended: true},
        "Yusei-Magic" : {full_font_name: "Yusei Magic", display_name: "Yusei Magic", url: 'https://fonts.googleapis.com/css?family=Yusei+Magic&subset=japanese', recommended: false},
        "Kaisei-Decol" : {full_font_name: "Kaisei Decol", display_name: "Kaisei Decol", url: 'https://fonts.googleapis.com/css?family=Kaisei+Decol&subset=japanese', recommended: false},
        "Kaisei-Tokumin" : {full_font_name: "Kaisei Tokumin", display_name: "Kaisei Tokumin", url: 'https://fonts.googleapis.com/css?family=Kaisei+Tokumin&subset=japanese', recommended: false},
        // Other popular fonts
        "ArmedBanana" : {full_font_name: "ArmedBanana", display_name: "Armed Banana", url: 'https://marciska.github.io/Jitai/ArmedBanana.css', recommended: true},
        "ArmedLemon" : {full_font_name: "ArmedLemon", display_name: "Armed Lemon", url: 'local', recommended: false},
        "AoyagiReisyosimo-AoyagiKouzan" : {full_font_name: "aoyagireisyosimo2, AoyagiKouzanFont2OTF", display_name: "Aoyagi Kouzan", url: 'local', recommended: false},
        "Aquafont" : {full_font_name: "aquafont", display_name: "Aquafont", url: 'local', recommended: false},
        "Shin-Maru-Go-Pro" : {full_font_name: "A-OTF Shin Maru Go Pro", display_name: "Shin Maru Go Pro", url: 'local', recommended: false},
        "Chifont" : {full_font_name: "'chifont+', chifont", display_name: "Chifont", url: 'local', recommended: false},
        "Cinecaption" : {full_font_name: "cinecaption", display_name: "Cinecaption", url: 'local', recommended: false},
        "Darts" : {full_font_name: "darts font", display_name: "Darts", url: 'https://marciska.github.io/Jitai/Darts.css', recommended: false},
        "EPSON-行書体Ｍ" : {full_font_name: "EPSON 行書体Ｍ", display_name: "EPSON 行書体Ｍ", url: 'local', recommended: false},
        "EPSON-正楷書体Ｍ" : {full_font_name: "EPSON 正楷書体Ｍ", display_name: "EPSON 正楷書体Ｍ", url: 'local', recommended: false},
        "EPSON-教科書体Ｍ" : {full_font_name: "EPSON 教科書体Ｍ", display_name: "EPSON 教科書体Ｍ", url: 'local', recommended: false},
        "EPSON-太明朝体Ｂ" : {full_font_name: "EPSON 太明朝体Ｂ", display_name: "EPSON 太明朝体Ｂ", url: 'local', recommended: false},
        "EPSON-太行書体Ｂ" : {full_font_name: "EPSON 太行書体Ｂ", display_name: "EPSON 太行書体Ｂ", url: 'local', recommended: false},
        "EPSON-丸ゴシック体Ｍ" : {full_font_name: "EPSON 丸ゴシック体Ｍ", display_name: "EPSON 丸ゴシック体Ｍ", url: 'local', recommended: false},
        "FC-Flower" : {full_font_name: "FC-Flower", display_name: "FC-Flower", url: 'https://marciska.github.io/Jitai/FCFlower.css', recommended: false},
        "HakusyuKaisyoExtraBold_kk" : {full_font_name: "HakusyuKaisyoExtraBold_kk", display_name: "Hakusyu Kaisyo (Extra Bold)", url: 'local', recommended: false},
        "Hosofuwafont" : {full_font_name: "Hosofuwafont", display_name: "Hoso Fuwa", url: 'https://marciska.github.io/Jitai/HosoFuwa.css', recommended: false},
        "Nagayama-Kai" : {full_font_name: "nagayama_kai", display_name: "Nagayama Kai", url: 'https://marciska.github.io/Jitai/NagayamaKai.css', recommended: false},
        "Pop-Rum-Cute" : {full_font_name: "PopRumCute", display_name: "Pop Rum Cute", url: 'https://marciska.github.io/Jitai/PopRumCute.css', recommended: false},
        "San-Chou-Me" : {full_font_name: "santyoume-font", display_name: "San Chou Me", url: 'https://marciska.github.io/Jitai/SanChouMe.css', recommended: false},
    };

    // fonts that are selected by user to be shown
    let font_pool_selected = [];

    // bool indicating if hovering effect is flipped
    let hover_flipped = false;

    //===================================================================
    // Settings related stuff
    //-------------------------------------------------------------------
    function installSettingsMenu() {
        wkof.Menu.insert_script_link({
            name:      script_id,
            submenu:   'Settings',
            title:     script_name,
            on_click:  settingsOpen
        });
    }

    function settingsPrepare(dialog) {
        dialog.dialog({width:720});
    }
    async function settingsSave(settings) {
        await wkof.Settings.save(script_id); //.then(settingsApply).then(settingsClose);
        settingsApply(settings);
        settingsClose(settings);
    }
    async function settingsLoad() {
        wkof.Settings.load(script_id).then(settingsApply);
    }
    function settingsClose(settings) {
        // Remove all urls to fonts we don't use
        for (const [fontkey, value] of Object.entries(font_pool)) {
            if (!(fontkey in settings)) { continue; }
            if (!settings[fontkey]) { // check if font is disabled
                // if it is a webfont, uninstall webfont
                if (value.url !== 'local') {
                    uninstallWebfont(value.full_font_name, value.url);
                }
            }
        }
    }
    function settingsApply(settings) {
        // clear cache of selected fonts
        font_pool_selected = [];
        // now refill the pool of selected fonts
        for (const [fontkey, value] of Object.entries(font_pool)) {
            if (!(fontkey in settings)) { continue; }
            if (settings[fontkey]) { // check if font is enabled
                // if it is a webfont, install webfont
                if (value.url !== 'local') {
                    installWebfont(value.full_font_name, value.url);
                    // recheck if font is installed on machine
                    // if (!isFontInstalled(value.full_font_name)) { continue; }
                } else { // check if local font is installed on machine
                    if (!isFontInstalled(value.full_font_name)) { continue; }
                }
                // put fonts in selected fonts
                let frequency = settings[fontkey+'_frequency'];
                if (frequency === undefined) { frequency = 1; } // if script started first time, the value might be undefined
                frequency = Math.ceil(frequency);
                for (let i = 0; i < frequency; i++) {
                    font_pool_selected.push(value.full_font_name);
                }
            }
        }

        // randomly shuffle font pool
        shuffleArray(font_pool_selected);

        updateRandomFont(true);
    }

    function settingsOpen() {
        // install webfonts, and remove non-accesible local fonts for selection
        for (const [fontkey, value] of Object.entries(font_pool)) {
            if (value.url !== 'local') { // install webfonts
                installWebfont(value.full_font_name, value.url);
            } else if (!isFontInstalled(value.full_font_name)) { // remove local fonts that are not installed for selection
                delete font_pool[fontkey];
            }
        }

        // order fonts alphabetically
        const fontkeys = Object.keys(font_pool).sort((a, b) => 
            font_pool[a].display_name.localeCompare(font_pool[b].display_name, undefined, {sensitivity: 'base'})
        );

        // prepare selection option for every font
        const font_selector = Object.fromEntries(fontkeys.map(fontkey => ['BOX_'+fontkey, {
            type: 'group',
            label: `<span class="font_label${font_pool[fontkey].recommended ? ' font_recommended' : ''}">${font_pool[fontkey].display_name}</span>`,
            content: {
                sampletext: {
                    type: 'html',
                    html: `<p class="font_example" style="font-family:'${font_pool[fontkey].full_font_name}'">${example_sentence}</p>`
                },
                [fontkey]: {
                    type: 'checkbox',
                    label: 'Use font in '+script_name,
                    default: false,
                },
                [fontkey+'_frequency']: {
                    type: 'number',
                    label: 'Frequency',
                    hover_tip: 'The higher the value, the more often you see this font during review. It is affected by how many fonts you have enabled.',
                    default: 1,
                    min: 1,
                    step: 1,
                }
            }
        }]));

        // prepare configuration dialog
        let dialog = new wkof.Settings({
            script_id:  script_id,
            title:      script_name+' Settings',
            pre_open:   settingsPrepare,
            on_save:    settingsSave,
            on_close:   settingsClose,
            content: {
                currentfont: {
                    type: 'group',
                    label: `<span class="font_label">Current Font: ${font_randomized}</span>`,
                    content: {
                        sampletext: {
                            type: 'html',
                            html: `<p class="font_example" style="font-family:'${font_randomized}'">${example_sentence}</p>`
                        }
                    }
                },
                legend: {
                    type: 'html',
                    html: `<div class="font_legend"><span class="font_recommended">: Recommended Font</span></div>`
                },
                divider: {
                    type: 'section',
                    label: `Filter Fonts (${fontkeys.length} available)`
                },
                ...font_selector
            }
        });
        dialog.open();
    }

    //===================================================================
    // Main Script Functionality
    //-------------------------------------------------------------------

    function getDefaultFont() {
        return getComputedStyle(item_element).fontFamily;
    }

    function isFontInstalled(font_name) {
        // Approach from kirupa.com/html5/detect_whether_font_is_installed.htm - thanks!
        // Will return false for the browser's default monospace font, sadly.
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var text = "wim-—l~ツ亻".repeat(100); // Characters with widths that often vary between fonts.
    
        context.font = "72px monospace";
        var defaultWidth = context.measureText(text).width;
    
        // Microsoft Edge raises an error when a context's font is set to a string
        // containing certain special characters... so that needs to be handled.
        try {
            context.font = "72px " + font_name + ", monospace";
        } catch (e) {
            return false;
        }
        var testWidth = context.measureText(text).width;
    
        return testWidth != defaultWidth;
    }

    function isCanvasBlank(canvas) {
        return !canvas.getContext('2d')
            .getImageData(0, 0, canvas.width, canvas.height).data
            .some(channel => channel !== 0);
    }
    function canRepresentGlyphs(fontName, glyphs) {
        var canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        var context = canvas.getContext("2d");
        context.textBaseline = 'top';
    
        context.font = "24px " + fontName;
    
        var result = true;
        for (var i = 0; i < glyphs.length; i++) {
            context.fillText(glyphs[i], 0, 0);
            if (isCanvasBlank(canvas)) {
                result = false;
                break;
            }
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    
        return result;
    }

    function installWebfont(font_name, url) {
        // If webfont already installed on local machine, don't need to reinstall
        if (isFontInstalled(font_name)) { return; }

        // install webfont
        const link = document.querySelector(`link[href="${url}"]`);
        if (!link) {
            const newlink = document.createElement("link");
            newlink.href = url;
            newlink.rel = "stylesheet";
            document.head.append(newlink);
        }
    }
    function uninstallWebfont(font_name, url) {
        const link = document.querySelector(`link[href="${url}"]`);
        if (!link) {
            link.remove();
        }
    }
    function addPreconnectLinks() {
        // add preconnect links to GoogleFonts servers
        let googleApiLink = document.querySelector(`link[href="https://fonts.googleapis.com"]`);
        if (!googleApiLink) {
            googleApiLink = document.createElement("link");
            googleApiLink.rel = "preconnect";
            googleApiLink.href = "https://fonts.googleapis.com";
            document.head.append(googleApiLink);
        }
        let gstaticLink = document.querySelector(`link[href="https://fonts.gstatic.com"]`);
        if (!gstaticLink) {
            gstaticLink = document.createElement("link");
            gstaticLink.rel = "preconnect";
            gstaticLink.href = "https://fonts.gstatic.com";
            gstaticLink.crossOrigin = true;
            document.head.append(gstaticLink);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function updateRandomFont(update) {
        // choose new random font
        if (update) {
            const glyphs = item_element.innerText;
            if (font_pool_selected.length == 0) {
                console.log(script_name+': empty font pool!')
                font_randomized = font_default;
            } else {
                do {
                    font_randomized = font_pool_selected[Math.floor(Math.random() * font_pool_selected.length)];
                } while (!canRepresentGlyphs(font_randomized, glyphs));
            }
        }

        // show font
        if (hover_flipped) {
            item_element.style.fontFamily = hovering ? font_randomized : font_default;
        } else {
            item_element.style.fontFamily = hovering ? font_default : font_randomized;
        }
    }

    function registerJitaiEvents() {
        // on mouse hovering, show default font
        //  - normal  : randomized font
        //  - hovering: default font
        let style = document.createElement("style");
        item_element.style.fontFamily = font_default;
        document.head.appendChild(style);

        item_element.addEventListener("mouseenter", function() {
            hovering = true;
            updateRandomFont(false);
        });
        item_element.addEventListener("mouseleave", function() {
            hovering = false;
            updateRandomFont(false);
        });
        
        // on answer submission, invert hovering event
        //  - normal  : default font
        //  - hovering: randomized font
        global.addEventListener("didAnswerQuestion", function(event) {
            hover_flipped = true;
            updateRandomFont(false);
        });
        
        // on advancing to next item question, randomize font again
        global.addEventListener("willShowNextQuestion", function(event)
        {
            hover_flipped = false;
            updateRandomFont(true);
        });
        
        // on reverting an answer by DoubleCheckScript, reroll random font and fix inverting of hovering
        global.addEventListener("didUnanswerQuestion", function(event)
        {
            hover_flipped = false;
            updateRandomFont(true);
        });
        
        // add event to reroll randomized font
        global.addEventListener("keydown", function(event)
        {
            if (event.ctrlKey && event.key === 'j') {
                updateRandomFont(true);
            }
        });
    }

    //===================================================================
    // Script Startup
    //-------------------------------------------------------------------
    function startup() {
        // initialization of the Wanikani Open Framework
        if (!wkof) {
            if (confirm(script_name+' requires Wanikani Open Framework.\nDo you want to be forwarded to the installation instructions?')) {
                global.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
            }
            return;
        } else {
            const wkof_modules = 'Settings,Menu';
            wkof.include(wkof_modules);
            wkof
                .ready(wkof_modules)
                .then(addPreconnectLinks)
                .then(registerJitaiEvents)
                .then(settingsLoad)
                .then(installSettingsMenu);
        }

        // insert CSS
        document.head.insertAdjacentHTML('beforeend',
            `<style>
            .font_label {
                font-size: 1.2em;
                display: flex;
                align-items: center;
            }
            .font_legend {
                text-align: center;
                margin: 15px !important;
            }
            .font_example {
                margin: 5px 10px 10px 10px !important;
                font-size: 1.6em;
                line-height: 1.1em;
            }
            .font_recommended::before {
                content: '⭐️';
                font-size: 1.4em;
            }
            </style>`
        );
    }
    startup();

})(window);
