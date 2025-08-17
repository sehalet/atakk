/*
 * Script Name: Mass Attack Planner
 * Version: v1.2.0
 * Last Updated: 2025-08-17
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Mod: JawJaw & Gemini
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

var scriptData = {
    name: 'Mass Attack Planner',
    version: 'v1.2.0',
    author: 'RedAlert',
    authorUrl: 'https://twscripts.dev/',
    helpLink:
        'https://forum.tribalwars.net/index.php?threads/mass-attack-planner.285331/',
};

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Local Storage
var LS_PREFIX = `ra_massAttackPlanner_`;
var TIME_INTERVAL = 60 * 60 * 1000 * 24 * 30; /* fetch data every 30 days */
var LAST_UPDATED_TIME = localStorage.getItem(`${LS_PREFIX}_last_updated`) ?? 0;

var unitInfo;

// Init Debug
initDebug();

/* Fetch unit info only when needed */
(function () {
    if (LAST_UPDATED_TIME !== null) {
        if (Date.parse(new Date()) >= LAST_UPDATED_TIME + TIME_INTERVAL) {
            fetchUnitInfo();
        } else {
            unitInfo = JSON.parse(
                localStorage.getItem(`${LS_PREFIX}_unit_info`)
            );
            init(unitInfo);
        }
    } else {
        fetchUnitInfo();
    }
})();

// Script Initializer
function init(unitInfo) {
    var currentDateTime = getCurrentDateTime();

    // fix for no paladin worlds
    let knightSpeed = 0;
    const worldUnits = game_data.units;
    if (worldUnits.includes('knight')) {
        knightSpeed = unitInfo?.config['knight'].speed || 0;
    } else {
        jQuery('#support_unit option[data-option-unit="knight"]').attr(
            'disabled'
        );
    }

    const content = `
			<div class="ra-mb15">
				<label for="arrival_time">Arrival Time</label>
				<input id="arrival_time" type="text" placeholder="yyyy-mm-dd hh:mm:ss" value="${currentDateTime}">
			</div>
			<input type="hidden" id="nobleSpeed" value="${unitInfo.config['snob'].speed}" />
			<div class="ra-flex">
				<div class="ra-flex-6">
					<div class="ra-mb15">
						<label for="nuke_unit">Slowest Nuke unit</label>
						<select id="nuke_unit">
							<option value="${unitInfo.config['axe'].speed}">Axe</option>
							<option value="${unitInfo.config['light'].speed}">LC/MA/Paladin</option>
							<option value="${unitInfo.config['heavy'].speed}">HC</option>
							<option value="${unitInfo.config['ram'].speed}" selected="selected">Ram/Cat</option>
						</select>
					</div>
				</div>
				<div class="ra-flex-6">
					<div class="ra-mb15">
						<label for="support_unit">Slowest Support unit</label>
						<select id="support_unit">
							<option value="${unitInfo.config['spear'].speed}">Spear/Archer</option>
							<option value="${unitInfo.config['sword'].speed}" selected="selected">Sword</option>
							<option value="${unitInfo.config['spy'].speed}">Spy</option>
							<option value="${knightSpeed}" data-option-unit="knight">Paladin</option>
							<option value="${unitInfo.config['heavy'].speed}">HC</option>
							<option value="${unitInfo.config['catapult'].speed}">Cat</option>
						</select>
					</div>
				</div>
			</div>
			<div class="ra-mb15">
				<label for="target_coords">Targets Coords</label>
				<textarea id="target_coords"></textarea>
			</div>
			<div class="ra-flex">
				<div class="ra-flex-4">
					<div class="ra-mb15">
						<label for="nobel_coords">Nobles Coords</label>
						<textarea id="nobel_coords"></textarea>
					</div>
					<div class="ra-mb15">
						<label for="nobel_count">Nobles per Target</label>
						<input id="nobel_count" type="text" value="1">
					</div>
				</div>
				<div class="ra-flex-4">
					<div class="ra-mb15">
						<label for="nuke_coords">Nukes Coords</label>
						<textarea id="nuke_coords"></textarea>
					</div>
					<div class="ra-mb15">
						<label for="nuke_count">Nukes per Target</label>
						<input id="nuke_count" type="text" value="1">
					</div>
				</div>
				<div class="ra-flex-4">
					<div class="ra-mb15">
						<label for="support_coords">Support Coords</label>
						<textarea id="support_coords"></textarea>
					</div>
					<div class="ra-mb15">
						<label for="support_count">Support per Target</label>
						<input id="support_count" type="text" value="1">
					</div>
				</div>
			</div>
			<div class="ra-mb15">
				<a id="submit_btn" class="button" onClick="handleSubmit();">Get Plan!</a>
			</div>
			<div class="ra-mb15">
				<label for="results">Results</label>
				<textarea id="results"></textarea>
			</div>
		`;

    const windowContent = prepareWindowContent(content);
    attackPlannerWindow = window.open(
        '',
        '',
        'left=10px,top=10px,width=480,height=670,toolbar=0,resizable=0,location=0,menubar=0,scrollbars=0,status=0'
    );
    attackPlannerWindow.document.write(windowContent);
}

// Helper: Window Content
function prepareWindowContent(windowBody) {
    const windowHeader = `<h1 class="ra-fs18 ra-fw600">${scriptData.name}</h1>`;
    const windowFooter = `<small><strong>${scriptData.name} ${scriptData.version}</strong> - <a href="${scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">${scriptData.author}</a> - <a href="${scriptData.helpLink}" target="_blank" rel="noreferrer noopener">Help</a></small>`;
    const windowStyle = `
		<style>
			body { background-color: #f4e4bc; font-family: Verdana, Arial, sans-serif; font-size: 14px; line-height: 1; }
			main { max-width: 768px; margin: 0 auto; }
			h1 { font-size: 27px; }
			a { font-weight: 700; text-decoration: none; color: #603000; }
			small { font-size: 10px; }
			input[type="text"],
			select { display: block; width: 100%; height: auto; line-height: 1; box-sizing: border-box; padding: 5px; outline: none; border: 1px solid #999; }
			input[type="text"]:focus { outline: none; box-shadow: none; border: 1px solid #603000; background-color: #eee; }
			label { font-weight: 600; display: block; margin-bottom: 5px; font-size: 12px; }
			textarea { width: 100%; height: 80px; box-sizing: border-box; padding: 5px; resize: none; }
			textarea:focus { box-shadow: none; outline: none; border: 1px solid #603000; background-color: #eee; }
			.ra-mb15 { margin-bottom: 15px; }
			.ra-flex { display: flex; flex-flow: row wrap; justify-content: space-between; }
			.ra-flex-6 { flex: 0 0 48%; }
			.ra-flex-4 { flex: 0 0 30%; }
			.button { padding: 10px 20px; background-color: #603000; font-weight: 500; color: #fff; text-align: center; display: inline-block; cursor: pointer; text-transform: uppercase; }
		</style>
	`;

    const html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>${scriptData.name} ${scriptData.version}</title>
			${windowStyle}
		</head>
		<body>
			<main>
				${windowHeader}
				${windowBody}
				${windowFooter}
			</main>
			<script>
				function loadJS(url, callback) {
					var scriptTag = document.createElement('script');
					scriptTag.src = url;
					scriptTag.onload = callback;
					scriptTag.onreadystatechange = callback;
					document.body.appendChild(scriptTag);
				}

				loadJS('https://code.jquery.com/jquery-3.6.0.min.js', function() {
					console.log('Jquery loaded!');
				});
			</script>
		</body>
		</html>
	`;

    return html;
}

// ** GÜNCEL KISIM: Buradan sonrası güncellenmiştir. **

function handleSubmit() {
    const arrivalTimeInput = jQuery('#arrival_time').val();
    const targetCoordsInput = jQuery('#target_coords').val();

    // Hata kontrolü: Hedef koordinatları boş olamaz
    if (!targetCoordsInput.trim()) {
        alert('Lütfen hedef koordinatları girin!');
        return;
    }

    const nukeCoordsInput = jQuery('#nuke_coords').val();
    const nobelCoordsInput = jQuery('#nobel_coords').val();
    const supportCoordsInput = jQuery('#support_coords').val();

    const arrivalTime = new Date(arrivalTimeInput);
    const targetVillages = parseCoords(targetCoordsInput);
    const nukeVillages = parseCoords(nukeCoordsInput);
    const nobleVillages = parseCoords(nobelCoordsInput);
    const supportVillages = parseCoords(supportCoordsInput);

    const nukeUnitSpeed = parseInt(jQuery('#nuke_unit').val());
    const nobleUnitSpeed = parseInt(jQuery('#nobleSpeed').val());
    const supportUnitSpeed = parseInt(jQuery('#support_unit').val());

    let results = '';

    // Her bir hedef için en yakın nuke, noble ve support köylerini bul
    targetVillages.forEach(target => {
        // En yakın nuke köyünü bul
        const closestNuke = findClosestVillage(target, nukeVillages);
        // En yakın noble köyünü bul
        const closestNoble = findClosestVillage(target, nobleVillages);
        // En yakın support köyünü bul
        const closestSupport = findClosestVillage(target, supportVillages);

        // Saldırı zamanlarını hesapla
        if (closestNuke) {
            const launchTime = calculateLaunchTime(arrivalTime, closestNuke, target, nukeUnitSpeed);
            results += `${launchTime} ${closestNuke} ${target} Nuke\n`;
        }

        if (closestNoble) {
            const launchTime = calculateLaunchTime(arrivalTime, closestNoble, target, nobleUnitSpeed);
            results += `${launchTime} ${closestNoble} ${target} Noble\n`;
        }

        if (closestSupport) {
            const launchTime = calculateLaunchTime(arrivalTime, closestSupport, target, supportUnitSpeed);
            results += `${launchTime} ${closestSupport} ${target} Support\n`;
        }
    });

    jQuery('#results').val(results);
}

// Koordinatları ayıklayan yardımcı fonksiyon
function parseCoords(coordsString) {
    if (!coordsString) return [];
    return coordsString.trim().split(/[\s,]+/).filter(c => c.length > 0);
}

// En yakın köyü bulan ana fonksiyon
function findClosestVillage(targetCoord, villageList) {
    if (villageList.length === 0) return null;

    const [targetX, targetY] = targetCoord.split('|').map(Number);
    let minDistance = Infinity;
    let closestVillage = null;

    villageList.forEach(villageCoord => {
        const [villageX, villageY] = villageCoord.split('|').map(Number);
        const distance = getDistance(targetX, targetY, villageX, villageY);

        if (distance < minDistance) {
            minDistance = distance;
            closestVillage = villageCoord;
        }
    });

    return closestVillage;
}

// Mesafe hesaplama fonksiyonu
function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

// Gidiş süresini hesaplayan fonksiyon
function calculateLaunchTime(arrivalTime, startCoord, endCoord, unitSpeed) {
    const [startX, startY] = startCoord.split('|').map(Number);
    const [endX, endY] = endCoord.split('|').map(Number);

    const distance = getDistance(startX, startY, endX, endY);
    const travelTimeMs = distance * unitSpeed * 60 * 1000;
    const launchTimeMs = arrivalTime.getTime() - travelTimeMs;

    const launchTime = new Date(launchTimeMs);
    const formattedDate = `${launchTime.getFullYear()}-${(launchTime.getMonth() + 1).toString().padStart(2, '0')}-${launchTime.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${launchTime.getHours().toString().padStart(2, '0')}:${launchTime.getMinutes().toString().padStart(2, '0')}:${launchTime.getSeconds().toString().padStart(2, '0')}`;
    
    return `${formattedDate} ${formattedTime}`;
}

// Helper: Get and format current datetime
function getCurrentDateTime() {
    let currentDateTime = new Date();

    var currentYear = currentDateTime.getFullYear();
    var currentMonth = currentDateTime.getMonth();
    var currentDate = '' + currentDateTime.getDate();
    var currentHours = '' + currentDateTime.getHours();
    var currentMinutes = '' + currentDateTime.getMinutes();
    var currentSeconds = '' + currentDateTime.getSeconds();

    currentMonth = currentMonth + 1;
    currentMonth = '' + currentMonth;
    currentMonth = currentMonth.padStart(2, '0');

    currentDate = currentDate.padStart(2, '0');
    currentHours = currentHours.padStart(2, '0');
    currentMinutes = currentMinutes.padStart(2, '0');
    currentSeconds = currentSeconds.padStart(2, '0');

    let formatted_date =
        currentYear +
        '-' +
        currentMonth +
        '-' +
        currentDate +
        ' ' +
        currentHours +
        ':' +
        currentMinutes +
        ':' +
        currentSeconds;

    return formatted_date;
}

/* Helper: Fetch World Unit Info */
function fetchUnitInfo() {
    jQuery
        .ajax({
            url: '/interface.php?func=get_unit_info',
        })
        .done(function (response) {
            unitInfo = xml2json($(response));
            localStorage.setItem(
                `${LS_PREFIX}_unit_info`,
                JSON.stringify(unitInfo)
            );
            localStorage.setItem(
                `${LS_PREFIX}_last_updated`,
                Date.parse(new Date())
            );
            init(unitInfo);
        });
}

// Helper: XML to JSON converter
var xml2json = function ($xml) {
    var data = {};
    $.each($xml.children(), function (i) {
        var $this = $(this);
        if ($this.children().length > 0) {
            data[$this.prop('tagName')] = xml2json($this);
        } else {
            data[$this.prop('tagName')] = $.trim($this.text());
        }
    });
    return data;
};

// Helper: Generates script info
function scriptInfo() {
    return `[${scriptData.name} ${scriptData.version}]`;
}

// Helper: Prints universal debug information
function initDebug() {
    console.debug(`${scriptInfo()} It works 🎉!`);
    console.debug(`${scriptInfo()} HELP:`, scriptData.helpLink);
    if (DEBUG) {
        console.debug(`${scriptInfo()} Market:`, game_data.market);
        console.debug(`${scriptInfo()} World:`, game_data.world);
        console.debug(`${scriptInfo()} Screen:`, game_data.screen);
        console.debug(`${scriptInfo()} Game Version:`, game_data.majorVersion);
        console.debug(`${scriptInfo()} Game Build:`, game_data.version);
        console.debug(`${scriptInfo()} Locale:`, game_data.locale);
        console.debug(
            `${scriptInfo()} Premium:`,
            game_data.features.Premium.active
        );
    }
}