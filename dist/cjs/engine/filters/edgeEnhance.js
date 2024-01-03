"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.edgeEnhance = void 0;
const exports_1 = require("../../export/exports.js");
const exports_2 = require("../../export/exports.js");
const edgeEnhance = function (canvas, ctx, originalImage, texture, data) {
    if (!texture._filterImageDrawn || !data || !data.cumulative) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImage, 0, 0);
        texture._filterImageDrawn = true;
    }
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (!imgData)
        return;
    // Apply the filter and then put the new pixel data
    const imageData = (0, exports_1.convoluteHelper)(imgData, [0, 0, 0, -1, 1, 0, 0, 0, 0], true);
    if (!imageData)
        return;
    ctx.putImageData(imageData, 0, 0);
};
exports.edgeEnhance = edgeEnhance;
exports_2.igeFilters.registerFilter("edgeEnhance", exports.edgeEnhance);
