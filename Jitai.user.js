// ==UserScript==
// @name        Jitai
// @author      @marciska
// @namespace   marciska
// @description Displays your WaniKani reviews with randomized fonts (based on original by @obskyr, and community-maintained)
// @version     3.3.1
// @icon        https://raw.github.com/marciska/Jitai/master/imgs/jitai.ico
// @match       https://www.wanikani.com/*
// @match       https://preview.wanikani.com/*
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
    const wkof_version_needed = '1.2.3';
    const listenerOptions = { passive: true };
    // const pageRegex = /^\/subjects\/(?:review.*\/?|extra_study)$/;
    // const pageRegex = /^\/^(subjects\/(?:review.*\/?|extra_study)|recent-mistakes)$/;
    const pageRegex = /^\/(subjects\/(?:review.*\/?|extra_study)$|recent-mistakes)/;
    const example_sentence = '質問：クモの味は何だと思う?<br>答え：・・・酸っぱいだ！（笑）';
    let item_element;
    let style_element;
    let setup_complete = false;

    // ----- States -----
    let font_default; // will be set on review page load
    let font_randomized; // will be set dynamically, earliest on review page load
    let hover_flipped = false; // bool indicating if hovering effect is flipped
    let modifier_held = false; // bool indicating if a modifier key is being held down

    // available fonts
    let font_pool = {
        // Default OSX fonts
        "Hiragino-Kaku-Gothic-Pro" : {full_font_name: "Hiragino Kaku Gothic Pro, ヒラギノ角ゴ Pro W3", display_name: "Hiragino Kaku Gothic Pro", url: 'local', download: '', recommended: false, bugged: false},
        "Hiragino-Maru-Gothic-Pro" : {full_font_name: "Hiragino Maru Gothic Pro, ヒラギノ丸ゴ Pro W3", display_name: "Hiragino Maru Gothic Pro", url: 'local', download: '', recommended: false, bugged: false},
        "Hiragino-Mincho-Pro" :      {full_font_name: "Hiragino Mincho Pro, ヒラギノ明朝 Pro W3", display_name: "Hiragino Mincho Pro", url: 'local', download: '', recommended: false, bugged: false},
        // Default Windows fonts
        "Meiryo" :            {full_font_name: "Meiryo, メイリオ", display_name: "Meiryo", url: 'local', download: '', recommended: false, bugged: false},
        "MS-Gothic" :         {full_font_name: "MS Gothic, ＭＳ ゴック", display_name: "MS Gothic", url: 'local', download: '', recommended: false, bugged: false},
        "MS-PGothic" :        {full_font_name: "MS PGothic, ＭＳ Ｐゴシック", display_name: "MS Gothic", url: 'local', download: '', recommended: false, bugged: false},
        "MS-Mincho" :         {full_font_name: "MS Mincho, ＭＳ 明朝", display_name: "MS Mincho", url: 'local', download: '', recommended: false, bugged: false},
        "MS-PMincho" :        {full_font_name: "MS PMincho, ＭＳ Ｐ明朝", display_name: "MS Mincho", url: 'local', download: '', recommended: false, bugged: false},
        "Yu-Gothic" :         {full_font_name: "Yu Gothic, YuGothic", display_name: "Yu Gothic", url: 'local', download: '', recommended: false, bugged: false},
        "Yu-Mincho" :         {full_font_name: "Yu Mincho, YuMincho", display_name: "Yu Mincho", url: 'local', download: '', recommended: false, bugged: false},
        "BIZ-UDGothic" :      {full_font_name: "BIZ UDGothic", display_name: "BIZ UDGothic", url: 'local', download: '', recommended: false, bugged: false},
        "BIZ-UDPGothic" :     {full_font_name: "BIZ UDPGothic", display_name: "BIZ UDPGothic", url: 'local', download: '', recommended: false, bugged: false},
        "BIZ-UDMincho" :      {full_font_name: "BIZ UDMincho", display_name: "BIZ UDMincho", url: 'local', download: '', recommended: false, bugged: false},
        "BIZ-UDPMincho" :     {full_font_name: "BIZ UDPMincho", display_name: "BIZ UDPMincho", url: 'local', download: '', recommended: false, bugged: false},
        "UDDigiKyokashoN-R" : {full_font_name: "UD Digi Kyokasho N-R", display_name: "UD Digi Kyokasho", url: 'local', download: '', recommended: false, bugged: false},
        // GoogleFonts
        "Zen-Kurenaido" :  {full_font_name: "Zen Kurenaido", display_name: "Zen Kurenaido", url: 'https://fonts.googleapis.com/css?family=Zen+Kurenaido&subset=japanese', download: 'https://fonts.google.com/specimen/Zen+Kurenaido', recommended: false, bugged: false},
        "Reggae-One" :     {full_font_name: "Reggae One", display_name: "Reggae One", url: 'https://fonts.googleapis.com/css?family=Reggae+One&subset=japanese', download: 'https://fonts.google.com/specimen/Reggae+One', recommended: false, bugged: false},
        "New-Tegomin" :    {full_font_name: "New Tegomin", display_name: "New Tegomin", url: 'https://fonts.googleapis.com/css?family=New+Tegomin&subset=japanese', download: 'https://fonts.google.com/specimen/New+Tegomin', recommended: false, bugged: false},
        "Yuji-Boku" :      {full_font_name: "Yuji Boku", display_name: "Yuji Boku", url: 'https://fonts.googleapis.com/css?family=Yuji+Boku&subset=japanese', download: 'https://fonts.google.com/specimen/Yuji+Boku', recommended: false, bugged: false},
        "Yuji-Mai" :       {full_font_name: "Yuji Mai", display_name: "Yuji Mai", url: 'https://fonts.googleapis.com/css?family=Yuji+Mai&subset=japanese', download: 'https://fonts.google.com/specimen/Yuji+Mai', recommended: false, bugged: false},
        "Yuji-Syuku" :     {full_font_name: "Yuji Syuku", display_name: "Yuji Syuku", url: 'https://fonts.googleapis.com/css?family=Yuji+Syuku&subset=japanese', download: 'https://fonts.google.com/specimen/Yuji+Syuku', recommended: false, bugged: false},
        "DotGothic16" :    {full_font_name: "DotGothic16", display_name: "DotGothic16", url: 'https://fonts.googleapis.com/css?family=DotGothic16&subset=japanese', download: 'https://fonts.google.com/specimen/DotGothic16', recommended: true, bugged: false},
        "Hachi-Maru-Pop" : {full_font_name: "Hachi Maru Pop", display_name: "Hachi Maru Pop", url: 'https://fonts.googleapis.com/css?family=Hachi+Maru+Pop&subset=japanese', download: 'https://fonts.google.com/specimen/Hachi+Maru+Pop', recommended: true, bugged: false},
        "Yomogi" :         {full_font_name: "Yomogi", display_name: "Yomogi", url: 'https://fonts.googleapis.com/css?family=Yomogi&subset=japanese', download: 'https://fonts.google.com/specimen/Yomogi', recommended: false, bugged: false},
        "Potta-One" :      {full_font_name: "Potta One", display_name: "Potta One", url: 'https://fonts.googleapis.com/css?family=Potta+One&subset=japanese', download: 'https://fonts.google.com/specimen/Potta+One', recommended: false, bugged: false},
        "Dela-Gothic-One" :{full_font_name: "Dela Gothic One", display_name: "Dela Gothic One", url: 'https://fonts.googleapis.com/css?family=Dela+Gothic+One&subset=japanese', download: 'https://fonts.google.com/specimen/Dela+Gothic+One', recommended: true, bugged: false},
        "RocknRoll-One" :  {full_font_name: "RocknRoll One", display_name: "RocknRoll One", url: 'https://fonts.googleapis.com/css?family=RocknRoll+One&subset=japanese', download: 'https://fonts.google.com/specimen/RocknRoll+One', recommended: false, bugged: false},
        "Stick" :          {full_font_name: "Stick", display_name: "Stick", url: 'https://fonts.googleapis.com/css?family=Stick&subset=japanese', download: 'https://fonts.google.com/specimen/Stick', recommended: true, bugged: false},
        "Yusei-Magic" :    {full_font_name: "Yusei Magic", display_name: "Yusei Magic", url: 'https://fonts.googleapis.com/css?family=Yusei+Magic&subset=japanese', download: 'https://fonts.google.com/specimen/Yusei+MagicYusei+Magic', recommended: false, bugged: false},
        "Kaisei-Decol" :   {full_font_name: "Kaisei Decol", display_name: "Kaisei Decol", url: 'https://fonts.googleapis.com/css?family=Kaisei+Decol&subset=japanese', download: 'https://fonts.google.com/specimen/Kaisei+Decol', recommended: false, bugged: false},
        "Kaisei-Tokumin" : {full_font_name: "Kaisei Tokumin", display_name: "Kaisei Tokumin", url: 'https://fonts.googleapis.com/css?family=Kaisei+Tokumin&subset=japanese', download: 'https://fonts.google.com/specimen/Kaisei+Tokumin', recommended: false, bugged: false},
        "Rampart-One" :    {full_font_name: "Rampart One", display_name: "Rampart One", url: 'https://fonts.googleapis.com/css?family=Rampart+One&subset=japanese', download: 'https://fonts.google.com/specimen/Rampart+One', recommended: false, bugged: false},
        "Klee-One" :       {full_font_name: "Klee One", display_name: "Klee One", url: 'https://fonts.googleapis.com/css?family=Klee+One&subset=japanese', download: 'https://fonts.google.com/specimen/Klee+One', recommended: false, bugged: false},
        "Kaisei-Opti" :    {full_font_name: "Kaisei Opti", display_name: "Kaisei Opti", url: 'https://fonts.googleapis.com/css?family=Kaisei+Opti&subset=japanese', download: 'https://fonts.google.com/specimen/Kaisei+Opti', recommended: false, bugged: false},
        // AdobeFonts
        "AB-Appare" :                 {full_font_name: "ab-appare", display_name: "AB Appare", url: 'adobe', download: 'https://fonts.adobe.com/foundries/tegakiya-honpo', recommended: false, bugged: false},
        "AB-Shinyubipenjigyosyotai" : {full_font_name: "ab-shinyubipenjigyosyotai", display_name: "AB Shinyubipenjigyosyotai", url: 'adobe', download: 'https://fonts.adobe.com/foundries/tegakiya-honpo', recommended: true, bugged: false},
        "Hakusyu-Sosho" :             {full_font_name: "hot-soshokk, HakusyuSosho", display_name: "Hakusyu Sosho", url: 'adobe', download: 'https://www.hakusyu.com/download_education.htm', recommended: false, bugged: false},
        "Hakusyu-Tensho" :            {full_font_name: "hot-tenshokk, HakusyuTensho", display_name: "Hakusyu Tensho", url: 'adobe', download: 'https://www.hakusyu.com/download_education.htm', recommended: false, bugged: false},
        // Other popular fonts
        "851Gkktt" :                      {full_font_name: "Gochikakutto", display_name: "851 Gochikakutto", url: 'local', download: 'https://pm85122.onamae.jp/851Gkktt.html', recommended: false, bugged: false},
        "AnkokuZombic" :                  {full_font_name: "AnkokuZombic", display_name: "Ankoku Zombic", url: 'local', download: 'http://www.ankokukoubou.com/font/ankokuzonji.htm', recommended: false, bugged: false},
        "AoyagiReisyosimo-AoyagiKouzan" : {full_font_name: "AoyagiKouzanFont2OTF", display_name: "Aoyagi Kouzan", url: 'local', download: 'https://jref.com/resources/aoyagi-kouzan.90/', recommended: true, bugged: false},
        "ArmedBanana" :                   {full_font_name: "ArmedBanana", display_name: "Armed Banana", url: 'https://marciska.github.io/Jitai/ArmedBanana.css', download: 'http://calligra-tei.oops.jp/download.html', recommended: true, bugged: false},
        "ArmedLemon" :                    {full_font_name: "ArmedLemon", display_name: "Armed Lemon", url: 'local', download: 'http://calligra-tei.oops.jp/download.html', recommended: false, bugged: false},
        "Aoyagi-Reisho" :                 {full_font_name: "Aoyagi Reisho, Aoyagi Reisyo, aoyagireisyo2, aoyagireisyosimo2", display_name: "Aoyagi Reisho", url: 'local', download: 'https://opentype.jp/aoyagireisho.htm', recommended: false, bugged: false},
        "Aoyagi-Gyousho" :                {full_font_name: "KouzanBrushFontGyousyoOTF, AoyagiKouzanFont2OTF, Aoyagi Gyousyo, Aoyagi Gyousho", display_name: "Aoyagi Gyousho", url: 'local', download: 'https://opentype.jp/kouzangyousho.htm', recommended: false, bugged: false},
        "Aquafont" :                      {full_font_name: "Aquafont, aquafont", display_name: "Aquafont", url: 'local', download: 'https://www.freejapanesefont.com/aqua-font/', recommended: false, bugged: false},
        "Chifont" :                       {full_font_name: "'chifont+', chifont, Nchifont, 'Nchifont+'", display_name: "Chifont", url: 'local', download: 'https://welina.xyz/font/tegaki/nchif/', recommended: false, bugged: false},
        "Chihaya-Gothic" :                {full_font_name: "ChihayaGothic", display_name: "Chihaya Gothic", url: 'local', download: 'https://welina.xyz/font/tegaki/gothic/', recommended: false, bugged: false},
        "Cinecaption" :                   {full_font_name: "cinecaption", display_name: "Cinecaption", url: 'local', download: 'https://cooltext.com/Download-Font-しねきゃぷしょん+cinecaption', recommended: false, bugged: false},
        "Darts" :                         {full_font_name: "DartsFont, darts font", display_name: "Darts", url: 'https://marciska.github.io/Jitai/Darts.css', download: 'https://www.p-darts.jp/font/dartsfont/', recommended: false, bugged: false},
        "EPSON-行書体Ｍ" :                {full_font_name: "EPSON 行書体Ｍ", display_name: "EPSON 行書体Ｍ", url: 'local', download: 'https://www.epson.jp/dl_soft/readme/27767.htm', recommended: false, bugged: false},
        "EPSON-正楷書体Ｍ" :              {full_font_name: "EPSON 正楷書体Ｍ", display_name: "EPSON 正楷書体Ｍ", url: 'local', download: 'https://www.epson.jp/dl_soft/readme/27767.htm', recommended: false, bugged: false},
        "EPSON-教科書体Ｍ" :              {full_font_name: "EPSON 教科書体Ｍ", display_name: "EPSON 教科書体Ｍ", url: 'local', download: 'https://www.epson.jp/dl_soft/readme/27767.htm', recommended: false, bugged: false},
        "EPSON-太明朝体Ｂ" :              {full_font_name: "EPSON 太明朝体Ｂ", display_name: "EPSON 太明朝体Ｂ", url: 'local', download: 'https://www.epson.jp/dl_soft/readme/27767.htm', recommended: false, bugged: false},
        "EPSON-太行書体Ｂ" :              {full_font_name: "EPSON 太行書体Ｂ", display_name: "EPSON 太行書体Ｂ", url: 'local', download: 'https://www.epson.jp/dl_soft/readme/27767.htm', recommended: false, bugged: false},
        "EPSON-丸ゴシック体Ｍ" :          {full_font_name: "EPSON 丸ゴシック体Ｍ", display_name: "EPSON 丸ゴシック体Ｍ", url: 'local', download: 'https://www.epson.jp/dl_soft/readme/27767.htm', recommended: false, bugged: false},
        "FC-Flower" :                     {full_font_name: "FC-Flower", display_name: "FC-Flower", url: 'https://marciska.github.io/Jitai/FCFlower.css', download: 'https://web.archive.org/web/20200718072012/http://fscolor.happy.nu/font/fl.html', recommended: false, bugged: true},
        "Hakusyu-Kaisho-Bold" :           {full_font_name: "HakusyuKaisyoExtraBold_kk", display_name: "Hakusyu Kaisho Bold", url: 'local', download: 'https://www.hakusyu.com/download_education.htm', recommended: false, bugged: false},
        "HGSGyoshotai" :                  {full_font_name: "HGSGyoshotai", display_name: "HGS Gyoshotai", url: 'local', download: 'https://japanesefonts.org/hg-gyoshotai.html', recommended: false, bugged: false},
        "HGSHakushuGyososhotai" :         {full_font_name: "HGSHakushuGyososhotai", display_name: "HGS Hakushu Gyososhotai", url: 'local', download: 'https://japanesefonts.org/hg-hakushu-gyoshotai.html', recommended: false, bugged: false},
        "HGSSyounanGyoshotai" :           {full_font_name: "HGSSyounanGyoshotai", display_name: "HGS Syounan Gyoshotai", url: 'local', download: 'https://japanesefonts.org/hg-syounan-gyoshotai.html', recommended: false, bugged: false},
        "Hoso-Fuwa" :                     {full_font_name: "Hosofuwafont", display_name: "Hoso Fuwa", url: 'https://marciska.github.io/Jitai/HosoFuwa.css', download: 'https://huwahuwa.ff-design.net/ほそふわフォント/', recommended: false, bugged: false},
        "Kouichi-SakuraiFontFeltPen" :    {full_font_name: "kouichi_sakurai font felt pen", display_name: "Kouichi Sakurai Font Felt Pen", url: 'local', download: 'http://fontlab.web.fc2.com/kohichi-feltpen.html', recommended: false, bugged: false},
        "Maru-Folk-Pro" :                 {full_font_name: "A-OTF Maru Folk Pro", display_name: "Maru Folk Pro", url: 'local', download: 'https://fontsgeek.com/a-otf-maru-folk-pro-font', recommended: false, bugged: false},
        "Midashi-Min-MA31-Pro" :          {full_font_name: "A-OTF Midashi Min MA31 Pro", display_name: "Midashi Min MA31 Pro", url: 'local', download: 'https://fontsgeek.com/a-otf-midashi-min-ma31-pro-font', recommended: false, bugged: false},
        "Nagayama-Kai" :                  {full_font_name: "Nagayama Kai, nagayama_kai", display_name: "Nagayama Kai", url: 'https://marciska.github.io/Jitai/NagayamaKai.css', download: 'https://www.bokushin.org/en/nagayama-sensei-font/', recommended: false, bugged: false},
        "NChifont" :                      {full_font_name: "Nchifont_plus", display_name: "NChifont+", url: 'local', download: 'https://welina.xyz/font/tegaki/nchif/', recommended: false, bugged: false},
        "Pop-Rum-Cute" :                  {full_font_name: "PopRumCute", display_name: "Pop Rum Cute", url: 'https://marciska.github.io/Jitai/PopRumCute.css', download: 'https://moji-waku.com/poprumcute/', recommended: false, bugged: false},
        "PS-NOW-GU" :                     {full_font_name: "PS-NOW-GU", display_name: "PS NOW GU", url: 'local', download: 'https://japanesefonts.org/ps-now-gu.html', recommended: false, bugged: false},
        "Ronde-B-Square" :                {full_font_name: "Ronde B Square, Ronde-B, Ronde-B-Square", display_name: "Ronde B square", url: 'local', download: 'https://moji-waku.com/ronde/', recommended: false, bugged: false},
        "Samurai" :                       {full_font_name: "Samurai", display_name: "Samurai", url: 'local', download: 'https://japanesefonts.org/samurai.html', recommended: false, bugged: false},
        "San-Chou-Me" :                   {full_font_name: "San Chou Me, santyoume-font", display_name: "San Chou Me", url: 'https://marciska.github.io/Jitai/SanChouMe.css', download: 'https://web.archive.org/web/20190330133455/http://www.geocities.jp/bokurano_yume/', recommended: false, bugged: false},
        "Saruji" :                        {full_font_name: "saruji", display_name: "Saruji", url: 'local', download: 'https://note.com/chitosekato/n/nc162552f8c1f', recommended: false, bugged: false},
        "Shin-Maru-Go-Pro" :              {full_font_name: "A-OTF Shin Maru Go Pro", display_name: "Shin Maru Go Pro", url: 'local', download: 'https://fontsgeek.com/a-otf-shin-maru-go-pro-font', recommended: false, bugged: false},
        "YDWaosagi" :                     {full_font_name: "YDW aosagi", display_name: "YDW Aosagi", url: 'local', download: 'https://booth.pm/ja/items/4742238', recommended: false, bugged: false},
        "Yoko-Moji" :                     {full_font_name: "yoko-moji", display_name: "Yoko Moji", url: 'local', download: 'https://note.com/chitosekato/n/nc162552f8c1f', recommended: false, bugged: false},
    };

    // fonts that are selected by user to be shown
    let font_pool_selected = [];

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
        dialog.dialog({width:500});
    }
    async function settingsSave(settings) {
        console.log(script_name+': saving settings');
        await wkof.Settings.save(script_id);
        settingsApply(settings);
        settingsClose(settings);
    }
    async function settingsLoad() {
        console.log(script_name+': loading settings...');
        const settings = await wkof.Settings.load(script_id);
        settingsApply(settings);
    }
    function settingsClose(settings) {
        // Remove all urls to fonts we don't use
        for (const [fontkey, value] of Object.entries(font_pool)) {
            if (!(fontkey in settings)) { continue; }
            if (!settings[fontkey]) { // check if font is disabled
                // if it is a non-Adobe webfont, uninstall webfont
                if (value.url !== 'local' && value.url !== 'adobe') {
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
                if (value.url === 'local') { // check if local font is installed on machine
                    if (!isFontInstalled(value.full_font_name)) { continue; }
                } else if (value.url === 'adobe') { // if it is a webfont from adobe
                    // do nothing
                } else { // must be webfont not from adobe, so install it
                    installWebfont(value.full_font_name, value.url);
                    // recheck if font is installed on machine
                    // if (!isFontInstalled(value.full_font_name)) { continue; }
                }
                // put fonts in selected fonts
                let frequency = settings[fontkey+'_frequency'];
                if (frequency === undefined) { frequency = 1; } // if script started first time, the value might be undefined
                frequency = Math.ceil(frequency);
                for (let i = 0; i < frequency; i++) {
                    font_pool_selected.push(value);
                }
            }
        }
        console.log(script_name+': applying font pool of ' + font_pool_selected.length + ' fonts:\n'+font_pool_selected.map(a => a.display_name));

        // randomly shuffle font pool
        shuffleArray(font_pool_selected);

        // apply random font again, but only if on matching page
        if (setup_complete && pageRegex.test(document.location.pathname)) {
            updateRandomFont();
            setflippedFontState();
        }
    }

    function settingsOpen() {
        // install webfonts, and remove non-accesible local fonts for selection
        let fonts_available = {};
        let fonts_unavailable = {};
        for (const [fontkey, value] of Object.entries(font_pool)) {
            if (value.url === 'local') { // LOCAL FONT
                if (isFontInstalled(value.full_font_name)) {
                    fonts_available[fontkey] = value;
                } else {
                    fonts_unavailable[fontkey] = value;
                }
            } else if (value.url === 'adobe') { // ADOBE WEBFONT
                fonts_available[fontkey] = value;
            } else { // GENERAL WEBFONT
                // if (isFontInstalled(value.full_font_name)) {
                    // fonts_available[fontkey] = value;
                    // fonts_available[fontkey].url = 'local';
                // } else {
                installWebfont(value.full_font_name, value.url);
                fonts_available[fontkey] = value;
                // }
            }
        }

        // order fonts alphabetically
        const fontkeys_available = Object.keys(fonts_available).sort((a, b) =>
            fonts_available[a].display_name.localeCompare(fonts_available[b].display_name, undefined, {sensitivity: 'base'})
        );
        const fontkeys_unavailable = Object.keys(fonts_unavailable).sort((a, b) =>
            fonts_unavailable[a].display_name.localeCompare(fonts_unavailable[b].display_name, undefined, {sensitivity: 'base'})
        );

        // prepare selection option for every font
        const font_available_selector = Object.fromEntries(fontkeys_available.map(fontkey => ['BOX_'+fontkey, {
            type: 'group',
            // label: `<span class="font_label${font_pool[fontkey].recommended ? ' font_recommended' : ''}">${font_pool[fontkey].display_name}</span>`,
            label: `<span class="font_label${fonts_available[fontkey].recommended ? ' font_recommended' : ''}${fonts_available[fontkey].bugged ? ' font_bugged' : ''}">${fonts_available[fontkey].display_name} ${fonts_available[fontkey].url !== 'local' ? '<a href="'+fonts_available[fontkey].download+'" target="_blank"><i class="downloadfont"></i></a>' : ''}</span>`,
            content: {
                sampletext: {
                    type: 'html',
                    html: `<p class="font_example" style="font-family: ${fonts_available[fontkey].full_font_name}">${example_sentence}</p>`
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
        const font_unavailable_selector = Object.fromEntries(fontkeys_unavailable.map(fontkey => ['BOX_'+fontkey, {
            type: 'html',
            html: `<p class="font_label${fonts_unavailable[fontkey].recommended ? ' font_recommended' : ''}${fonts_unavailable[fontkey].bugged ? ' font_bugged' : ''}">${fonts_unavailable[fontkey].download !== '' ? '<a href="'+fonts_unavailable[fontkey].download+'" target="_blank"><i class="downloadfont"></i></a>' : ''}${fonts_unavailable[fontkey].display_name}</p>`,
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
                    label: `<span class="font_label">Current Font: ${font_randomized.display_name}</span>`,
                    content: {
                        sampletext: {
                            type: 'html',
                            html: `<p class="font_example" style="font-family: ${font_randomized.full_font_name}">${example_sentence}</p>`
                        }
                    }
                },
                legend: {
                    type: 'html',
                    html: `<div class="font_legend"><span class="font_recommended">: Recommended Font</span><span><i class="font_bugged"></i>: Bugged on some browsers, doesn't show all glyphs</span></div><p class="font_legend">Jitai will during review only choose fonts that can fully represent the review item. (Except Safari browser, here it is recommended to choose only fonts that have all characters included.)</p>`
                },
                divider_available: {
                    type: 'section',
                    label: `Filter Fonts (${fontkeys_available.length} available)`
                },
                ...font_available_selector,
                divider_unavailable: {
                    type: 'section',
                    label: `Local Fonts not found: ${fontkeys_unavailable.length}`
                },
                legend_fonts_unavailable: {
                    type: 'html',
                    html: `<div class="font_legend"><span class="downloadfont">: Font available online, visit download website. Note that not all browsers support local fonts due to font fingerprinting attacks.</span></div>`
                },
                ...font_unavailable_selector
            }
        });
        dialog.open();
    }

    // ===================================================================
    // Main Script Functionality
    // ===================================================================

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

        return testWidth !== defaultWidth;
    }
    function checkIfWebfontsLocallyInstalled() {
        // NOTE this function should run BEFORE addPreconnectLinks().
        //      If it is run after, adobe-webfonts are falsely detected as local fonts
        for (const fontkey of Object.keys(font_pool)) {
            if (font_pool[fontkey].url === 'local') { return; }
            if (isFontInstalled(font_pool[fontkey].full_font_name)) {
                font_pool[fontkey].url = 'local';
            }
        }
    }

    function isCanvasBlank(canvas) {
        return !canvas.getContext('2d', { willReadFrequently: true })
            .getImageData(0, 0, canvas.width, canvas.height).data
            .some(channel => channel !== 0);
    }
    function canRepresentGlyphs(fontName, glyphs) {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.textBaseline = 'top';
        ctx.font = "24px " + fontName;

        // write each glyph on the canvas; if canvas is empty then glyph cannot be represented
        // BUG on Safari, ctx.fillText() doesn't work with custom fonts (sometimes?!)
        for (let i = 0; i < glyphs.length; i++) {
            ctx.fillText(glyphs[i], 0, 0);
            if (isCanvasBlank(canvas)) { return false; }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return true;
    }

    function installWebfont(font_name, url) {
        // If webfont already installed on local machine, don't need to reinstall
        if (isFontInstalled(font_name)) { return; }

        // install webfont
        const link = document.querySelector(`link[href="${url}"]`);
        if (link===null) {
            console.log(script_name+': installing webfont '+font_name);
            const newlink = document.createElement("link");
            newlink.href = url;
            newlink.rel = "stylesheet";
            document.head.append(newlink);
        }
    }
    function uninstallWebfont(font_name, url) {
        const link = document.querySelector(`link[href="${url}"]`);
        if (link!==null) {
            console.log(script_name+': uninstalling webfont '+font_name);
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

        // connect to AdobeFonts via their method
        let script = document.getElementById("adobe_fonts_script");
        if (!script) {
            script = document.createElement("script");
            script.setAttribute('id','adobe_fonts_script');
            script.innerHTML = `
                (function(d) {
                    var config = {
                        kitId: 'xad5qou',
                        scriptTimeout: 3000,
                        async: true
                    },
                    h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
                })(document);
            `;
            document.head.appendChild(script);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function updateRandomFont() {
        // choose new random font
        const glyphs = item_element.innerText;
        if (font_pool_selected.length === 0) {
            console.log(script_name+': empty font pool!')
            font_randomized = font_default;
        } else {
            let i = 0;
            do {
                i = i + 1;
                font_randomized = font_pool_selected[Math.floor(Math.random() * font_pool_selected.length)];
            } while (!canRepresentGlyphs(font_randomized.full_font_name, glyphs) && i < 100);
            if (i >= 100) {
                console.log(script_name+': fallback -- setting default font due to consistent glyph errors');
                font_randomized = font_default;
            }
        }
        console.log(script_name+': updating random font to '+font_randomized.display_name);
        style_element.innerHTML = style_element.innerHTML.replace(/(--font-family-japanese:).*;([\s\S]*?--font-family-japanese-hover:).*;/,`$1 ${font_randomized.full_font_name};$2 ${font_default.full_font_name};`);
    }

    function setflippedFontState() {
        const flipped = hover_flipped ? !modifier_held : modifier_held;
        item_element.classList.toggle('flipped', flipped);
    }

    function insertStyle() {
        // insert CSS
        if ((style_element = document.getElementById(`${script_id}-style`)) != null) return;
        style_element = document.createElement('style');
        style_element.setAttribute('id', `${script_id}-style`);
        style_element.innerHTML = `
.font_label {
    font-size: 1.2em;
    display: flex;
    gap: 5px;
    align-items: center;
}
.font_label a:link, .font_label a:visited, .font_label a:hover, .font_label a:active, .font_label a i {
    text-decoration: none;
}
a i {
    font-style: normal;
}
.font_legend {
    text-align: center;
    margin: 15px !important;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    padding-left: 5% !important;
}
p.font_legend {
    display: block;
    text-align: start;
    margin: 15px !important;
    padding: 0px !important;
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
.font_bugged::after {
    content: '🐛';
    font-size: 1.4em;
}
.downloadfont::before {
    content: '⬇️';
    font-size: 1.4em;
}
.character-header__characters {
    --font-family-japanese: ;
    --font-family-japanese-hover: ;
    font-family: var(--font-family-japanese);
}
.character-header__characters:hover { font-family: var(--font-family-japanese-hover); }
.character-header__characters.flipped { font-family: var(--font-family-japanese-hover); }
.character-header__characters.flipped:hover { font-family: var(--font-family-japanese); }
`;
        document.head.appendChild(style_element);
    }

    function cacheDefaultElementStyles() {
        if (font_default !== undefined && font_randomized !== undefined) return;
        item_element = document.getElementsByClassName("character-header__characters")[0];
        if (!item_element) return;

        // set default states
        font_default = {display_name:'Default Font', full_font_name:getComputedStyle(item_element).fontFamily};
        font_randomized = font_default;
    }

    //----------
    // Events
    //----------

    function onKeyDown(event) { // defines short-hand commands like re-roll font and show default font
        if (event.repeat) return;
        switch (event.key) {
            // on holding ctrl and shift, swap the shown font
            case 'Control':
            case 'Shift':
                if (!event.ctrlKey || !event.shiftKey) return;
                modifier_held = true;
                setflippedFontState();
                break;
            // on alt+j, update to a new random font
            case 'j':
                if (!(event.altKey || event.ctrlKey)) return;
                console.log(script_name+': pressed shortcut to re-roll random font');
                updateRandomFont();
                setflippedFontState();
                break;
        }
    }
    function onKeyUp(event) { // if modifier keys are released, set modifier to false
        if (event.repeat) return;
        switch (event.key) {
            case 'Control':
            case 'Shift':
                modifier_held = false;
                setflippedFontState();
                break;
        }
    }
    function onLostFocus() {
        console.log(script_name+': user lost focus, disabling modifier');
        modifier_held = false;
        setflippedFontState();
    }
    function onDidAnswerQuestion() {
        console.log(script_name+': user answered question, show default font');
        if (!pageRegex.test(document.location.pathname)) return;
        hover_flipped = true;
        setflippedFontState();
    }
    function onDidUnanswerQuestion() {
        console.log(script_name+': user reverted answer by Double-Checker script, showing random font again');
        if (!pageRegex.test(document.location.pathname)) return;
        hover_flipped = false;
        updateRandomFont();
        setflippedFontState();
    }
    function onWillShowNextQuestion() {
        console.log(script_name+': about to show next question, re-rolling random font');
        if (!pageRegex.test(document.location.pathname)) return;
        hover_flipped = false;
        if (setup_complete) { // TODO: if check maybe not necessary, since event only triggered when setup already done?
            updateRandomFont();
            setflippedFontState();
        }
    }

    function registerJitaiEvents() {
        // on answer submission, invert hovering event
        //  - normal  : default font
        //  - hovering: randomized font
        window.addEventListener("didAnswerQuestion", onDidAnswerQuestion, listenerOptions); // event is dispatched for the window only

        // on advancing to next item question, randomize font again
        window.addEventListener("willShowNextQuestion", onWillShowNextQuestion, listenerOptions); // event is dispatched for the window only

        // on reverting an answer by DoubleCheckScript, reroll random font and fix inverting of hovering
        window.addEventListener("didUnanswerQuestion", onDidUnanswerQuestion, listenerOptions); // event is dispatched for the window only

        // add event to show regular font
        // add event to reroll randomized font
        document.body.addEventListener("keydown", onKeyDown, listenerOptions);
        document.body.addEventListener("keyup", onKeyUp, listenerOptions);
        // when page loses focus, revert any temporary modifications
        document.body.addEventListener("blur", onLostFocus, listenerOptions);
    }

    //===================================================================
    // Script Startup
    //-------------------------------------------------------------------
    function startup() {
        console.log(script_name+': Performing initial setup...');

        // initialization of the Wanikani Open Framework
        if (!wkof) {
            if (confirm(script_name+' requires Wanikani Open Framework.\nDo you want to be forwarded to the installation instructions?')) {
                global.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
            }
            return;
        }
        if (wkof.version.compare_to(wkof_version_needed) === 'older') {
            if (confirm(script_name+' requires Wanikani Open Framework version '+wkof_version_needed+'.\nDo you want to be forwarded to the update page?')) {
                global.location.href = 'https://greasyfork.org/en/scripts/38582-wanikani-open-framework';
            }
            return;
        }

        const wkof_modules = 'Settings';
        wkof.include(wkof_modules);
        return wkof
            .ready(wkof_modules)
            .then(checkIfWebfontsLocallyInstalled)
            .then(addPreconnectLinks)
            .then(settingsLoad)
            .then(() => {
                setup_complete = true;
                console.log(script_name+': SETUP COMPLETE');
            });
        }
        
        function onReviewsPage() {
        console.log(script_name+': moved to reviews page, caching elements and showing random font...');
        const wkof_modules = 'Menu';
        wkof.include(wkof_modules);
        return wkof
            .ready(wkof_modules)
            .then(cacheDefaultElementStyles)
            .then(insertStyle)
            .then(registerJitaiEvents)
            .then(installSettingsMenu)
            .then(updateRandomFont)
            .then(setflippedFontState)
            .then(() => {
                if (font_pool_selected.length === 0) {
                    alert(script_name+' detected that you have no custom fonts selected. Click the cog on the top left to select some.\n\nIf you had some selected before and now they are suddenly gone... sorry, I\'m quite forgetful sometimes :\'(')
                }
            });
    }

    startup().then(() => {
        wkof.on_pageload(pageRegex, onReviewsPage);
    });

})(window);
