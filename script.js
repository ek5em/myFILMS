document.addEventListener("DOMContentLoaded", () => {
    const addForm = document.getElementById("addForm");
    const itemList = document.getElementById("itemList");
    const itemType = document.getElementById("itemType");
    const movieFields = document.getElementById("movieFields");
    const seriesFields = document.getElementById("seriesFields");

    // Инициализация массива items из локального хранилища или пустого массива
    let items = JSON.parse(localStorage.getItem("items")) || [];

    // Проверка на существование элемента перед доступом к нему
    if (itemType) {
        // Устанавливаем видимость полей на основе значения по умолчанию
        updateFieldsVisibility(itemType.value);

        itemType.addEventListener("change", () => {
            updateFieldsVisibility(itemType.value);
        });
    }

    if (addForm) {
        addForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const item = {
                type: itemType.value,
                title: document.getElementById("itemTitle").value,
                description: document.getElementById("itemDescription").value,
                watched: false,
            };

            if (item.type === "movie") {
                item.duration = document.getElementById("movieDuration").value;
            } else {
                item.episodeCount =
                    document.getElementById("episodeCount").value;
                item.episodeDuration =
                    document.getElementById("episodeDuration").value;
            }

            items.push(item);
            localStorage.setItem("items", JSON.stringify(items));
            addForm.reset();
            updateFieldsVisibility("movie"); // Сброс видимости полей до значений по умолчанию
            alert("Элемент добавлен!");
            renderList(); // Обновить список после добавления нового элемента
        });
    }

    if (itemList) {
        renderList();
        renderStatistics();

        itemList.addEventListener("click", (e) => {
            if (e.target.classList.contains("custom-checkbox")) {
                const index = e.target.getAttribute("data-index");
                items[index].watched = !items[index].watched;
                localStorage.setItem("items", JSON.stringify(items));
                renderList();
            }
        });
    }

    function renderList() {
        itemList.innerHTML = "";
        // Отсортировать элементы: непросмотренные идут первыми, просмотренные последними
        const sortedItems = items.slice().sort((a, b) => a.watched - b.watched);
    
        sortedItems.forEach((item, index) => {
            // Создаем новый элемент списка для каждого элемента в массиве
            const itemElement = document.createElement("li");
            itemElement.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    
            if (item.watched) {
                itemElement.classList.add("watched");
            }
    
            // Перевод типов
            let itemTypeTranslated = "";
            switch (item.type) {
                case "movie":
                    itemTypeTranslated = "Фильм";
                    break;
                case "series":
                    itemTypeTranslated = "Сериал";
                    break;
                case "anime":
                    itemTypeTranslated = "Аниме";
                    break;
            }
    
            let itemDetails = `${item.title} (${itemTypeTranslated})`;
    
            if (item.type === "movie") {
                itemDetails += ` - Продолжительность: ${item.duration} мин.`;
            } else {
                itemDetails += ` - Серий: ${item.episodeCount}, по ${item.episodeDuration} мин.`;
            }
    
            itemDetails += `<br>Описание: ${item.description}`;
    
            // Создаем чекбокс для изменения статуса просмотра
            const watchedCheckbox = document.createElement("input");
            watchedCheckbox.type = "checkbox";
            watchedCheckbox.checked = item.watched; // Устанавливаем состояние чекбокса в соответствии со статусом просмотра фильма
    
            watchedCheckbox.addEventListener("change", (event) => {
                // Изменение состояния просмотра элемента массива в соответствии с состоянием чекбокса
                item.watched = watchedCheckbox.checked;
                localStorage.setItem("items", JSON.stringify(items)); // Обновляем данные в локальном хранилище
                renderList();
                renderStatistics(); // Перерисовываем список
            });
    
            // Добавляем остальные детали фильма
            itemElement.innerHTML = `<div>${itemDetails}</div>`;
    
            // Добавляем чекбокс в конец элемента списка
            itemElement.appendChild(watchedCheckbox);
    
            // Добавляем обработчик события на сам элемент списка для изменения состояния чекбокса
            itemElement.addEventListener("click", (event) => {
                // Избегаем переключения чекбокса, если клик был непосредственно на чекбоксе
                if (event.target !== watchedCheckbox) {
                    watchedCheckbox.checked = !watchedCheckbox.checked;
                    // Обновляем состояние просмотра элемента массива в соответствии с состоянием чекбокса
                    item.watched = watchedCheckbox.checked;
                    localStorage.setItem("items", JSON.stringify(items)); // Обновляем данные в локальном хранилище
                    renderList();
                    renderStatistics(); // Перерисовываем список
                }
            });
    
            itemList.appendChild(itemElement);
        });
    }
    

    function renderStatistics() {
        let watchedMovies = 0;
        let watchedSeries = 0;
        let watchedAnime = 0;
        let totalWatchTime = 0;

        // Перебираем элементы массива items
        items.forEach((item) => {
            if (item.watched) {
                // Проверяем тип элемента и увеличиваем соответствующий счётчик
                switch (item.type) {
                    case "movie":
                        watchedMovies++;
                        totalWatchTime += parseInt(item.duration) || 0; // Прибавляем продолжительность фильма, если она указана
                        break;
                    case "series":
                        watchedSeries++;
                        totalWatchTime +=
                            (parseInt(item.episodeCount) || 0) *
                            (parseInt(item.episodeDuration) || 0); // Прибавляем общую продолжительность сериалов
                        break;
                    case "anime":
                        watchedAnime++;
                        totalWatchTime +=
                            (parseInt(item.episodeCount) || 0) *
                            (parseInt(item.episodeDuration) || 0); // Прибавляем общую продолжительность аниме
                        break;
                }
            }
        });

        // Выводим информацию на страницу
        const statisticsContainer = document.getElementById("statistics");
        statisticsContainer.innerHTML = `
            <p>Просмотрено фильмов: ${watchedMovies}</p>
            <p>Просмотрено сериалов: ${watchedSeries}</p>
            <p>Просмотрено аниме: ${watchedAnime}</p>
            <p>Общее время просмотра: ${formatTime(totalWatchTime)}</p>
        `;
    }

    function formatTime(minutes) {
        const years = Math.floor(minutes / (60 * 24 * 365));
        minutes %= 60 * 24 * 365;
        const months = Math.floor(minutes / (60 * 24 * 30));
        minutes %= 60 * 24 * 30;
        const days = Math.floor(minutes / (60 * 24));
        minutes %= 60 * 24;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
    
        let formattedTime = '';
    
        if (years > 0) {
            formattedTime += years + (years === 1 ? ' год ' : (years > 1 && years < 5 ? ' года ' : ' лет '));
        }
        if (months > 0) {
            formattedTime += months + (months === 1 ? ' месяц ' : (months > 1 && months < 5 ? ' месяца ' : ' месяцев '));
        }
        if (days > 0) {
            formattedTime += days + (days === 1 ? ' день ' : ' дней ');
        }
        if (hours > 0) {
            formattedTime += hours + (hours === 1 ? ' час ' : ' часов ');
        }
        if (remainingMinutes > 0 && formattedTime === '') {
            formattedTime += remainingMinutes + (remainingMinutes === 1 ? ' минута' : ' минут');
        } else if (remainingMinutes > 0) {
            formattedTime += remainingMinutes + (remainingMinutes === 1 ? ' минута' : ' минут');
        } else if (formattedTime === '') {
            formattedTime = '0 минут';
        }
        return formattedTime.trim();
    }
    

    // Вызываем функцию для отображения статистики

    function updateFieldsVisibility(type) {
        if (type === "movie") {
            movieFields.style.display = "block";
            seriesFields.style.display = "none";
        } else {
            movieFields.style.display = "none";
            seriesFields.style.display = "block";
        }
    }
});
