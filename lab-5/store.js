import { generateId, randomColor } from './helpers.js';

class Store {
    constructor() {
        this.state = {
            shapes: [],
        };
        this.observers = [];
        this.STORAGE_KEY = 'shapes-app-state';

        this.loadState();
    }

    subscribe(observerFunction) {
        this.observers.push(observerFunction);
    }

    notify() {
        this.saveState();
        this.observers.forEach((observer) => observer(this.state));
    }

    addShape(type) {
        const newShape = {
            id: generateId(),
            type: type,
            color: randomColor(),
        };
        this.state.shapes.push(newShape);
        this.notify();
    }

    removeShape(id) {
        this.state.shapes = this.state.shapes.filter(
            (shape) => shape.id !== id
        );
        this.notify();
    }

    recolorShapes(type) {
        this.state.shapes.forEach((shape) => {
            if (shape.type === type) {
                shape.color = randomColor();
            }
        });
        this.notify();
    }

    get stats() {
        return {
            squares: this.state.shapes.filter((s) => s.type === 'square')
                .length,
            circles: this.state.shapes.filter((s) => s.type === 'circle')
                .length,
        };
    }

    saveState() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Błąd zapisu do LocalStorage', e);
        }
    }

    loadState() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('Błąd odczytu LocalStorage', e);
            }
        }
    }
}

export const store = new Store();
