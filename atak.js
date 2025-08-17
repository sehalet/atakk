/*
 * Script Name: Mass Attack Planner
 * Version: v1.2.1
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
    version: 'v1.2.1',
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

    let knightSpeed = 0;
    const worldUnits = game_data.units;
    if (worldUnits.includes('knight')) {
        knightSpeed = unitInfo?.config['knight'].speed || 0;
    }

    const content = `
        <div id="ra-mass-attack-planner-container">
            <h1 class="ra-fs18 ra-fw600">${scriptData.name}</h1>
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
        </div>
        <div id="ra-mass-attack-planner-style">
            <style>
                #ra-mass-attack-planner-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999; background-color: #f4e4bc; border: 2px solid #603000; padding: 20px; width: 480px; box-sizing: border-box; }
                .ra-fs18 { font-size: 18px; }
                .ra-fw600 { font-weight: 600; }
                .ra-mb15 { margin-bottom: 15px; }
                .ra-flex { display: flex; flex-flow: row wrap; justify-content: space-between; }
                .ra-flex-6 { flex: 0 0 48%; }
                .ra-flex-4 { flex: 0 0 30%; }
                label { font-weight: 600; display: block; margin-bottom: 5px; font-size: 12px; }
                input[type="text"], select { display: block; width: 100%; height: auto; line-height: 1; box-sizing: border-box; padding: 5px; outline: none; border: 1px solid #999; }
                textarea { width: 100%; height: 80px; box-sizing: border-box; padding: 5px; resize: none; }
                .button { padding: 10px 20px; background-color: #603000; font-weight: 500; color: #fff; text-align: center; display: inline-block; cursor: pointer; text-transform: uppercase; }
            </style>
        </div>
    `;

    jQuery('body').append(content);
}

// ** GÜNCEL KISIM: Buradan sonrası güncellenmiştir. **

function handleSubmit() {
    const arrivalTimeInput = jQuery('#arrival_time').val();
    const targetCoordsInput = jQuery('#target_coords').val();

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

    targetVillages.forEach(target => {
        const closestNuke = findClosestVillage(target, nukeVillages);
        const closestNoble = findClosestVillage(target, nobleVillages);
        const closestSupport = findClosestVillage(target, supportVillages);

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

function parseCoords(coordsString) {
    if (!coordsString) return [];
    return coordsString.trim().split(/[\s,]+/).filter(c => c.length > 0);
}

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

function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

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

function scriptInfo() {
    return `[${scriptData.name} ${scriptData.version}]`;
}

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
