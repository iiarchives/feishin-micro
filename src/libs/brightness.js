function checkImageBrightness(image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let light = 0, dark = 0;
    for (let x = 0, len = data.length; x < len; x += 4) {
        const max_rgb = Math.max(Math.max(data[x], data[x + 1]), data[x + 2]);
        if (max_rgb < 128) dark++;
        else light++;
    }
    return ((light - dark) / (image.width * image.height)) + 0.2 < 0;
}
