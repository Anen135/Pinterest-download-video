document.addEventListener("DOMContentLoaded", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: getPinterestData,
            args: [tabs[0].url]
        });
    });

    document.getElementById("download").addEventListener("click", download);
});

function getPinterestData(url) {
    let data = JSON.parse(document.getElementById("__PWS_INITIAL_PROPS__").textContent);
    let videos = data.initialReduxState.pins[url.split("/").at(-2)].videos.video_list;

    // Информация о разрешениях
    let resolutions = [];
    if (videos.V_720P) {
        resolutions.push({ label: "720P", url: videos.V_720P.url });
    }
    if (videos.V_480P) {
        resolutions.push({ label: "480P", url: videos.V_480P.url });
    }
    if (videos.V_360P) {
        resolutions.push({ label: "360P", url: videos.V_360P.url });
    }

    // Передача информаций о разрешениях в popup.js
    chrome.runtime.sendMessage({ resolutions: resolutions });
}

// Обработка ответа от getPinterestData
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.resolutions) {
        const select = document.getElementById("videoResolutions");
        select.innerHTML = ""; // Очистка предыдущих опции

        request.resolutions.forEach(resolution => {
            const option = document.createElement("option");
            option.value = resolution.url;
            option.textContent = resolution.label;
            select.appendChild(option);
        });

        // Разблокируем кнопку "Скачать"
        document.getElementById("download").disabled = false;
    }
});

// Функция для скачивания выбранного видео
function download() {
    const select = document.getElementById("videoResolutions");
    const selectedUrl = select.value;

    if (selectedUrl) {
        // ХЗ что сюда писать
        chrome.tabs.create({url: selectedUrl});
    } else {
        alert("Выберите разрешение для скачивания");
    }
}