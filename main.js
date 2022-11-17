function plot(data) {
    let layout = {
        hovermode: false,
        showlegend: false,
        margin: {l: 30, r: 30, b: 30, t: 30},
        scene: {
            xaxis: {range: [0, 100], title: "H"},
            yaxis: {range: [0, 100], title: "S"},
            zaxis: {range: [0, 100], title: "L"}
        }
    };
    let config = {
        displayModeBar: false
    };
    Plotly.newPlot("chart", data, layout, config);
}

function convertColor(color) {
    let rgb = hslToRgb(color[0]/100, color[1]/100, color[2]/100);
    return {
        x: [color[0]], y: [color[1]], z: [color[2]],
        mode: "markers", type: "scatter3d",
        marker: {
            color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
            size: 8, symbol: "circle", opacity: 1
        }
    };
}

function traceColors(colorList) {
    let trace = [];
    for(let c in colorList) {
        trace.push(convertColor(colorList[c]));
    }
    return trace;
}

function reduceArray(arr, amount) {
    let step = Math.ceil(arr.length/amount);
    return arr.filter((_, i) => (i%step) == 0);
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h*100), Math.round(s*100), Math.round(l*100)];
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function mapImage(image) {
    let canvas    = document.getElementById("canvas");
    canvas.width  = image.width;
    canvas.height = image.height;

    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    let colorArray = [];
    for(let y=0; y < image.width; y++) {
        for(let x=0; x < image.height; x++) {
            let index = (y*imageData.width + x) * 4;
            colorArray.push(rgbToHsl(imageData.data[index], imageData.data[index+1], imageData.data[index+2]));
        }
    }

    let colors = reduceArray(colorArray, 100);
    plot(traceColors(colors));
}

function bindImageLoader() {
    let image_input = document.getElementById("image");
    image_input.onchange = (e) => {
        let loadedFile = e.target.files[0];

        if (FileReader && loadedFile) {
            let fileReader = new FileReader();
            fileReader.onload = function () {
                let image = document.getElementById("image-loader");
                image.src = fileReader.result;
                image.onload = () => {
                    mapImage(image);
                }
            }
            fileReader.readAsDataURL(loadedFile);
        }
    }
}

bindImageLoader();
