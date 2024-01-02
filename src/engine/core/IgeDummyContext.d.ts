export declare const undefinedMethod: () => void;
export declare const nullMethod: () => null;
export declare class IgeDummyContext {
	dummy: boolean;
	imageSmoothingEnabled: boolean;
	globalAlpha: number;
	fillStyle: CanvasRenderingContext2D["fillStyle"];
	strokeStyle?: CanvasRenderingContext2D["strokeStyle"];
	shadowColor?: CanvasRenderingContext2D["shadowColor"];
	shadowBlur?: CanvasRenderingContext2D["shadowBlur"];
	shadowOffsetX?: CanvasRenderingContext2D["shadowOffsetX"];
	shadowOffsetY?: CanvasRenderingContext2D["shadowOffsetY"];
	lineWidth?: CanvasRenderingContext2D["lineWidth"];
	textAlign?: CanvasRenderingContext2D["textAlign"];
	textBaseline?: CanvasRenderingContext2D["textBaseline"];
	font?: CanvasRenderingContext2D["font"];
	globalCompositeOperation?: string;
	lineCap?: CanvasRenderingContext2D["lineCap"];
	save: () => void;
	restore: () => void;
	translate: () => void;
	rotate: () => void;
	scale: () => void;
	drawImage: () => void;
	fillRect: () => void;
	strokeRect: () => void;
	stroke: () => void;
	fill: () => void;
	rect: () => void;
	moveTo: () => void;
	lineTo: () => void;
	arc: () => void;
	arcTo: () => void;
	clearRect: () => void;
	beginPath: () => void;
	closePath: () => void;
	clip: () => void;
	transform: () => void;
	setTransform: () => void;
	fillText: () => void;
	createImageData: () => void;
	createPattern: () => null;
	getImageData: () => void;
	putImageData: () => void;
	strokeText: () => void;
	createLinearGradient: () => void;
	measureText: () => {
		width: number;
		height: number;
	};
}
