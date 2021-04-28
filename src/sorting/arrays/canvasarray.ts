import { DrawnArray, HighlightingTheme } from "./visualarray";

export class CanvasArray extends DrawnArray {
    private context: CanvasRenderingContext2D;

    constructor(array: number[], readonly canvas: HTMLCanvasElement, delay?: number, theme?: HighlightingTheme) {
        super(array, delay, theme);

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Canvas not supported");
        }
        this.context = context;
    }

    /**
     * @Override
     */
    update(): void {
        const self = this;

        const length = this.length;
        const context = this.context;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // create copy
        const highlighting = new Map(this.highlighting);

        window.requestAnimationFrame(drawAll);

        /**
         * Should only be called on the first frame or canvas resize
         */
        function drawAll() {
            context.clearRect(0, 0, canvasWidth, canvasHeight);

            // prevent gaps in the bars by starting the rectangle where the last one ended
            let x = 0;

            self.array.forEach((value, index) => {
                const hIndex = highlighting.get(index);

                // mutiply then divide for extra precision
                const nextX = Math.round((canvasWidth * (index + 1)) / length);
                const width = nextX - x;
                const height = (canvasHeight * value) / length;

                drawRectangle(x, 0, width, height, hIndex?.highlighting || self.theme.DEFAULT);

                if (hIndex?.isTemporary) {
                    self.unmark(index);
                }

                // update x
                x = nextX;
            });
        }

        /**
         * for internal use
         * @param y - starts from the bottom of the canvas
         */
        function drawRectangle(x: number, y: number, w: number, h: number, style: string) {
            context.fillStyle = style;
            context.fillRect(x, canvasHeight - y - h, w, h);
        }
    }
}
