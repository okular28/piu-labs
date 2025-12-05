document.addEventListener('DOMContentLoaded', () => {
    let boardData = {
        todo: [],
        inprogress: [],
        done: [],
    };

    const columnsMap = ['todo', 'inprogress', 'done'];

    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const getRandomColor = () => {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        const textColor =
            r * 0.299 + g * 0.587 + b * 0.114 > 128 ? 'black' : 'white';
        return {
            color: textColor,
            background: `rgb(${r}, ${g}, ${b})`,
        };
    };

    const saveState = () => {
        localStorage.setItem('kanbanBoard', JSON.stringify(boardData));
    };

    const loadState = () => {
        const saved = localStorage.getItem('kanbanBoard');
        if (saved) {
            boardData = JSON.parse(saved);
        }
        renderBoard();
    };

    const createCardElement = (card, colId) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.setAttribute('data-id', card.id);
        div.style.backgroundColor = card.color;
        div.style.color = card.textColor;

        const isFirst = colId === 'todo';
        const isLast = colId === 'done';

        div.innerHTML = `
            <button class="card-btn btn-delete" title="Usuń">×</button>
            <div class="card-content" contenteditable="true">${card.text}</div>
            <div class="card-actions">
                ${
                    !isFirst
                        ? '<button class="card-btn btn-move-left" title="Przesuń w lewo">←</button>'
                        : '<span></span>'
                }
                <button class="card-btn btn-color" title="Zmień kolor">Zmień kolor</button>
                ${
                    !isLast
                        ? '<button class="card-btn btn-move-right" title="Przesuń w prawo">→</button>'
                        : '<span></span>'
                }
            </div>
        `;
        return div;
    };

    const renderColumn = (colId) => {
        const columnEl = document.querySelector(`.column[data-id="${colId}"]`);
        const listEl = columnEl.querySelector('.card-list');
        const counterEl = columnEl.querySelector('.counter');

        listEl.innerHTML = '';

        boardData[colId].forEach((card) => {
            const cardEl = createCardElement(card, colId);
            listEl.appendChild(cardEl);
        });

        counterEl.textContent = `(${boardData[colId].length})`;
    };

    const renderBoard = () => {
        columnsMap.forEach((colId) => renderColumn(colId));
    };

    const addCard = (colId) => {
        const newColor = getRandomColor();
        const newCard = {
            id: generateId(),
            text: 'Nowe zadanie',
            color: newColor.background,
            textColor: newColor.color,
        };
        boardData[colId].push(newCard);
        saveState();
        renderColumn(colId);
    };

    const removeCard = (colId, cardId) => {
        boardData[colId] = boardData[colId].filter((c) => c.id !== cardId);
        saveState();
        renderColumn(colId);
    };

    const moveCard = (currentColId, cardId, direction) => {
        const currentIndex = columnsMap.indexOf(currentColId);
        const nextIndex = currentIndex + direction;

        if (nextIndex < 0 || nextIndex >= columnsMap.length) return;

        const nextColId = columnsMap[nextIndex];

        const cardIndex = boardData[currentColId].findIndex(
            (c) => c.id === cardId
        );
        if (cardIndex === -1) return;

        const [card] = boardData[currentColId].splice(cardIndex, 1);
        boardData[nextColId].push(card);

        saveState();
        renderColumn(currentColId);
        renderColumn(nextColId);
    };

    const updateCardText = (colId, cardId, newText) => {
        const card = boardData[colId].find((c) => c.id === cardId);
        if (card) {
            card.text = newText;
            saveState();
        }
    };

    const colorCard = (colId, cardId) => {
        const card = boardData[colId].find((c) => c.id === cardId);
        if (card) {
            const newColor = getRandomColor();
            card.color = newColor.background;
            card.textColor = newColor.color;
            saveState();
            renderColumn(colId);
        }
    };

    const colorColumn = (colId) => {
        boardData[colId].forEach((card) => {
            const newColor = getRandomColor();
            card.color = newColor.background;
            card.textColor = newColor.color;
        });
        saveState();
        renderColumn(colId);
    };

    const sortColumn = (colId) => {
        boardData[colId].sort((a, b) => a.text.localeCompare(b.text));
        saveState();
        renderColumn(colId);
    };

    document.querySelectorAll('.btn-add').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const colId = e.target.closest('.column').dataset.id;
            addCard(colId);
        });
    });

    document.querySelectorAll('.column-controls').forEach((ctrl) => {
        ctrl.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-control');
            if (!btn) return;

            const colId = btn.closest('.column').dataset.id;
            const action = btn.dataset.action;

            if (action === 'sort') sortColumn(colId);
            if (action === 'color-column') colorColumn(colId);
        });
    });

    document.querySelectorAll('.card-list').forEach((list) => {
        list.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.card');
            if (!cardEl) return;

            const colId = cardEl.closest('.column').dataset.id;
            const cardId = cardEl.dataset.id;

            if (e.target.classList.contains('btn-delete')) {
                removeCard(colId, cardId);
            } else if (e.target.classList.contains('btn-move-left')) {
                moveCard(colId, cardId, -1);
            } else if (e.target.classList.contains('btn-move-right')) {
                moveCard(colId, cardId, 1);
            } else if (e.target.classList.contains('btn-color')) {
                colorCard(colId, cardId);
            }
        });

        list.addEventListener('input', (e) => {
            if (e.target.classList.contains('card-content')) {
                const cardEl = e.target.closest('.card');
                const colId = cardEl.closest('.column').dataset.id;
                const cardId = cardEl.dataset.id;
                updateCardText(colId, cardId, e.target.innerText);
            }
        });
    });

    loadState();
});
