import { store } from './store.js';

const board = document.getElementById('board');
const cntSquares = document.getElementById('cntSquares');
const cntCircles = document.getElementById('cntCircles');

const render = (state) => {
    const shapes = state.shapes;

    const stats = store.stats;
    cntSquares.textContent = stats.squares;
    cntCircles.textContent = stats.circles;

    const currentDomElements = Array.from(board.children);
    currentDomElements.forEach((el) => {
        const id = el.dataset.id;
        const existsInStore = shapes.find((s) => s.id === id);

        if (!existsInStore) {
            el.remove();
        }
    });

    shapes.forEach((shape) => {
        let el = document.querySelector(`.shape[data-id="${shape.id}"]`);

        if (!el) {
            el = document.createElement('div');
            el.className = `shape ${shape.type}`;
            el.dataset.id = shape.id;
            el.style.backgroundColor = shape.color;
            board.appendChild(el);
        } else {
            if (el.style.backgroundColor !== shape.color) {
                el.style.backgroundColor = shape.color;
            }
        }
    });
};

export const initUI = () => {
    document.getElementById('addSquare').addEventListener('click', () => {
        store.addShape('square');
    });

    document.getElementById('addCircle').addEventListener('click', () => {
        store.addShape('circle');
    });

    document.getElementById('recolorSquares').addEventListener('click', () => {
        store.recolorShapes('square');
    });

    document.getElementById('recolorCircles').addEventListener('click', () => {
        store.recolorShapes('circle');
    });

    board.addEventListener('click', (e) => {
        if (e.target.classList.contains('shape')) {
            const id = e.target.dataset.id;
            store.removeShape(id);
        }
    });

    store.subscribe(render);

    render(store.state);
};
