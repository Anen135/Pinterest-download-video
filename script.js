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
    let resolutions = [];
    let data = JSON.parse(document.getElementById("__PWS_INITIAL_PROPS__").textContent);
    console.log(data)
    if (data.initialReduxState.pins[Object.keys(data.initialReduxState.pins)[0]] != data.initialReduxState.pins[url.split("/").at(-2)]) console.log("Url is outdated. Please refresh the page.");
    url = data.initialReduxState.pins[Object.keys(data.initialReduxState.pins)[0]];
    console.log(url)

    if (url.videos) {
        console.log("videos");
        let videos = url.videos.video_list;
        // Информация о разрешениях
        for (const key in videos) {
            if (key.startsWith("V_")) {
                resolutions.push({ label: key, url: videos[key].url });
                console.log(videos[key].url, key);
            }
        }
        // Передача информаций о разрешениях в popup.js
        chrome.runtime.sendMessage({ resolutions: resolutions });
    } else if (url.images) {
        // Информация о разрешениях
        for (const key in url.images) {
            resolutions.push({ label: key, url: url.images[key].url });
            console.log(url.images[key].url, key);
        }
        chrome.runtime.sendMessage({ resolutions: resolutions.reverse() });
    }

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